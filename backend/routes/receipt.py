# backend/routes/receipts.py
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, Field
from sqlmodel import Session
from sqlalchemy import text
from typing import Optional, List
import hmac, hashlib, json

from database import get_session
from .zalopay import create_zalopay_order, query_zalopay_order, config as zp_config
from routes.mail_service import send_ticket_email, send_receipt_email_helper

router = APIRouter(
    prefix="/receipts",
    tags=["receipts"]
)

class ProductItem(BaseModel):
    product_id: int
    quantity: int

class TicketItem(BaseModel):
    movie_id: int
    showtime_id: int
    branch_id: int
    hall_number: int
    seat_number: str
    price: float

class CreateReceiptRequest(BaseModel):
    receipt_date: str = Field(..., description="dd/mm/yyyy")
    method: str
    customer_id: int
    cv_id: Optional[int] = None
    
    products: List[ProductItem] = []
    tickets: List[TicketItem] = []

class ReceiptCreateOut(BaseModel):
    message: str
    code: int
    receipt_id: int
    payment_url: Optional[str] = None


@router.post("/", response_model=ReceiptCreateOut)
def create_receipt_endpoint(
    data: CreateReceiptRequest,
    session: Session = Depends(get_session)
):
    """
    Create a receipt with products and tickets.
    
    The stored procedure create_receipt expects one product and one ticket per call.
    We'll call it for each ticket, and handle products separately if needed.
    """
    try:
        receipt_id = None
        
        # Validate that we have at least one ticket or product
        if not data.tickets and not data.products:
            raise HTTPException(
                status_code=400, 
                detail="Receipt must contain at least one ticket or product"
            )
        
        # Strategy: Call create_receipt for the first ticket (if exists)
        # This creates the receipt and first ticket
        # Then add remaining tickets and all products separately
        
        if data.tickets:
            # Call create_receipt with first ticket
            first_ticket = data.tickets[0]
            first_product = data.products[0] if data.products else None
            
            # Determine initial status
            initial_status = "Paid" if data.method != "ZALOPAY" else "Pending"
            
            # Get the created receipt ID from the stored procedure result
            result = session.exec(text("""
                CALL create_receipt(
                    :receipt_date, :method, :status, :customer_id, :cv_id,
                    :product_id, :quantity,
                    :price, :movie_id, :showtime_id, :branch_id, :hall_number, :seat_number
                )
            """), params={
                "receipt_date": data.receipt_date,
                "method": data.method,
                "status": initial_status,
                "customer_id": data.customer_id,
                "cv_id": data.cv_id,
                "product_id": first_product.product_id if first_product else None,
                "quantity": first_product.quantity if first_product else None,
                "price": first_ticket.price,
                "movie_id": first_ticket.movie_id,
                "showtime_id": first_ticket.showtime_id,
                "branch_id": first_ticket.branch_id,
                "hall_number": first_ticket.hall_number,
                "seat_number": first_ticket.seat_number
            }).first()
            
            receipt_id = result[0] if result else None
            
            if not receipt_id:
                raise Exception("Failed to create receipt")
            
            # Add remaining tickets (if any)
            for ticket in data.tickets[1:]:
                session.exec(text("""
                    CALL create_ticket(
                        :price, :receipt_id, :movie_id, :showtime_id, 
                        :branch_id, :hall_number, :seat_number
                    )
                """), params={
                    "price": ticket.price,
                    "receipt_id": receipt_id,
                    "movie_id": ticket.movie_id,
                    "showtime_id": ticket.showtime_id,
                    "branch_id": ticket.branch_id,
                    "hall_number": ticket.hall_number,
                    "seat_number": ticket.seat_number
                })
            
            # Add remaining products (if any)
            for product in data.products[1:] if first_product else data.products:
                session.exec(text("""
                    CALL create_order_product(:receipt_id, :product_id, :quantity)
                """), params={
                    "receipt_id": receipt_id,
                    "product_id": product.product_id,
                    "quantity": product.quantity
                })
        
        else:
            # No tickets, only products - need to create receipt header manually
            rec_date_query = text("SELECT STR_TO_DATE(:date, '%d/%m/%Y')")
            rec_date_result = session.exec(rec_date_query, params={"date": data.receipt_date}).first()
            rec_date = rec_date_result[0] if rec_date_result else None
            
            if not rec_date:
                raise HTTPException(status_code=400, detail="Invalid date format. Use dd/mm/yyyy")
            
            # Determine initial status
            initial_status = "Paid" if data.method != "ZALOPAY" else "Pending"
            
            # Insert receipt header
            insert_query = text("""
                INSERT INTO Receipt(Receipt_date, Method, Status, Customer_id, CV_id)
                VALUES (:date, :method, :status, :customer_id, :cv_id)
            """)
            session.exec(insert_query, params={
                "date": rec_date,
                "method": data.method,
                "status": initial_status,
                "customer_id": data.customer_id,
                "cv_id": data.cv_id
            })
            
            result = session.exec(text("SELECT LAST_INSERT_ID()")).first()
            receipt_id = result[0] if result else None
            
            if not receipt_id:
                raise Exception("Failed to create receipt")
            
            # Add all products
            for product in data.products:
                session.exec(text("""
                    CALL create_order_product(:receipt_id, :product_id, :quantity)
                """), params={
                    "receipt_id": receipt_id,
                    "product_id": product.product_id,
                    "quantity": product.quantity
                })
            
            # Update voucher if used
            if data.cv_id:
                session.exec(text("""
                    UPDATE CustomerVoucher
                    SET Status = 'Used'
                    WHERE Customer_id = :customer_id AND CV_id = :cv_id
                """), params={
                    "customer_id": data.customer_id,
                    "cv_id": data.cv_id
                })
        
        session.commit()
        
        # --- ZaloPay Integration ---
        payment_url = None
        if data.method == "ZALOPAY":
            # Calculate total amount
            total_amount = 0
            items = []
            
            for t in data.tickets:
                total_amount += t.price
                items.append({
                    "itemid": f"TKT_{t.showtime_id}",
                    "itemname": f"Ticket {t.seat_number}",
                    "itemprice": int(t.price),
                    "itemquantity": 1
                })
            
            for p in data.products:
                # Fetch product price and name from DB
                prod_data = session.exec(text("SELECT Name, Price FROM Product WHERE Product_id = :pid"), params={"pid": p.product_id}).first()
                p_name = prod_data[0] if prod_data else "Product"
                p_price = float(prod_data[1]) if prod_data else 0
                
                total_amount += p_price * p.quantity
                items.append({
                    "itemid": f"PRD_{p.product_id}",
                    "itemname": p_name,
                    "itemprice": int(p_price), 
                    "itemquantity": p.quantity
                })
            
            # Apply Voucher Discount to total_amount
            if data.cv_id:
                voucher_query = text("""
                    SELECT v.Discount 
                    FROM Voucher v 
                    JOIN CustomerVoucher cv ON v.Voucher_id = cv.Voucher_id 
                    WHERE cv.CV_id = :cvid
                """)
                v_row = session.exec(voucher_query, params={"cvid": data.cv_id}).first()
                if v_row:
                    discount_percent = float(v_row[0])
                    total_amount = total_amount * (1 - discount_percent / 100)
            
            # ZaloPay requires amount to be at least 1
            total_amount = max(1, int(total_amount))

            # Construct URLs for frontend
            frontend_url = "http://localhost:3000"
            redirect_url = f"{frontend_url}/bookings/confirmation?bookingId={receipt_id}"
            callback_url = "http://localhost:8000/receipts/callback" 
            
            print(f"[ZaloPay] Creating order for Receipt #{receipt_id}, Amount: {total_amount}")
            zp_result = create_zalopay_order(
                total_amount, items, receipt_id, 
                redirect_url=redirect_url,
                callback_url=callback_url
            )
            
            print(f"[ZaloPay] Response: {zp_result}")
            
            if zp_result.get("returncode") == 1:
                payment_url = zp_result.get("orderurl")
            else:
                error_msg = zp_result.get("returnmessage", "Unknown error")
                print(f"[ZaloPay] Creation Failed: {error_msg}")
                raise HTTPException(status_code=400, detail=f"ZaloPay Error: {error_msg}")

        # --- Send ticket confirmation email ---
        if data.method != "ZALOPAY":
            send_receipt_email_helper(receipt_id, data.customer_id, session, data.tickets)
        # --- End email ---
        
        return {
            "message": "Receipt created successfully",
            "code": 200,
            "receipt_id": receipt_id,
            "payment_url": payment_url
        }
    
    except HTTPException:
        session.rollback()
        raise
    except Exception as e:
        session.rollback()
        
        detail = str(e)
        if 'ERROR: ' in detail:
            detail = detail.split('ERROR: ')[-1].split("'")[0]
        
        raise HTTPException(status_code=400, detail=detail)

@router.get("/{receipt_id}/status")
def get_receipt_status(receipt_id: int, session: Session = Depends(get_session)):
    query = text("SELECT Status, Method, Customer_id, Receipt_date FROM Receipt WHERE Receipt_id = :rid")
    row = session.exec(query, params={"rid": receipt_id}).first()
    
    if not row:
        raise HTTPException(status_code=404, detail="Receipt not found")
    
    status, method, customer_id, r_date = row
    
    # If still Pending and it's ZaloPay, try to verify with ZaloPay directly
    if status == "Pending" and method == "ZALOPAY":
        # Format: yyMMdd_receipt_id
        app_trans_id = "{:%y%m%d}_{}".format(r_date, receipt_id)
        print(f"[ZaloPay] Querying status for: {app_trans_id}")
        zp_status = query_zalopay_order(app_trans_id)
        print(f"[ZaloPay] Result: {zp_status}")
        
        if zp_status.get("returncode") == 1: # Success
            print(f"[ZaloPay] Payment verified for Receipt #{receipt_id}")
            # Update to Paid
            session.exec(text("UPDATE Receipt SET Status = 'Paid' WHERE Receipt_id = :rid"), params={"rid": receipt_id})
            
            # Get tickets for email
            tickets_query = text("SELECT Seat_number as seat_number FROM Ticket WHERE Receipt_id = :rid")
            tickets_rows = session.exec(tickets_query, params={"rid": receipt_id}).all()
            
            session.commit()
            
            # Send email
            send_receipt_email_helper(receipt_id, customer_id, session, tickets_rows)
            return {"status": "Paid"}
        
        elif zp_status.get("returncode") == 2: # Failed
            print(f"[ZaloPay] Payment FAILED for Receipt #{receipt_id}. Releasing seats...")
            # Delete the receipt (cascades to tickets in DB)
            session.exec(text("DELETE FROM Receipt WHERE Receipt_id = :rid"), params={"rid": receipt_id})
            session.commit()
            return {"status": "Failed"}
            
    return {"status": status}

@router.post("/callback")
async def zalopay_callback(request: Request, session: Session = Depends(get_session)):
    result = {}
    try:
        cb_data = await request.json()
        data_str = cb_data.get("data")
        mac = cb_data.get("mac")
        
        # Verify MAC using Key2
        expected_mac = hmac.new(zp_config['key2'].encode(), data_str.encode(), hashlib.sha256).hexdigest()
        
        if mac != expected_mac:
            result['returncode'] = -1
            result['returnmessage'] = 'mac not equal'
        else:
            # Payment successful
            data_json = json.loads(data_str)
            app_trans_id = data_json.get("apptransid") # format: yyMMdd_receipt_id
            
            try:
                receipt_id = int(app_trans_id.split("_")[1])
                
                # Get receipt info to update status and send email
                receipt_query = text("SELECT Customer_id FROM Receipt WHERE Receipt_id = :rid")
                receipt_row = session.exec(receipt_query, params={"rid": receipt_id}).first()
                
                if receipt_row:
                    customer_id = receipt_row[0]
                    
                    # Update Receipt status to Paid
                    session.exec(text("UPDATE Receipt SET Status = 'Paid' WHERE Receipt_id = :rid"), params={"rid": receipt_id})
                    
                    # Get tickets for email
                    tickets_query = text("SELECT Seat_number as seat_number FROM Ticket WHERE Receipt_id = :rid")
                    tickets_rows = session.exec(tickets_query, params={"rid": receipt_id}).all()
                    
                    session.commit()
                    
                    # Send email after successful payment
                    send_receipt_email_helper(receipt_id, customer_id, session, tickets_rows)
                
                result['returncode'] = 1
                result['returnmessage'] = 'success'
            except Exception as e:
                result['returncode'] = 0
                result['returnmessage'] = str(e)
                
    except Exception as e:
        result['returncode'] = 0
        result['returnmessage'] = str(e)
        
    return result


@router.delete("/{receipt_id}")
def delete_receipt(receipt_id: int, session: Session = Depends(get_session)):
    query = text("SELECT CV_id, Customer_id FROM Receipt WHERE Receipt_id = :rid")
    row = session.exec(query, params={"rid": receipt_id}).first()
    
    if not row:
        raise HTTPException(status_code=404, detail="Receipt not found")
    
    cv_id, customer_id = row
    
    # Revert voucher if any
    if cv_id:
        session.exec(text("""
            UPDATE CustomerVoucher 
            SET Status = 'Unused' 
            WHERE Customer_id = :cid AND CV_id = :cvid
        """), params={"cid": customer_id, "cvid": cv_id})
    
    # Get ticket info before deleting to release seats in ShowtimeSeat
    tickets = session.exec(text("""
        SELECT Movie_id, Showtime_id, Branch_id, Hall_number, Seat_number 
        FROM Ticket WHERE Receipt_id = :rid
    """), params={"rid": receipt_id}).all()

    for t in tickets:
        session.exec(text("""
            UPDATE ShowtimeSeat 
            SET Status = 'AVAILABLE' 
            WHERE Movie_id = :mid AND Showtime_id = :sid AND Branch_id = :bid 
              AND Hall_number = :hid AND Seat_number = :sn
        """), params={
            "mid": t.Movie_id, "sid": t.Showtime_id, "bid": t.Branch_id,
            "hid": t.Hall_number, "sn": t.Seat_number
        })

    # Manually delete dependent records because DB doesn't have ON DELETE CASCADE
    session.exec(text("DELETE FROM Ticket WHERE Receipt_id = :rid"), params={"rid": receipt_id})
    session.exec(text("DELETE FROM OrderProduct WHERE Receipt_id = :rid"), params={"rid": receipt_id})

    # Delete receipt
    session.exec(text("DELETE FROM Receipt WHERE Receipt_id = :rid"), params={"rid": receipt_id})
    session.commit()
    
    return {"message": "Receipt deleted and seats released"}

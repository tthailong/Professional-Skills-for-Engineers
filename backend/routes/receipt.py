# backend/routes/receipts.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from sqlmodel import Session
from sqlalchemy import text
from typing import Optional, List

from database import get_session

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
            
            # Get the created receipt ID from the stored procedure result
            result = session.exec(text("""
                CALL create_receipt(
                    :receipt_date, :method, :customer_id, :cv_id,
                    :product_id, :quantity,
                    :price, :movie_id, :showtime_id, :branch_id, :hall_number, :seat_number
                )
            """), params={
                "receipt_date": data.receipt_date,
                "method": data.method,
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
            
            # Insert receipt header
            insert_query = text("""
                INSERT INTO Receipt(Receipt_date, Method, Customer_id, CV_id)
                VALUES (:date, :method, :customer_id, :cv_id)
            """)
            session.exec(insert_query, params={
                "date": rec_date,
                "method": data.method,
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
        
        return {
            "message": "Receipt created successfully",
            "code": 200,
            "receipt_id": receipt_id
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
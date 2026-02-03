from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from database import get_session
from sqlalchemy import text

router = APIRouter(
    prefix="/customers", 
    tags=["customers"]
)

@router.get("/{customer_id}/membership")
def get_membership_privileges(
    customer_id: int, 
    session: Session = Depends(get_session)
):
    # 1. Get Customer + Membership info
    # We can join Customer and Membership here since Membership_id is NOT NULL in Customer
    cm_query = text("""
        SELECT 
            c.Customer_id, c.Loyal_point, c.FName, c.LName,
            m.Membership_id, m.Type, m.Start_Date
        FROM Customer c
        JOIN Membership m ON c.Membership_id = m.Membership_id
        WHERE c.Customer_id = :cid
    """)
    customer_row = session.exec(cm_query.params(cid=customer_id)).first()

    if not customer_row:
        raise HTTPException(status_code=404, detail="Customer not found")

    # 2. Get Privileges
    p_query = text("""
        SELECT 
            p.Privilege_id, p.Name, p.Expiration, p.Description
        FROM Access a
        JOIN Privilege p ON p.Privilege_id = a.Privilege_id
        WHERE a.Membership_id = :mid
    """)
    privilege_rows = session.exec(p_query.params(mid=customer_row.Membership_id)).all()

    privileges = [
        {
            "privilege_id": r.Privilege_id,
            "name": r.Name,
            "expiration": str(r.Expiration),
            "description": r.Description,
        }
        for r in privilege_rows
    ]

    membership_block = {
        "points": customer_row.Loyal_point,
        "membership_id": customer_row.Membership_id,
        "type": customer_row.Type,
        "start_date": str(customer_row.Start_Date),
        "privileges": privileges
    }

    #Reviews
    review_query = text("""
        SELECT
            r.Movie_id AS movie_id,
            m.Title AS title,
            r.Rating AS rating,
            r.Date_comment AS date,
            r.Comment AS comment
        FROM Review r
        JOIN Movie m ON m.Movie_id = r.Movie_id
        WHERE r.Customer_id = :cid
    """)

    review_rows = session.exec(review_query.params(cid=customer_id)).all()

    reviews = [
        {
            "movie_id": r.movie_id,
            "title": r.title,
            "rating": float(r.rating),
            "date": str(r.date),
            "comment": r.comment
        }
        for r in review_rows
    ]

    # --- RECEIPTS ---
    receipt_query = text("""
        SELECT
            r.Receipt_id AS receipt_id,
            DATE_FORMAT(r.Receipt_date, '%d/%m/%Y') AS receipt_date,
            r.Method AS method,
            r.CV_id AS voucher_id
        FROM Receipt r
        WHERE r.Customer_id = :cid
        ORDER BY r.Receipt_id DESC
    """)

    receipt_rows = session.exec(receipt_query.params(cid=customer_id)).all()

    # --- TICKETS (GROUP BY RECEIPT) ---
    ticket_query = text("""
        SELECT 
            t.Receipt_id AS receipt_id,
            t.Ticket_id AS ticket_id,
            t.Price AS price,

            m.Title AS movie_title,
            DATE_FORMAT(s.Date, '%d/%m/%Y') AS show_date,
            s.Start_time AS start_time,

            cb.Name AS branch_name,
            t.Hall_number AS hall_number,
            t.Seat_number AS seat_number
        FROM Ticket t
        JOIN Movie m ON m.Movie_id = t.Movie_id
        JOIN Showtime s 
            ON s.Movie_id = t.Movie_id 
            AND s.Showtime_id = t.Showtime_id
        JOIN Cinema_Branch cb ON cb.Branch_id = t.Branch_id
        WHERE t.Receipt_id IN (
            SELECT Receipt_id FROM Receipt WHERE Customer_id = :cid
        )
        ORDER BY t.Ticket_id
    """)

    ticket_rows = session.exec(ticket_query.params(cid=customer_id)).all()

    # Build map: receipt_id → list of tickets
    ticket_map = {}
    for r in ticket_rows:
        ticket_map.setdefault(r.receipt_id, []).append({
            "ticket_id": r.ticket_id,
            "price": float(r.price),
            "movie_title": r.movie_title,
            "showtime": {
                "date": r.show_date,
                "start": str(r.start_time)
            },
            "branch_name": r.branch_name,
            "hall": r.hall_number,
            "seat": r.seat_number
        })


    # --- PRODUCTS (GROUP BY RECEIPT) ---
    product_query = text("""
        SELECT 
            op.Receipt_id AS receipt_id,
            p.Product_id AS product_id,
            p.Name AS product_name,
            p.Price AS price,
            op.Quantity AS quantity
        FROM OrderProduct op
        JOIN Product p ON p.Product_id = op.Product_id
        WHERE op.Receipt_id IN (
            SELECT Receipt_id FROM Receipt WHERE Customer_id = :cid
        )
    """)

    product_rows = session.exec(product_query.params(cid=customer_id)).all()

    product_map = {}
    for r in product_rows:
        product_map.setdefault(r.receipt_id, []).append({
            "product_id": r.product_id,
            "name": r.product_name,
            "price": float(r.price),
            "quantity": r.quantity
        })


    # --- JOIN RECEIPT + TICKET + PRODUCT ---
    receipts = []
    for r in receipt_rows:
        current_tickets = ticket_map.get(r.receipt_id, [])
        current_products = product_map.get(r.receipt_id, [])
        
        # Calculate total amount
        total_tickets = sum(t["price"] for t in current_tickets)
        total_products = sum(p["price"] * p["quantity"] for p in current_products)
        total_amount = total_tickets + total_products

        receipts.append({
            "receipt_id": r.receipt_id,
            "date": r.receipt_date + " 00:00:00",
            "method": r.method,
            "voucher_id": r.voucher_id,
            "tickets": current_tickets,
            "products": current_products,
            "total_amount": total_amount
        })

    return {
        "customer_id": customer_row.Customer_id,
        "full_name": f"{customer_row.FName} {customer_row.LName}",
        "membership": membership_block,
        "reviews": reviews,
        "receipts": receipts
    }

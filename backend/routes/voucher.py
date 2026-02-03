from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from sqlmodel import Session
from sqlalchemy import text
from database import get_session

router = APIRouter(
    prefix="/vouchers",
    tags=["vouchers"]
)

class CustomerVoucherOut(BaseModel):
    CV_id: int
    Voucher_id: int
    Status: str
    Discount: float
    Expiration: str   # dd/mm/YYYY
    Condition: str
    Description: str


@router.get("/{customer_id}", response_model=List[CustomerVoucherOut])
def get_customer_vouchers(
    customer_id: int,
    session: Session = Depends(get_session)
):
    try:
        sql = text("""
            SELECT 
                cv.CV_id,
                cv.Voucher_id,
                cv.Status,
                v.Discount,
                DATE_FORMAT(v.Expiration, '%d/%m/%Y') AS Expiration,
                v.`Condition`,
                v.`Description`
            FROM CustomerVoucher cv
            JOIN Voucher v 
                ON cv.Voucher_id = v.Voucher_id
            WHERE cv.Customer_id = :cid
            ORDER BY cv.CV_id
        """)

        rows = session.exec(sql, params={"cid": customer_id}).mappings().all()

        if not rows:
            raise HTTPException(
                status_code=404,
                detail="No vouchers found for this customer"
            )

        # Trả về LIST
        return [
            {
                "CV_id": row["CV_id"],
                "Voucher_id": row["Voucher_id"],
                "Status": row["Status"],
                "Discount": float(row["Discount"]),
                "Expiration": row["Expiration"],   # '31/12/2025'
                "Condition": row["Condition"],
                "Description": row["Description"]
            }
            for row in rows
        ]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

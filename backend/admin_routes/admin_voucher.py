from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlmodel import Session
from typing import Optional, List
from sqlalchemy import text
from database import get_session

router = APIRouter(
    prefix="/admin/vouchers",
    tags = ["movies - admin"]
)

class VoucherCreate(BaseModel):
    discount: float
    expiration: str       # dd/mm/yyyy
    description: Optional[str] = None
    condition: str


class VoucherUpdate(BaseModel):
    discount: Optional[float] = None
    expiration: Optional[str] = None
    description: Optional[str] = None
    condition: Optional[str] = None



# CREATE
@router.post("/")
def create_voucher_api(
    data: VoucherCreate,
    session: Session = Depends(get_session)
):
    """
    Call PROCEDURE: create_voucher(
        p_discount, input_expiration, p_description, p_condition
    )
    """
    try:
        proc = text("""
            CALL create_voucher(
                :p_discount,
                :input_expiration,
                :p_description,
                :p_condition
            )
        """)

        session.exec(proc, params={
            "p_discount": data.discount,
            "input_expiration": data.expiration,
            "p_description": data.description,
            "p_condition": data.condition
        })

        session.commit()
        return {"message": "Voucher created successfully"}

    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))



# UPDATE
@router.put("/{voucher_id}")
def update_voucher_api(
    voucher_id: int,
    data: VoucherUpdate,
    session: Session = Depends(get_session)
):
    """
    Call PROCEDURE: update_voucher(
        p_voucher_id, p_discount, input_expiration, p_description, p_condition
    )
    """
    try:
        proc = text("""
            CALL update_voucher(
                :p_voucher_id,
                :p_discount,
                :input_expiration,
                :p_description,
                :p_condition
            )
        """)

        session.exec(proc, params={
            "p_voucher_id": voucher_id,
            "p_discount": data.discount,
            "input_expiration": data.expiration,
            "p_description": data.description,
            "p_condition": data.condition
        })

        session.commit()
        return {
            "message": "Voucher updated successfully",
            "voucher_id": voucher_id
        }

    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))



# DELETE
@router.delete("/{voucher_id}")
def delete_voucher_api(
    voucher_id: int,
    session: Session = Depends(get_session)
):
    """
    Call PROCEDURE: delete_voucher(p_voucher_id)
    """
    try:
        proc = text("CALL delete_voucher(:p_voucher_id)")

        session.exec(proc, params={"p_voucher_id": voucher_id})
        session.commit()

        return {
            "message": "Voucher deleted successfully",
            "voucher_id": voucher_id
        }

    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# GET ALL
@router.get("/")
def get_all_vouchers(session: Session = Depends(get_session)):
    try:
        query = text("SELECT * FROM Voucher")
        return session.exec(query).mappings().all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



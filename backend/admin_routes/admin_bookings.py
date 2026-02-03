from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlmodel import Session
from sqlalchemy import text
from typing import List, Optional
from database import get_session

router = APIRouter(
    prefix="/admin/bookings",
    tags=["Admin Bookings"]
)

class BookingOut(BaseModel):
    Receipt_id: int
    Customer_Name: str
    Movie_Title: Optional[str] = None
    Seats: Optional[str] = None
    Date: str
    Total_Amount: float

@router.get("/all", response_model=List[BookingOut])
def get_all_bookings(session: Session = Depends(get_session)):
    """
    Fetch all bookings (receipts) with details.
    """
    try:
        proc = text("CALL get_all_receipts()")
        result = session.exec(proc).mappings().all()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/branch/{branch_id}", response_model=List[BookingOut])
def get_bookings_by_branch(branch_id: int, session: Session = Depends(get_session)):
    """
    Fetch bookings for a specific branch.
    """
    try:
        proc = text("CALL get_receipts_by_branch(:branch_id)")
        result = session.exec(proc, params={"branch_id": branch_id}).mappings().all()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


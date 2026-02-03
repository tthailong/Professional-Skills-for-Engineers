from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlmodel import Session
from typing import Optional, List
from sqlalchemy import text
from database import get_session

router = APIRouter(
    prefix="/events",
    tags =["events - publics"]
)

class EventOut(BaseModel):
    Event_id: int
    Start_date: Optional[str] = None
    End_date: Optional[str] = None
    Title: str
    Image: Optional[str] = None
    Description: str
    Type: str

@router.get("/", response_model=List[EventOut])
def get_events(
    session: Session = Depends(get_session)
):
    try:
        base_query = """
            SELECT 
                Event_id,
                DATE_FORMAT(Start_date, '%d/%m/%Y') AS Start_date,
                DATE_FORMAT(End_date, '%d/%m/%Y') AS End_date,
                Title,
                Image,
                Description,
                Type
            FROM Event
        """


        base_query += " ORDER BY Event_id ASC"

        result = session.exec(text(base_query))
        rows = result.mappings().all()   # list[dict-like]

        return rows

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/{event_id}", response_model=EventOut)
def get_movie_by_id(
    event_id: int,
    session: Session = Depends(get_session)
):
    try:
        query = text("""
            SELECT 
                Event_id,
                DATE_FORMAT(Start_date, '%d/%m/%Y') AS Start_date,
                DATE_FORMAT(End_date, '%d/%m/%Y') AS End_date,
                Title,
                Image,
                Description,
                Type
            FROM Event
            WHERE Event_id = :mid
        """)

        result = session.exec(query, params={"mid": event_id})
        row = result.mappings().first()

        if not row:
            # Không tìm thấy phim
            raise HTTPException(status_code=404, detail="Event not found")

        return row  # FastAPI tự map sang MovieOut

    except HTTPException:
        # Giữ nguyên 404
        raise
    except Exception as e:
        # Lỗi khác → 500
        raise HTTPException(status_code=500, detail=str(e))
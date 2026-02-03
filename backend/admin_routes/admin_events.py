from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlmodel import Session
from typing import Optional, List
from sqlalchemy import text
from database import get_session

router = APIRouter(
    prefix="/admin/events",
    tags = ["events - admin"]
)

class EventCreate(BaseModel):
    title: str
    description: Optional[str]
    image: Optional[str]
    type: str
    start_date: str
    end_date: str
    admin_id: int        # ⭐ THÊM DÒNG NÀY


@router.post("/create")
def create_event_api(
    data: EventCreate,
    session: Session = Depends(get_session)
):
    try:
        proc = text("""
            CALL create_event(
                :start_date,
                :end_date,
                :title,
                :image,
                :description,
                :admin_id,
                :type
            )
        """)

        session.exec(proc, params={
            "start_date": data.start_date,
            "end_date": data.end_date,
            "title": data.title,
            "image": data.image,
            "description": data.description,
            "admin_id": data.admin_id,
            "type": data.type
        })

        session.commit()

        return {
            "message": "Event created successfully",
            "title": data.title
        }

    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/update/{event_id}")
def update_event_api(
    event_id: int,
    data: EventCreate,
    session: Session = Depends(get_session)
):
    try:
        proc = text("""
            CALL update_event(
                :event_id,
                :start_date,
                :end_date,
                :title,
                :image,
                :description,
                :admin_id,
                :type
            )
        """)

        session.exec(proc, params={
            "event_id": event_id,
            "start_date": data.start_date,
            "end_date": data.end_date,
            "title": data.title,
            "image": data.image,
            "description": data.description,
            "admin_id": data.admin_id,
            "type": data.type
        })
        session.commit()

        return {"message": "Event updated successfully"}

    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/delete/{event_id}")
def delete_event_api(
    event_id: int,
    session: Session = Depends(get_session)
):
    try:
        proc = text("CALL delete_event(:eid)")
        session.exec(proc, params={"eid": event_id})
        session.commit()

        return {
            "message": "Event deleted successfully",
            "event_id": event_id
        }

    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/all")
def get_all_events(session: Session = Depends(get_session)):
    try:
        # Assuming there is an 'Event' table/model mapping. 
        # Since we are using raw SQL/stored procedures mostly, we might need a raw query if no model exists.
        # Let's check if 'Event' model is imported or available. 
        # Based on previous file view, no 'Event' model was imported from sqlmodel.
        # So I will use text query.
        
        statement = text("SELECT * FROM Event ORDER BY Start_date DESC")
        results = session.exec(statement).all()
        
        events = []
        for row in results:
            # Row is likely a tuple or object depending on driver. 
            # In SQLModel/SQLAlchemy with text(), it usually returns rows accessible by column name or index.
            # Let's assume column names match DB schema: Event_id, Start_date, End_date, Title, Image, Description, Admin_id, Type
            events.append({
                "id": row.Event_id,
                "title": row.Title,
                "poster": row.Image,
                "description": row.Description,
                "startDate": str(row.Start_date),
                "endDate": str(row.End_date),
                "type": row.Type,
                "status": "Upcoming" # Logic can be handled in frontend or here. Frontend has logic already.
            })
            
        return events

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{event_id}")
def get_event_by_id(
    event_id: int,
    session: Session = Depends(get_session)
):
    try:
        statement = text("SELECT * FROM Event WHERE Event_id = :eid")
        result = session.exec(statement, params={"eid": event_id}).first()
        
        if not result:
            raise HTTPException(status_code=404, detail="Event not found")
            
        return {
            "id": result.Event_id,
            "title": result.Title,
            "poster": result.Image,
            "description": result.Description,
            "startDate": str(result.Start_date),
            "endDate": str(result.End_date),
            "type": result.Type,
            "status": "Upcoming" # Frontend will recalculate
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

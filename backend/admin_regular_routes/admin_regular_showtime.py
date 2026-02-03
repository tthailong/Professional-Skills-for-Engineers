from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlmodel import Session
from typing import Optional, List
from sqlalchemy import text
from database import get_session

router = APIRouter(
    prefix="/admin_regular/branch",
    tags = ["branches - admin_regular"]
)

class ShowtimeCreate(BaseModel):
    movie_id: int
    start_time: str       # "10:00:00"
    date: str             # "23/11/2025"
    format: str
    subtitle: str
    hall_number: int

class ShowtimeUpdate(BaseModel):
    movie_id: Optional[int] = None
    start_time: Optional[str] = None
    date: Optional[str] = None
    format: Optional[str] = None
    subtitle: Optional[str] = None
    hall_number: Optional[int] = None

class ShowtimeResponse(BaseModel):
    showtime_id: int
    movie_id: int
    title: str
    start_time: str
    date: str
    format: str
    subtitle: str
    hall_number: int

class HallResponse(BaseModel):
    hall_number: int
    type: str
    capacity: int

@router.get("/halls/{branch_id}", response_model=List[HallResponse])
def get_halls(
    branch_id: int, 
    format: Optional[str] = None,
    session: Session = Depends(get_session)
):
    """
    Get halls for a branch, optionally filtered by format type.
    If format is provided, only halls that support that format are returned.
    """
    if format:
        sql = text("""
            SELECT 
                Hall_number,
                Type,
                Seat_capacity
            FROM Hall
            WHERE Branch_id = :bid
                AND (
                        (:format IN ('STANDARD', '2D') AND Type IN ('Standard', '2D', 'IMAX', '4DX', '3D'))
                        OR (:format = 'IMAX' AND Type = 'IMAX')
                        OR (:format = '4DX' AND Type = '4DX')
                        OR (:format = '3D' AND Type = '3D')
                    )
            ORDER BY Hall_number
        """)
        rows = session.exec(sql, params={"bid": branch_id, "format": format}).all()
    else:
        sql = text("""
            SELECT 
                Hall_number,
                Type,
                Capacity
            FROM Hall
            WHERE Branch_id = :bid
            ORDER BY Hall_number
        """)
        rows = session.exec(sql, params={"bid": branch_id}).all()
    
    return [
        HallResponse(
            hall_number=r[0],
            type=r[1],
            capacity=r[2]
        ) for r in rows
    ]

@router.get("/showtimes/{branch_id}", response_model=List[ShowtimeResponse])
def get_showtimes(branch_id: int, session: Session = Depends(get_session)):
    sql = text("""
        SELECT 
            s.Showtime_id,
            s.Movie_id,
            m.Title,
            s.Start_time,
            DATE_FORMAT(s.Date, '%d/%m/%Y'),
            s.Format,
            s.Subtitle,
            s.Hall_number
        FROM Showtime s
        JOIN Movie m ON s.Movie_id = m.Movie_id
        WHERE s.Branch_id = :bid
        ORDER BY s.Date, s.Start_time;
    """)

    rows = session.exec(sql, params={"bid": branch_id}).all()

    return [
        ShowtimeResponse(
            showtime_id=r[0],
            movie_id=r[1],
            title=r[2],
            start_time=str(r[3]),
            date=r[4],
            format=r[5],
            subtitle=r[6],
            hall_number=r[7]
        ) for r in rows
    ]

@router.post("/showtimes/{branch_id}/create")
def create_showtime_api(
    branch_id: int,
    data: ShowtimeCreate,
    session: Session = Depends(get_session)
):
    try:
        proc = text("""
            CALL create_showtime(
                :movie_id,
                :start_time,
                :date,
                :format,
                :subtitle,
                :branch_id,
                :hall_number
            )
        """)

        session.exec(proc, params={
            "movie_id": data.movie_id,
            "start_time": data.start_time,
            "date": data.date,
            "format": data.format,
            "subtitle": data.subtitle,
            "branch_id": branch_id,
            "hall_number": data.hall_number
        })
        session.commit()

        return {"message": "Showtime created successfully"}

    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/showtimes/{branch_id}/{showtime_id}")
def update_showtime_api(
    branch_id: int,
    showtime_id: int,
    data: ShowtimeUpdate,
    session: Session = Depends(get_session)
):
    try:
        proc = text("""
            CALL update_showtime(
                :showtime_id,
                :movie_id,
                :start_time,
                :date,
                :format,
                :subtitle,
                :branch_id,
                :hall_number
            )
        """)

        session.exec(proc, params={
            "showtime_id": showtime_id,
            "movie_id": data.movie_id,
            "start_time": data.start_time,
            "date": data.date,
            "format": data.format,
            "subtitle": data.subtitle,
            "branch_id": branch_id,
            "hall_number": data.hall_number
        })
        session.commit()

        return {"message": "Showtime updated successfully"}

    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/showtimes/{branch_id}/{movie_id}/{showtime_id}")
def delete_showtime_api(
    branch_id: int,
    movie_id: int,
    showtime_id: int,
    session: Session = Depends(get_session)
):
    try:
        # First verify showtime belongs to branch
        check_sql = text("""
            SELECT 1
            FROM Showtime
            WHERE Showtime_id = :sid
              AND Movie_id = :mid
              AND Branch_id = :bid
        """)

        exists = session.exec(check_sql, params={
            "sid": showtime_id,
            "mid": movie_id,
            "bid": branch_id
        }).first()

        if not exists:
            raise HTTPException(
                status_code=404,
                detail="Showtime does not exist or does not belong to this branch."
            )

        # Call stored procedure
        proc = text("""
            CALL delete_showtime(:mid, :sid)
        """)

        session.exec(proc, params={
            "mid": movie_id,
            "sid": showtime_id
        })
        session.commit()

        return {
            "message": "Showtime deleted successfully",
            "movie_id": movie_id,
            "showtime_id": showtime_id
        }

    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    
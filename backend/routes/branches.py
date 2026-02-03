from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlmodel import Session
from typing import Optional, List
from sqlalchemy import text
from database import get_session
router = APIRouter(
    prefix="/branches",
    tags =["branches - publics"]
)


class BranchOut(BaseModel):
    Branch_id: int
    City: str
    Address: str
    Name: str
    Admin_id: Optional[int] = None
    Phone: Optional[str] = None

class BranchCreate(BaseModel):
    Name: str
    City: str
    Address: str
    Admin_id: Optional[int] = None
    Phone: Optional[str] = None

class BranchUpdate(BaseModel):
    Name: str
    City: str
    Address: str
    Admin_id: Optional[int] = None
    Phone: Optional[str] = None

class ShowtimeInBranchOut(BaseModel):
    Showtime_id: int
    Date: Optional[str] = None
    Start_time: str
    Format: str
    Subtitle: str
    Hall_number: int
    Hall_type: str

class MovieInBranchOut(BaseModel):
    Movie_id: int
    Title: str
    Image: Optional[str] = None
    Release_date: Optional[str] = None  # dd/mm/yyyy
    Language: str
    Age_rating: str
    Duration: Optional[int] = None
    Description: Optional[str] = None
    showtimes: List[ShowtimeInBranchOut] = []

class BranchDetailOut(BaseModel):
    branch: BranchOut
    movies: List[MovieInBranchOut]

class BranchListResponse(BaseModel):
    data: List[BranchOut]
    total: int
    page: int
    limit: int

@router.get("/", response_model=BranchListResponse)
def get_branches(
    search: Optional[str] = None,
    sort_by: Optional[str] = "Branch_id",
    order: Optional[str] = "ASC",
    page: int = 1,
    limit: int = 10,
    session: Session = Depends(get_session)
):
    try:
        # 1. Call the Stored Procedure
        # Note: We use a session variable @total to capture the OUT parameter
        sql = "CALL sp_SearchBranches(:search, :sort_col, :sort_order, :page, :limit, @total)"
        params = {
            "search": search,
            "sort_col": sort_by,
            "sort_order": order,
            "page": page,
            "limit": limit
        }
        
        # Execute the procedure and get the main result set (branches)
        result = session.exec(text(sql), params=params)
        branches = result.mappings().all()
        
        # 2. Get the Total Count from the session variable
        # We need to execute a separate SELECT to get the value of @total
        total_result = session.exec(text("SELECT @total")).first()
        total_count = total_result[0] if total_result else 0

        return {
            "data": branches,
            "total": total_count,
            "page": page,
            "limit": limit
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))    

@router.post("/", response_model=BranchOut)
def create_branch(
    branch: BranchCreate,
    session: Session = Depends(get_session)
):
    try:
        sql = "CALL create_branch(:name, :city, :address, :admin_id, :phone)"
        params = {
            "name": branch.Name,
            "city": branch.City,
            "address": branch.Address,
            "admin_id": branch.Admin_id,
            "phone": branch.Phone
        }
        result = session.exec(text(sql), params=params).mappings().first()
        session.commit()
        return result
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{branch_id}", response_model=BranchOut)
def update_branch(
    branch_id: int,
    branch: BranchUpdate,
    session: Session = Depends(get_session)
):
    try:
        sql = "CALL update_branch(:bid, :name, :city, :address, :admin_id, :phone)"
        params = {
            "bid": branch_id,
            "name": branch.Name,
            "city": branch.City,
            "address": branch.Address,
            "admin_id": branch.Admin_id,
            "phone": branch.Phone
        }
        result = session.exec(text(sql), params=params).mappings().first()
        session.commit()
        return result
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{branch_id}")
def delete_branch(
    branch_id: int,
    session: Session = Depends(get_session)
):
    try:
        sql = "CALL delete_branch(:bid)"
        session.exec(text(sql), params={"bid": branch_id})
        session.commit()
        return {"message": "Branch deleted successfully"}
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{branch_id}", response_model=BranchDetailOut)
def get_movie_by_id(
    branch_id: int,
    session: Session = Depends(get_session)
):
    try:
        # Branch
        branch_sql = """
            SELECT 
                b.Branch_id,
                b.City,
                b.Address,
                b.Name,
                b.Admin_id,
                MAX(bp.BPhone) AS Phone
            FROM Cinema_Branch b
            LEFT JOIN BranchPhone bp ON b.Branch_id = bp.Branch_id
            WHERE b.Branch_id = :bid
            GROUP BY b.Branch_id, b.City, b.Address, b.Name, b.Admin_id
        """
        branch = session.exec(text(branch_sql), params={"bid": branch_id}).mappings().first()

        if not branch:
            raise HTTPException(status_code=404, detail="Branch not found")

        # Lấy phim + suất chiếu của branch
        # Dùng bảng Showtime + Movie + Hall 
        showtime_sql = """
            SELECT
                m.Movie_id,
                m.Title,
                m.Image,
                DATE_FORMAT(m.Release_date, '%d/%m/%Y') AS Release_date,
                m.Language,
                m.Age_rating,
                m.Duration,
                m.Description,

                s.Showtime_id,
                DATE_FORMAT(s.Date, '%d/%m/%Y') AS Date,
                TIME_FORMAT(s.Start_time, '%H:%i') AS Start_time,
                s.Format,
                s.Subtitle,

                h.Hall_number,
                h.Type AS Hall_type

            FROM Showtime s
            JOIN Movie m
                ON m.Movie_id = s.Movie_id
            JOIN Hall h
                ON h.Branch_id = s.Branch_id
               AND h.Hall_number = s.Hall_number

            WHERE s.Branch_id = :bid
            ORDER BY m.Movie_id, s.Date, s.Start_time
        """

        rows = session.exec(text(showtime_sql), params={"bid": branch_id}).mappings().all()

        movies_dict = {}

        for r in rows:
            mid = r["Movie_id"]

            if mid not in movies_dict:
                movies_dict[mid] = {
                    "Movie_id": r["Movie_id"],
                    "Title": r["Title"],
                    "Image": r["Image"],
                    "Release_date": r["Release_date"],
                    "Language": r["Language"],
                    "Age_rating": r["Age_rating"],
                    "Duration": r["Duration"],
                    "Description": r["Description"],
                    "showtimes": []
                }

            movies_dict[mid]["showtimes"].append({
                "Showtime_id": r["Showtime_id"],
                "Date": r["Date"],
                "Start_time": r["Start_time"],
                "Format": r["Format"],
                "Subtitle": r["Subtitle"],
                "Hall_number": r["Hall_number"],
                "Hall_type": r["Hall_type"],
            })

        return {
            "branch": branch,
            "movies": list(movies_dict.values())
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Hall Management Endpoints ---

class HallBase(BaseModel):
    Hall_number: int
    Type: str
    Seat_capacity: int
    Row_count: int
    Col_count: int

class HallCreate(HallBase):
    pass

class HallUpdate(HallBase):
    pass

@router.get("/{branch_id}/halls", response_model=List[HallBase])
def get_halls_by_branch(
    branch_id: int,
    session: Session = Depends(get_session)
):
    try:
        sql = """
            SELECT Branch_id, Hall_number, Type, Seat_capacity, Row_count, Col_count
            FROM Hall
            WHERE Branch_id = :bid
            ORDER BY Hall_number ASC
        """
        result = session.exec(text(sql), params={"bid": branch_id}).mappings().all()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{branch_id}/halls", response_model=HallBase)
def create_hall_endpoint(
    branch_id: int,
    hall: HallCreate,
    session: Session = Depends(get_session)
):
    try:
        sql = "CALL create_hall(:bid, :hnum, :htype, :hcap, :hrow, :hcol)"
        params = {
            "bid": branch_id,
            "hnum": hall.Hall_number,
            "htype": hall.Type,
            "hcap": hall.Seat_capacity,
            "hrow": hall.Row_count,
            "hcol": hall.Col_count
        }
        session.exec(text(sql), params=params)
        session.commit()
        return hall
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{branch_id}/halls/{hall_number}", response_model=HallBase)
def update_hall_endpoint(
    branch_id: int,
    hall_number: int,
    hall: HallUpdate,
    session: Session = Depends(get_session)
):
    try:
        # Ensure the path param matches the body if needed, or just use body
        # The stored procedure update_hall takes (branch_id, hall_number, type, capacity, row, col)
        
        sql = "CALL update_hall(:bid, :hnum, :htype, :hcap, :hrow, :hcol)"
        params = {
            "bid": branch_id,
            "hnum": hall_number, # Use path param for identification
            "htype": hall.Type,
            "hcap": hall.Seat_capacity,
            "hrow": hall.Row_count,
            "hcol": hall.Col_count
        }
        session.exec(text(sql), params=params)
        session.commit()
        
        # Return updated data (constructing from input for response)
        return {
            "Hall_number": hall_number,
            "Type": hall.Type,
            "Seat_capacity": hall.Seat_capacity,
            "Row_count": hall.Row_count,
            "Col_count": hall.Col_count
        }
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{branch_id}/halls/{hall_number}")
def delete_hall_endpoint(
    branch_id: int,
    hall_number: int,
    session: Session = Depends(get_session)
):
    try:
        sql = "CALL delete_hall(:bid, :hnum)"
        session.exec(text(sql), params={"bid": branch_id, "hnum": hall_number})
        session.commit()
        return {"message": "Hall deleted successfully"}
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))
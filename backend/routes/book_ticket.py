from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlmodel import Session
from typing import Optional, List
from sqlalchemy import text
from database import get_session

router = APIRouter(
    prefix="/movies",
    tags =["movies - publics"]
)

class SeatOut(BaseModel):
    Seat_number: str
    Seat_type: str
    Status: str

class ShowtimeOut(BaseModel):
    Showtime_id: int
    Movie_title: str
    Date: str
    Start_time: str

    Format: str
    Subtitle: str

    Branch_id: int
    Branch_name: str
    Branch_address: str

    Hall_number: int
    Hall_type: str

class MovieShortOut(BaseModel):
    Movie_id: int
    Title: str
    Image: str
    Duration: int

class ProductOut(BaseModel):
    Product_id: int
    Name: str
    Price: float
    Description: Optional[str] = None

class BookingPageOut(BaseModel):
    movie: MovieShortOut
    showtime: ShowtimeOut
    seats: List[SeatOut]
    products: List[ProductOut]

@router.get("/{movie_id}/{showtime_id}", response_model=BookingPageOut) 
def get_booking_page( 
    movie_id: int, 
    showtime_id: int, 
    session: Session = Depends(get_session) 
): 
    try: 
        # Movie 
        movie_query = text(""" 
                           SELECT 
                           Movie_id, 
                           Title, Image, 
                           Duration 
                           FROM Movie
                            WHERE Movie_id = :mid """) 
        movie = session.exec(movie_query, params = {"mid": movie_id}).mappings().first() 
        if not movie: 
            raise HTTPException(404, "Movie not found") 
        
        # Showtime 
        showtime_proc = text("CALL GetShowtimeInfo(:mid, :sid)") 
        params1 = {"mid": movie_id, "sid": showtime_id} 
        showtime_result = session.exec(showtime_proc, params=params1) 
        showtime = showtime_result.mappings().first() 
        if not showtime: raise HTTPException(404, "Showtime not found") 

        # Seats 
        seat_proc = text("CALL GetShowtimeSeats(:mid, :sid)") 
        params2 = {"mid": movie_id, "sid": showtime_id} 
        seats_result = session.exec(seat_proc, params = params2) 
        seats = seats_result.mappings().all() 

        # Products
        product_query = text("""
            SELECT 
                Product_id,
                Name,
                Price,
                Description
            FROM Product
        """)
        products = session.exec(product_query).mappings().all()
        return { "movie": movie, 
                "showtime": showtime, 
                "seats": seats,
                 "products": products } 
    except Exception as e: 
        raise HTTPException(500, str(e))



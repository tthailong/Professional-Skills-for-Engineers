from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlmodel import Session
from typing import Optional, List
from sqlalchemy import text
from database import get_session
from datetime import datetime
from model import is_non_spoiler_comment
router = APIRouter(
    prefix="/movies",
    tags =["movies - publics"]
)

class MovieOut(BaseModel):
    Movie_id: int
    Director: str
    Title: str
    Image: Optional[str] = None
    Release_date: Optional[str] = None
    Language: str
    Age_rating: str
    Duration: Optional[int] = None
    Description: Optional[str] = None
    
    # New fields
    Actors: List[str] = []
    Formats: List[str] = []
    Subtitles: List[str] = []
    Genres: List[str] = []

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

class ReviewOut(BaseModel):
    Customer_name: str
    Rating: float
    Comment: str
    Review_date: str

class MovieDetailOut(BaseModel):
    movie: MovieOut
    showtimes: List[ShowtimeOut]
    reviews: List[ReviewOut]


@router.get("/", response_model=List[MovieOut])
def get_movies(
    session: Session = Depends(get_session),
    language: Optional[str] = None,
    age_rating: Optional[str] = None,
    search: Optional[str] = None,
):
    """
    Customer xem danh sách phim.
    Có thể filter:
        - ?language=English
        - ?age_rating=T13
        - ?search=Kong
    """
    try:
        base_query = """
            SELECT 
                m.Movie_id,
                m.Director,
                m.Title,
                m.Image,
                DATE_FORMAT(m.Release_date, '%d/%m/%Y') AS Release_date,
                m.Language,
                m.Age_rating,
                m.Duration,
                m.Description,
                
                (SELECT GROUP_CONCAT(AActor SEPARATOR ', ') FROM MovieActor ma WHERE ma.Movie_id = m.Movie_id) AS Actors,
                (SELECT GROUP_CONCAT(AFormat SEPARATOR ', ') FROM MovieFormat mf WHERE mf.Movie_id = m.Movie_id) AS Formats,
                (SELECT GROUP_CONCAT(ASubtitle SEPARATOR ', ') FROM MovieSubtitle ms WHERE ms.Movie_id = m.Movie_id) AS Subtitles,
                (SELECT GROUP_CONCAT(AGenres SEPARATOR ', ') FROM MovieGenres mg WHERE mg.Movie_id = m.Movie_id) AS Genres

            FROM Movie m
            WHERE 1 = 1
        """
        params = {}

        if language:
            base_query += " AND m.Language = :lang"
            params["lang"] = language

        if age_rating:
            base_query += " AND m.Age_rating = :age"
            params["age"] = age_rating

        if search:
            base_query += " AND m.Title LIKE :search"
            params["search"] = f"%{search}%"

        base_query += " ORDER BY m.Movie_id ASC"

        result = session.exec(text(base_query), params= params)
        rows = result.mappings().all()   # list[dict-like]
        
        # Transform rows to match MovieOut (split strings to lists)
        movies = []
        for row in rows:
            movies.append(MovieOut(
                Movie_id=row['Movie_id'],
                Director=row['Director'],
                Title=row['Title'],
                Image=row['Image'],
                Release_date=row['Release_date'],
                Language=row['Language'],
                Age_rating=row['Age_rating'],
                Duration=row['Duration'],
                Description=row['Description'],
                Actors=row['Actors'].split(", ") if row['Actors'] else [],
                Formats=row['Formats'].split(", ") if row['Formats'] else [],
                Subtitles=row['Subtitles'].split(", ") if row['Subtitles'] else [],
                Genres=row['Genres'].split(", ") if row['Genres'] else []
            ))

        return movies

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/{movie_id}", response_model=MovieDetailOut)
def get_movie_detail(movie_id: int, tag: Optional[str] = None, session: Session = Depends(get_session)):
    try:
        # 1) Lấy movie detail with multi-value attributes
        movie_query = text("""
            SELECT 
                m.Movie_id,
                m.Director,
                m.Title,
                m.Image,
                DATE_FORMAT(m.Release_date, '%d/%m/%Y') AS Release_date,
                m.Language,
                m.Age_rating,
                m.Duration,
                m.Description,
                
                (SELECT GROUP_CONCAT(AActor SEPARATOR ', ') FROM MovieActor ma WHERE ma.Movie_id = m.Movie_id) AS Actors,
                (SELECT GROUP_CONCAT(AFormat SEPARATOR ', ') FROM MovieFormat mf WHERE mf.Movie_id = m.Movie_id) AS Formats,
                (SELECT GROUP_CONCAT(ASubtitle SEPARATOR ', ') FROM MovieSubtitle ms WHERE ms.Movie_id = m.Movie_id) AS Subtitles,
                (SELECT GROUP_CONCAT(AGenres SEPARATOR ', ') FROM MovieGenres mg WHERE mg.Movie_id = m.Movie_id) AS Genres

            FROM Movie m
            WHERE m.Movie_id = :mid
        """)

        row = session.exec(movie_query, params={"mid": movie_id}).mappings().first()

        if not row:
            raise HTTPException(status_code=404, detail="Movie not found")

        # Transform row to MovieOut
        movie = MovieOut(
            Movie_id=row['Movie_id'],
            Director=row['Director'],
            Title=row['Title'],
            Image=row['Image'],
            Release_date=row['Release_date'],
            Language=row['Language'],
            Age_rating=row['Age_rating'],
            Duration=row['Duration'],
            Description=row['Description'],
            Actors=row['Actors'].split(", ") if row['Actors'] else [],
            Formats=row['Formats'].split(", ") if row['Formats'] else [],
            Subtitles=row['Subtitles'].split(", ") if row['Subtitles'] else [],
            Genres=row['Genres'].split(", ") if row['Genres'] else []
        )

        showtime_proc = text("CALL GetMovieShowtimes(:mid)")
        showtimes_result = session.exec(showtime_proc, params={"mid": movie_id})
        showtimes = showtimes_result.mappings().all()

        review_proc = text("CALL GetMovieReviews(:mid,:spoiler)")
        review_result = session.exec(review_proc, params={"mid": movie_id, "spoiler": tag})
        reviews = review_result.mappings().all()

        return {
            "movie": movie,
            "showtimes": showtimes,
            "reviews": reviews
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ReviewCreate(BaseModel):
    customer_id: int
    rating: float
    date_comment: Optional[str] = None   # dd/mm/yyyy
    comment: Optional[str] = None
    spoiler: Optional[str] = "spoiler"

@router.post("/{movie_id}/reviews")
def create_review(movie_id: int, 
                  data: ReviewCreate, 
                  session: Session = Depends(get_session)
):
    try:
        date_str = datetime.now().strftime("%d/%m/%Y")
        
        if data.spoiler == "non_spoiler" and not is_non_spoiler_comment(data.comment):
            return {
                "result": False,
                "message": "Comment submitted may contains spoilers, please remove spoiler content or change spoiler tag."
                }
        
        proc = text("""
            CALL create_review(
                :movie_id,
                :customer_id,
                :rating,
                :date_comment,
                :comment,
                :spoiler
            )
        """)

        session.exec(proc, params={
            "movie_id": movie_id,
            "customer_id": data.customer_id,
            "rating": data.rating,
            "date_comment": date_str,
            "comment": data.comment,
            "spoiler": data.spoiler
        })
        session.commit()

        return {
            "result": True,
            "message": "Review created successfully"
        }

    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=400, detail=str(e))



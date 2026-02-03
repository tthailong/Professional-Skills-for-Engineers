from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlmodel import Session
from typing import Optional, List
from sqlalchemy import text
from database import get_session

router = APIRouter(
    prefix="/admin/movies",
    tags = ["movies - admin"]
)

class MovieCreate(BaseModel):
    director: str
    title: str
    image: Optional[str] = None
    release_date: str          # "dd/mm/YYYY"
    language: str
    age_rating: str
    duration: Optional[int] = None
    description: Optional[str] = None
    admin_id: int
    actor: str
    format: str
    subtitle: str
    genres: str


class MovieUpdate(BaseModel):
    director: str
    title: str
    image: Optional[str] = None
    release_date: str
    language: str
    age_rating: str
    duration: Optional[int] = None
    description: Optional[str] = None
    admin_id: int
    actor: Optional[str] = None
    format: Optional[str] = None
    subtitle: Optional[str] = None
    genres: Optional[str] = None

class MovieResponse(BaseModel):
    movie_id: int
    title: str
    director: Optional[str]
    release_date: Optional[str]
    language: Optional[str]
    age_rating: Optional[str]
    duration: Optional[int]
    description: Optional[str]

    actors: List[str]
    formats: List[str]
    subtitles: List[str]
    genres: List[str]


@router.get("/all", response_model=list[MovieResponse])
def get_movies(session: Session = Depends(get_session)):

    sql = text("""
        SELECT 
            m.Movie_id,
            m.Title,
            m.Director,
            m.Release_date,
            m.Language,
            m.Age_rating,
            m.Duration,
            m.Description,

            (SELECT GROUP_CONCAT(AActor SEPARATOR ', ')
             FROM MovieActor ma
             WHERE ma.Movie_id = m.Movie_id) AS Actors,

            (SELECT GROUP_CONCAT(AFormat SEPARATOR ', ')
             FROM MovieFormat mf
             WHERE mf.Movie_id = m.Movie_id) AS Formats,

            (SELECT GROUP_CONCAT(ASubtitle SEPARATOR ', ')
             FROM MovieSubtitle ms
             WHERE ms.Movie_id = m.Movie_id) AS Subtitles,

            (SELECT GROUP_CONCAT(AGenres SEPARATOR ', ')
             FROM MovieGenres mg
             WHERE mg.Movie_id = m.Movie_id) AS Genres

        FROM Movie m
    """)

    rows = session.exec(sql).all()

    movies = []
    for r in rows:
        movies.append(MovieResponse(
            movie_id=r[0],
            title=r[1],
            director=r[2],
            release_date=str(r[3]) if r[3] else None,
            language=r[4],
            age_rating=r[5],
            duration=r[6],
            description=r[7],

            actors=r[8].split(", ") if r[8] else [],
            formats=r[9].split(", ") if r[9] else [],
            subtitles=r[10].split(", ") if r[10] else [],
            genres=r[11].split(", ") if r[11] else [],
        ))

    return movies

@router.post("/", status_code= 201)
def create_movie(
    movie: MovieCreate,
    session: Session = Depends(get_session)
):
    """Gọi: CALL create_movie(...)"""
    try:
        # Sanitize image name (remove spaces) to match DB constraint
        if movie.image:
            movie.image = movie.image.replace(" ", "_")

        # 1. Create the movie record
        stmt = text("""
            CALL create_movie(
                :p_director,
                :p_title,
                :p_image,
                :p_releasedate,
                :p_language,
                :p_agerating,
                :p_duration,
                :p_description,
                :p_adminid,
                :p_actor,
                :p_format,
                :p_subtitle,
                :p_genres
            )
        """)
        params = {
            "p_director": movie.director,
            "p_title": movie.title,
            "p_image": movie.image,
            "p_releasedate": movie.release_date,
            "p_language": movie.language,
            "p_agerating": movie.age_rating,
            "p_duration": movie.duration,
            "p_description": movie.description,
            "p_adminid": movie.admin_id,
            "p_actor": movie.actor,
            "p_format": movie.format,
            "p_subtitle": movie.subtitle,
            "p_genres": movie.genres
        }
        
        # Execute
        session.exec(stmt, params=params)
        session.commit()
        
        # Fetch the ID of the newly created movie (optional, but good for response)
        # Since LAST_INSERT_ID() is session-scoped, we might need to fetch it differently or just return success.
        # However, the SP doesn't return the ID. 
        # We can try to fetch the latest movie by this admin or just return a success message.
        # For simplicity and given the SP structure, we'll return a generic success.
        
        return {"message": "Movie created successfully"}

    except Exception as e:
        session.rollback()
        print(f"Error creating movie: {e}") # Log the specific error
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{movie_id}")
def update_movie(
    movie_id: int,
    movie: MovieUpdate,
    session: Session = Depends(get_session)
):
    try:
        # Sanitize image name
        if movie.image:
            movie.image = movie.image.replace(" ", "_")

        # 1. Update Movie with all attributes
        stmt = text("""
            CALL update_movie(
                :p_movie_id,
                :p_director,
                :p_title,
                :p_image,
                :p_releasedate,
                :p_language,
                :p_agerating,
                :p_duration,
                :p_description,
                :p_adminid,
                :p_actor,
                :p_format,
                :p_subtitle,
                :p_genres
            )
        """)
        params = {
            "p_movie_id": movie_id,
            "p_director": movie.director,
            "p_title": movie.title,
            "p_image": movie.image,
            "p_releasedate": movie.release_date,
            "p_language": movie.language,
            "p_agerating": movie.age_rating,
            "p_duration": movie.duration,
            "p_description": movie.description,
            "p_adminid": movie.admin_id,
            "p_actor": movie.actor,
            "p_format": movie.format,
            "p_subtitle": movie.subtitle,
            "p_genres": movie.genres
        }
        session.exec(stmt, params=params)
        session.commit()
        
        return {"message": "Movie updated"}
    except Exception as e:
        session.rollback()
        print(f"Error updating movie: {e}")
        raise HTTPException(status_code=400, detail=str(e))

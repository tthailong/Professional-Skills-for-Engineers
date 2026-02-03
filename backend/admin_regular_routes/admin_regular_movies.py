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

class ScreenCreate(BaseModel):
    movie_id: int

@router.get("/{branch_id}/movies", response_model=List[MovieResponse])
def get_movies_by_branch(
    branch_id: int, 
    session: Session = Depends(get_session)
):
    sql = text("""
        SELECT 
            m.Movie_id,
            m.Title,
            m.Director,
            DATE_FORMAT(m.Release_date, '%d/%m/%Y') AS Release_date,
            m.Language,
            m.age_rating,
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

        FROM Screen s
        JOIN Movie m ON s.Movie_id = m.Movie_id
        WHERE s.Branch_id = :bid
        ORDER BY m.Movie_id;
    """)

    rows = session.exec(sql, params={"bid": branch_id}).all()

    movies = []
    for r in rows:
        movies.append(MovieResponse(
            movie_id=r[0],
            title=r[1],
            director=r[2],
            release_date=r[3],
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

@router.get("/{branch_id}/movies-not-in-branch", response_model=List[MovieResponse])
def get_movies_not_in_branch(
    branch_id: int, 
    session: Session = Depends(get_session)
):
    sql = text("""
        SELECT 
            m.Movie_id,
            m.Title,
            m.Director,
            DATE_FORMAT(m.Release_date, '%d/%m/%Y') AS Release_date,
            m.Language,
            m.age_rating,
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
        WHERE m.Movie_id NOT IN (
            SELECT Movie_id FROM Screen WHERE Branch_id = :bid
        )
        ORDER BY m.Movie_id;
    """)

    rows = session.exec(sql, params={"bid": branch_id}).all()

    movies = []
    for r in rows:
        movies.append(MovieResponse(
            movie_id=r[0],
            title=r[1],
            director=r[2],
            release_date=r[3],
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


@router.post("/{branch_id}/create-screen")
def create_screen_api(
    branch_id: int,
    data: ScreenCreate,
    session: Session = Depends(get_session)
):
    try:
        proc = text("""
            CALL create_screen(:branch_id, :movie_id)
        """)

        session.exec(proc, params={
            "branch_id": branch_id,
            "movie_id": data.movie_id
        })
        session.commit()

        return {
            "message": "Screen created successfully",
            "branch_id": branch_id,
            "movie_id": data.movie_id
        }

    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{branch_id}/delete-screen/{movie_id}")
def delete_screen_api(
    branch_id: int,
    movie_id: int,
    session: Session = Depends(get_session)
):
    try:
        proc = text("""
            CALL delete_screen(:branch_id, :movie_id)
        """)

        session.exec(proc, params={
            "branch_id": branch_id,
            "movie_id": movie_id
        })
        session.commit()

        return {
            "message": "Screen deleted successfully",
            "branch_id": branch_id,
            "movie_id": movie_id
        }

    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))

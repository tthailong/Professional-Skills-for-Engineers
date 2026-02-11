from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlmodel import Session
from typing import Optional, List, Dict
from sqlalchemy import text
from database import get_session

router = APIRouter(
    prefix="/api/votemood",
    tags=["vote mood"]
)

class MoodVoteChange(BaseModel):
    movie_id: int
    customer_id: int
    mood_id: int

class MoodVoteResponse(BaseModel):
    mood_id: int
    mood_name: str
    count: int

class MoodOption(BaseModel):
    mood_id: int
    name: str
    symbol: str

class UserVotesResponse(BaseModel):
    mood_ids: List[int]

@router.post("/change")
def change_mood_vote(
    vote: MoodVoteChange,
    session: Session = Depends(get_session)
):
    """Toggle a mood vote (click to add, click again to remove)"""
    try:
        stmt = text("""
            CALL vote_mood(
                :p_movie_id,
                :p_customer_id,
                :p_mood_id
            )
        """)
        params = {
            "p_movie_id": vote.movie_id,
            "p_customer_id": vote.customer_id,
            "p_mood_id": vote.mood_id
        }
        
        session.exec(stmt, params=params)
        session.commit()
        
        return {"message": "Mood vote changed successfully"}
    
    except Exception as e:
        session.rollback()
        print(f"Error changing mood vote: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/movie/{movie_id}", response_model=List[MoodVoteResponse])
def get_mood_counts(
    movie_id: int,
    session: Session = Depends(get_session)
):
    """Get mood vote counts for a specific movie"""
    try:
        # Query to get mood vote counts for a movie
        stmt = text("""
            SELECT 
                m.Mood_id,
                m.Name,
                COUNT(v.Mood_id) as count
            FROM Mood m
            LEFT JOIN Vote v ON m.Mood_id = v.Mood_id AND v.Movie_id = :movie_id
            GROUP BY m.Mood_id, m.Name
            ORDER BY m.Mood_id
        """)
        
        rows = session.exec(stmt, params={"movie_id": movie_id}).all()
        
        results = [
            MoodVoteResponse(
                mood_id=row[0],
                mood_name=row[1],
                count=row[2]
            )
            for row in rows
        ]
        
        return results
    
    except Exception as e:
        print(f"Error getting mood counts: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/moods", response_model=List[MoodOption])
def get_all_moods(
    session: Session = Depends(get_session)
):
    """Get all available mood options with their SVG symbols"""
    try:
        stmt = text("""
            SELECT Mood_id, Name, Symbol
            FROM Mood
            ORDER BY Mood_id
        """)
        
        rows = session.exec(stmt).all()
        
        results = [
            MoodOption(
                mood_id=row[0],
                name=row[1],
                symbol=row[2]
            )
            for row in rows
        ]
        
        return results
    
    except Exception as e:
        print(f"Error getting moods: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/user/{customer_id}/movie/{movie_id}", response_model=UserVotesResponse)
def get_user_votes(
    customer_id: int,
    movie_id: int,
    session: Session = Depends(get_session)
):
    """Get list of mood IDs this user has voted for on this movie"""
    try:
        stmt = text("""
            SELECT Mood_id
            FROM Vote
            WHERE Customer_id = :customer_id AND Movie_id = :movie_id
        """)
        
        rows = session.exec(stmt, params={
            "customer_id": customer_id,
            "movie_id": movie_id
        }).all()
        
        mood_ids = [row[0] for row in rows]
        
        return UserVotesResponse(mood_ids=mood_ids)
    
    except Exception as e:
        print(f"Error getting user votes: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/user/{customer_id}/has-purchased/{movie_id}")
def has_user_purchased_movie(
    customer_id: int,
    movie_id: int,
    session: Session = Depends(get_session)
):
    """Check if customer has purchased tickets for this movie
    Query chain: Receipt -> Ticket -> ShowtimeSeat -> Showtime -> Movie
    """
    try:
        stmt = text("""
            SELECT COUNT(*) as purchase_count
            FROM Receipt r
            INNER JOIN Ticket t ON r.Receipt_id = t.Receipt_id
            INNER JOIN ShowtimeSeat ss ON 
                t.Showtime_id = ss.Showtime_id AND
                t.Branch_id = ss.Branch_id AND
                t.Hall_number = ss.Hall_number AND
                t.Seat_number = ss.Seat_number
            WHERE r.Customer_id = :customer_id 
              AND ss.Movie_id = :movie_id
        """)
        
        result = session.exec(stmt, params={
            "customer_id": customer_id,
            "movie_id": movie_id
        }).first()
        
        has_purchased = result[0] > 0 if result else False
        
        return {
            "has_purchased": has_purchased,
            "purchase_count": result[0] if result else 0
        }
    
    except Exception as e:
        print(f"Error checking purchase: {e}")
        raise HTTPException(status_code=400, detail=str(e))
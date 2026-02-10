from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlmodel import Session
from typing import Optional, List
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
        # Query to get icon counts for a movie
        stmt = text("""
            SELECT 
                i.Mood_id,
                i.Mood_name,
                COUNT(r.Mood_id) as count
            FROM Mood i
            LEFT JOIN Vote r ON i.Mood_id = r.Mood_id AND r.Movie_id = :movie_id
            GROUP BY i.Mood_id, i.Mood_name
            ORDER BY i.Mood_id
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
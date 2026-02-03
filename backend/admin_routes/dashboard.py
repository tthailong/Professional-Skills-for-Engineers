from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from sqlalchemy import text
from datetime import date, timedelta

router = APIRouter(
    prefix="/admin/dashboard",
    tags=["admin-dashboard"]
)

@router.get("/primary")
def get_primary_dashboard_stats(
    startDate: date = None,
    endDate: date = None,
    session: Session = Depends(get_session)
):
    if not startDate:
        startDate = date.today().replace(day=1)
    if not endDate:
        endDate = date.today()

    try:
        # 1. Dynamic Net Revenue
        net_revenue_row = session.exec(
            text("SELECT fn_DynamicRevenue(:start, :end, NULL)")
            .params(start=startDate, end=endDate)
        ).first()
        net_revenue = net_revenue_row[0] if net_revenue_row else 0.0

        # 2. Total Admins
        total_admins_row = session.exec(text("SELECT fn_TotalAdmins()")).first()
        total_admins = total_admins_row[0] if total_admins_row else 0

        # 3. Total Bookings
        total_bookings_row = session.exec(text("SELECT fn_total_bookings()")).first()
        total_bookings = total_bookings_row[0] if total_bookings_row else 0

        # 4. Total Movies
        total_movies_row = session.exec(text("SELECT fn_movies_listed()")).first()
        total_movies = total_movies_row[0] if total_movies_row else 0

        # 5. Avg Receipt Value
        avg_receipt_value_row = session.exec(
            text("SELECT fn_AvgReceiptValue(:start, :end)")
            .params(start=startDate, end=endDate)
        ).first()
        avg_receipt_value = avg_receipt_value_row[0] if avg_receipt_value_row else 0.0

        # 6. Top Movies (Using SP)
        top_movies = []
        try:
            # Note: Calling SPs and fetching results in SQLAlchemy/SQLModel can be tricky.
            # We use a direct execution approach.
            result = session.connection().execute(
                text("CALL sp_GetTopMoviesRevenue(:start, :end, NULL, 5)"),
                {"start": startDate, "end": endDate}
            ).fetchall()
            for row in result:
                top_movies.append({"name": row[0], "value": float(row[1])})
        except Exception as e:
            print(f"Error fetching top movies: {e}")

        # 7. Revenue Trend (Using SP)
        revenue_trend = []
        try:
            # We need to consume the previous result or close it if using the same session/connection?
            # SQLAlchemy handles this usually, but let's be safe.
            result = session.connection().execute(
                text("CALL sp_GetDailyRevenueTrend(:start, :end, NULL)"),
                {"start": startDate, "end": endDate}
            ).fetchall()
            for row in result:
                revenue_trend.append({
                    "date": str(row[0]),
                    "ticket_revenue": float(row[1]),
                    "product_revenue": float(row[2]),
                    "total_revenue": float(row[1]) + float(row[2])
                })
        except Exception as e:
            print(f"Error fetching revenue trend: {e}")

        # 8. System Occupancy Rate
        occupancy_rate_row = session.exec(
            text("SELECT fn_SystemMonthlyOccupancyRate(:month, :year)")
            .params(month=startDate.month, year=startDate.year)
        ).first()
        occupancy_rate = occupancy_rate_row[0] if occupancy_rate_row else 0.0

        return {
            "period": {
                "start": str(startDate),
                "end": str(endDate)
            },
            "financials": {
                "net_revenue": float(net_revenue),
                "avg_receipt_value": float(avg_receipt_value),
            },
            "system_stats": {
                "total_admins": total_admins,
                "total_bookings": total_bookings,
                "total_movies": total_movies,
                "occupancy_rate": float(occupancy_rate) # Added
            },
            "charts": {
                "top_movies": top_movies,
                "revenue_trend": revenue_trend
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/regular/{branch_id}")
def get_regular_dashboard_stats(
    branch_id: int,
    startDate: date = None,
    endDate: date = None,
    session: Session = Depends(get_session)
):
    if not startDate:
        startDate = date.today().replace(day=1)
    if not endDate:
        endDate = date.today()

    try:
        # 1. Dynamic Net Revenue for Branch
        net_revenue_row = session.exec(
            text("SELECT fn_DynamicRevenue(:start, :end, :bid)")
            .params(start=startDate, end=endDate, bid=branch_id)
        ).first()
        net_revenue = net_revenue_row[0] if net_revenue_row else 0.0

        # 2. Occupancy Rate (Monthly approximation or we need a dynamic function)
        # Reusing Monthly function for now using the start date's month
        occupancy_rate_row = session.exec(
            text("SELECT fn_MonthlyOccupancyRateByBranch(:bid, :year, :month)")
            .params(bid=branch_id, year=startDate.year, month=startDate.month)
        ).first()
        occupancy_rate = occupancy_rate_row[0] if occupancy_rate_row else 0.0

        # 3. Top Movies for Branch
        top_movies = []
        try:
            result = session.connection().execute(
                text("CALL sp_GetTopMoviesRevenue(:start, :end, :bid, 5)"),
                {"start": startDate, "end": endDate, "bid": branch_id}
            ).fetchall()
            for row in result:
                top_movies.append({"name": row[0], "value": float(row[1])})
        except Exception as e:
             print(f"Error fetching top movies: {e}")

        # 4. Revenue Trend for Branch
        revenue_trend = []
        try:
            result = session.connection().execute(
                text("CALL sp_GetDailyRevenueTrend(:start, :end, :bid)"),
                {"start": startDate, "end": endDate, "bid": branch_id}
            ).fetchall()
            for row in result:
                revenue_trend.append({
                    "date": str(row[0]),
                    "ticket_revenue": float(row[1]),
                    "product_revenue": float(row[2]),
                    "total_revenue": float(row[1]) + float(row[2])
                })
        except Exception as e:
             print(f"Error fetching revenue trend: {e}")

        return {
            "branch_id": branch_id,
            "period": {
                "start": str(startDate),
                "end": str(endDate)
            },
            "stats": {
                "net_revenue": float(net_revenue),
                "occupancy_rate": float(occupancy_rate),
            },
             "charts": {
                "top_movies": top_movies,
                "revenue_trend": revenue_trend
            }
        }

    except Exception as e:
        if "Branch_id không tồn tại" in str(e):
            raise HTTPException(status_code=404, detail="Branch not found")
        raise HTTPException(status_code=500, detail=str(e))

from pydantic import BaseModel
from typing import List, Optional

class LowOccupancyAlert(BaseModel):
    Movie_Name: str
    Branch_Name: str
    Duration: int
    Start_time: str 
    Date: str 
    Total_Capacity: int
    Booked_Seats: int
    Occupancy_Rate: float

class LowOccupancyAlertResponse(BaseModel):
    data: List[LowOccupancyAlert]
    total: int
    page: int
    limit: int

@router.get("/alerts/low-occupancy", response_model=LowOccupancyAlertResponse)
def get_low_occupancy_alerts(
    month: int,
    year: int,
    threshold: float = 20.0,
    branch_id: Optional[int] = None,
    page: int = 1,
    limit: int = 10,
    session: Session = Depends(get_session)
):
    try:
        offset = (page - 1) * limit
        
        # Call the stored procedure
        # Note: We use session.connection().execute for calling SPs that return result sets
        result = session.connection().execute(
            text("CALL sp_GetMonthlyLowOccupancyAlerts(:month, :year, :threshold, :bid, :limit, :offset)"),
            {
                "month": month, 
                "year": year, 
                "threshold": threshold, 
                "bid": branch_id,
                "limit": limit,
                "offset": offset
            }
        ).fetchall()
        
        alerts = []
        total_count = 0
        
        if result:
            total_count = result[0][8] # Total_Count is the 9th column (index 8)

        for row in result:
            # Map row to Pydantic model
            # Row order: Movie_Name, Branch_Name, Duration, Start_time, Date, Total_Capacity, Booked_Seats, Occupancy_Rate, Total_Count
            alerts.append(LowOccupancyAlert(
                Movie_Name=row[0],
                Branch_Name=row[1],
                Duration=row[2],
                Start_time=str(row[3]),
                Date=str(row[4]),
                Total_Capacity=row[5],
                Booked_Seats=int(row[6]), # Decimal to int if needed
                Occupancy_Rate=float(row[7])
            ))
            
        return LowOccupancyAlertResponse(
            data=alerts,
            total=total_count,
            page=page,
            limit=limit
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

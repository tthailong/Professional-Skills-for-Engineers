from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlmodel import Session
from typing import Optional, List
from sqlalchemy import text
from database import get_session

router = APIRouter(
    prefix="/admin/products",
    tags = ["products - admin"]
)

class FoodDrinkCreate(BaseModel):
    name: str
    price: Optional[float] = None
    description: Optional[str] = None
    size: str
    type: str

class FoodDrinkUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
    size: Optional[str] = None
    type: Optional[str] = None


class SouvenirCreate(BaseModel):
    name: str
    price: Optional[float] = None
    description: Optional[str] = None
    movie_id: int

class SouvenirUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
    movie_id: Optional[int] = None

# FOOD & DRINK

@router.post("/food_drink")
def create_food_drink_api(
    data: FoodDrinkCreate,
    session: Session = Depends(get_session)
):
    """
    Tạo product loại Food_Drink.
    Gọi PROCEDURE: create_food_drink(...)
    """
    try:
        proc = text("""
            CALL create_food_drink(
                :p_name,
                :p_price,
                :p_description,
                :p_size,
                :p_type
            )
        """)

        session.exec(proc, params={
            "p_name": data.name,
            "p_price": data.price,
            "p_description": data.description,
            "p_size": data.size,
            "p_type": data.type,
        })
        session.commit()

        return {
            "message": "Food / Drink product created successfully"
        }

    except Exception as e:
        session.rollback()
        # lỗi SIGNAL 'ERROR: ...' trong procedure cũng sẽ nhảy vào đây
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/food_drink/{product_id}")
def update_food_drink_api(
    product_id: int,
    data: FoodDrinkUpdate,
    session: Session = Depends(get_session)
):
    """
    Cập nhật product loại Food_Drink.
    Gọi PROCEDURE: update_food_drink(...)
    """
    try:
        proc = text("""
            CALL update_food_drink(
                :p_product_id,
                :p_name,
                :p_price,
                :p_description,
                :p_size,
                :p_type
            )
        """)

        session.exec(proc, params={
            "p_product_id": product_id,
            "p_name": data.name,
            "p_price": data.price,
            "p_description": data.description,
            "p_size": data.size,
            "p_type": data.type,
        })
        session.commit()

        return {
            "message": "Food / Drink product updated successfully",
            "product_id": product_id
        }

    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/food_drink/{product_id}")
def delete_food_drink_api(
    product_id: int,
    session: Session = Depends(get_session)
):
    try:
        proc = text("CALL delete_food_drink(:p_product_id)")

        session.exec(proc, params={
            "p_product_id": product_id
        })
        session.commit()

        return {
            "message": "Food / Drink product deleted successfully",
            "product_id": product_id
        }

    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# SOUVENIR

@router.post("/souvenir")
def create_souvenir_api(
    data: SouvenirCreate,
    session: Session = Depends(get_session)
):
    """
    Tạo product loại Souvenir (gắn với 1 Movie).
    Gọi PROCEDURE: create_souvenir(...)
    """
    try:
        proc = text("""
            CALL create_souvenir(
                :p_name,
                :p_price,
                :p_description,
                :p_movie_id
            )
        """)

        session.exec(proc, params={
            "p_name": data.name,
            "p_price": data.price,
            "p_description": data.description,
            "p_movie_id": data.movie_id,
        })
        session.commit()

        return {
            "message": "Souvenir product created successfully"
        }

    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/souvenir/{product_id}")
def update_souvenir_api(
    product_id: int,
    data: SouvenirUpdate,
    session: Session = Depends(get_session)
):
    """
    Cập nhật product loại Souvenir.
    Gọi PROCEDURE: update_souvenir(...)
    """
    try:
        proc = text("""
            CALL update_souvenir(
                :p_product_id,
                :p_name,
                :p_price,
                :p_description,
                :p_movie_id
            )
        """)

        session.exec(proc, params={
            "p_product_id": product_id,
            "p_name": data.name,
            "p_price": data.price,
            "p_description": data.description,
            "p_movie_id": data.movie_id,
        })
        session.commit()

        return {
            "message": "Souvenir product updated successfully",
            "product_id": product_id
        }

    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/souvenir/{product_id}")
def delete_souvenir_api(
    product_id: int,
    session: Session = Depends(get_session)
):
    """
    Xóa product loại Souvenir (và Product cha).
    Gọi PROCEDURE: delete_souvenir(...)
    """
    try:
        proc = text("CALL delete_souvenir(:p_product_id)")

        session.exec(proc, params={
            "p_product_id": product_id
        })
        session.commit()

        return {
            "message": "Souvenir product deleted successfully",
            "product_id": product_id
        }

    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/food_drink")
def get_all_food_drink(session: Session = Depends(get_session)):
    try:
        # Join Product and Food_Drink tables
        statement = text("""
            SELECT p.Product_id, p.Name, p.Price, p.Description, fd.Size, fd.Type
            FROM Product p
            JOIN Food_Drink fd ON p.Product_id = fd.Product_id
        """)
        results = session.exec(statement).all()
        
        products = []
        for row in results:
            products.append({
                "id": row.Product_id,
                "name": row.Name,
                "price": row.Price,
                "description": row.Description,
                "size": row.Size,
                "type": row.Type
            })
        return products
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/souvenir")
def get_all_souvenir(session: Session = Depends(get_session)):
    try:
        # Join Product and Souvenir tables
        statement = text("""
            SELECT p.Product_id, p.Name, p.Price, p.Description, s.Movie_id
            FROM Product p
            JOIN Souvenir s ON p.Product_id = s.Product_id
        """)
        results = session.exec(statement).all()
        
        products = []
        for row in results:
            products.append({
                "id": row.Product_id,
                "name": row.Name,
                "price": row.Price,
                "description": row.Description,
                "movie_id": row.Movie_id
            })
        return products
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
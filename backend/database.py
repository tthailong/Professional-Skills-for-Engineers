from sqlmodel import create_engine, Session
from dotenv import load_dotenv
import os

load_dotenv()
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL, echo=True)

def get_session():
    with Session(engine) as session:
        yield session

if __name__ == "__main__":
    from sqlalchemy import text

    try:
        with Session(engine) as session:
            session.exec(text("SELECT 1")) 
            print("Kết nối MySQL thành công!")
    except Exception as e:
        print("Kết nối thất bại:", e)
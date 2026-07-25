import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT", "1521")
DB_SERVICE_NAME = os.getenv("DB_SERVICE_NAME")

SQLALCHEMY_DATABASE_URL = f"oracle+oracledb://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/?service_name={DB_SERVICE_NAME}"
engine = create_engine(SQLALCHEMY_DATABASE_URL)

from app.database import SessionLocal
from app.models.academic import Carrera

try:
    db = SessionLocal()
    carreras = db.query(Carrera).all()
    print(f"Carreras fetched: {len(carreras)}")
except Exception as e:
    import traceback
    traceback.print_exc()
finally:
    db.close()


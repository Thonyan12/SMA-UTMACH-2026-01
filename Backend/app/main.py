from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db

app = FastAPI()

@app.get("/")
def root():
    return {"message": "API de Mentorías UTMACH funcionando"}

@app.get("/test-db")
def test_db_connection(db: Session = Depends(get_db)):
    try:
        # Ejecuta una consulta simple para probar la conexión
        result = db.execute(text("SELECT 1 FROM DUAL"))
        return {"status": "success", "message": "¡Conexión exitosa a Oracle DB!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error conectando a la base de datos: {str(e)}")
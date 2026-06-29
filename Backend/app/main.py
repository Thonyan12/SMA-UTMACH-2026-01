from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db

from app.routers import catalogs, users, academic, actors, processes

app = FastAPI()

app.include_router(catalogs.router, prefix="/api/catalogs", tags=["Catálogos"])
app.include_router(users.router, prefix="/api/users", tags=["Cuentas y Usuarios"])
app.include_router(academic.router, prefix="/api/academic", tags=["Gestión Académica"])
app.include_router(actors.router, prefix="/api/actors", tags=["Actores (Mentores/Estudiantes)"])
app.include_router(processes.router, prefix="/api/processes", tags=["Procesos de Mentoría"])

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

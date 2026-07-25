from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from sqlalchemy.exc import DatabaseError
from typing import List

from app.database import get_db
from app.models.processes import (
    SolicitudMentoria, SesionMentoria, Calificacion, Notificacion, HistorialCambio
)
from app.schemas.processes import (
    SolicitudMentoriaCreate, SolicitudMentoriaUpdate, SolicitudMentoriaResponse,
    SesionMentoriaCreate, SesionMentoriaUpdate, SesionMentoriaResponse,
    CalificacionCreate, CalificacionUpdate, CalificacionResponse,
    NotificacionCreate, NotificacionUpdate, NotificacionResponse,
    HistorialCambioCreate, HistorialCambioUpdate, HistorialCambioResponse
)

router = APIRouter()

# ==========================================
# CRUD para SolicitudesMentoria
# ==========================================
@router.get("/solicitudes-mentoria/", response_model=List[SolicitudMentoriaResponse])
def get_solicitudes_mentoria(db: Session = Depends(get_db)):
    return db.query(SolicitudMentoria).all()

@router.post("/solicitudes-mentoria/")
def create_solicitud_mentoria(item: SolicitudMentoriaCreate, db: Session = Depends(get_db)):
    try:
        db.execute(
            text("""
                CALL pkg_mentorias.sp_crear_solicitud(
                    :p_estudiante_id, :p_materia_id, :p_descripcion, :p_fecha_hora, :p_prioridad
                )
            """),
            {
                "p_estudiante_id": item.estudiante_id,
                "p_materia_id": item.materia_id,
                "p_descripcion": item.descripcion,
                "p_fecha_hora": item.fecha_hora_deseada,
                "p_prioridad": item.prioridad
            }
        )
        db.commit()
        return {"message": "Solicitud creada exitosamente a través de PKG_MENTORIAS"}
    except DatabaseError as e:
        db.rollback()
        error_msg = str(e.orig) if hasattr(e, 'orig') else str(e)
        raise HTTPException(status_code=400, detail=error_msg)

@router.put("/solicitudes-mentoria/{id}", response_model=SolicitudMentoriaResponse)
def update_solicitud_mentoria(id: int, item: SolicitudMentoriaUpdate, db: Session = Depends(get_db)):
    db_item = db.query(SolicitudMentoria).filter(SolicitudMentoria.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    update_data = item.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/solicitudes-mentoria/{id}")
def delete_solicitud_mentoria(id: int, db: Session = Depends(get_db)):
    db_item = db.query(SolicitudMentoria).filter(SolicitudMentoria.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    # Soft Delete: En la arquitectura V8 no se borran físicamente los datos
    db_item.estado_solicitud = 'cancelada'
    db.commit()
    return {"message": "Solicitud cancelada exitosamente"}


# ==========================================
# CRUD para SesionesMentoria
# ==========================================
@router.get("/sesiones-mentoria/", response_model=List[SesionMentoriaResponse])
def get_sesiones_mentoria(db: Session = Depends(get_db)):
    return db.query(SesionMentoria).all()

@router.post("/sesiones-mentoria/")
def create_sesion_mentoria(item: SesionMentoriaCreate, db: Session = Depends(get_db)):
    try:
        db.execute(
            text("""
                CALL pkg_mentorias.sp_programar_sesion(
                    :p_solicitud_id, :p_inicio, :p_fin, :p_enlace
                )
            """),
            {
                "p_solicitud_id": item.solicitud_id,
                "p_inicio": item.inicio,
                "p_fin": item.fin,
                "p_enlace": item.enlace_teams
            }
        )
        db.commit()
        return {"message": "Sesión programada exitosamente a través de PKG_MENTORIAS"}
    except DatabaseError as e:
        db.rollback()
        error_msg = str(e.orig) if hasattr(e, 'orig') else str(e)
        raise HTTPException(status_code=400, detail=error_msg)

@router.put("/sesiones-mentoria/{id}", response_model=SesionMentoriaResponse)
def update_sesion_mentoria(id: int, item: SesionMentoriaUpdate, db: Session = Depends(get_db)):
    db_item = db.query(SesionMentoria).filter(SesionMentoria.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    update_data = item.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/sesiones-mentoria/{id}")
def delete_sesion_mentoria(id: int, db: Session = Depends(get_db)):
    db_item = db.query(SesionMentoria).filter(SesionMentoria.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    # Soft Delete
    db_item.estado_sesion = 'cancelada'
    db.commit()
    return {"message": "Sesión cancelada exitosamente"}


# ==========================================
# CRUD para Calificaciones
# ==========================================
@router.get("/calificaciones/", response_model=List[CalificacionResponse])
def get_calificaciones(db: Session = Depends(get_db)):
    return db.query(Calificacion).all()

@router.post("/calificaciones/", response_model=CalificacionResponse)
def create_calificacion(item: CalificacionCreate, db: Session = Depends(get_db)):
    db_item = Calificacion(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/calificaciones/{id}", response_model=CalificacionResponse)
def update_calificacion(id: int, item: CalificacionUpdate, db: Session = Depends(get_db)):
    db_item = db.query(Calificacion).filter(Calificacion.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Calificación no encontrada")
    update_data = item.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/calificaciones/{id}")
def delete_calificacion(id: int, db: Session = Depends(get_db)):
    db_item = db.query(Calificacion).filter(Calificacion.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Calificación no encontrada")
    db_item.estado = 0 # Soft Delete
    db.commit()
    return {"message": "Calificación eliminada (Soft Delete) exitosamente"}


# ==========================================
# CRUD para Notificaciones
# ==========================================
@router.get("/notificaciones/", response_model=List[NotificacionResponse])
def get_notificaciones(db: Session = Depends(get_db)):
    return db.query(Notificacion).all()

@router.post("/notificaciones/", response_model=NotificacionResponse)
def create_notificacion(item: NotificacionCreate, db: Session = Depends(get_db)):
    db_item = Notificacion(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/notificaciones/{id}", response_model=NotificacionResponse)
def update_notificacion(id: int, item: NotificacionUpdate, db: Session = Depends(get_db)):
    db_item = db.query(Notificacion).filter(Notificacion.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    update_data = item.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/notificaciones/{id}")
def delete_notificacion(id: int, db: Session = Depends(get_db)):
    db_item = db.query(Notificacion).filter(Notificacion.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    db_item.estado = 0 # Soft Delete
    db.commit()
    return {"message": "Notificación eliminada (Soft Delete) exitosamente"}


# ==========================================
# CRUD para HistorialCambios
# ==========================================
@router.get("/historial-cambios/", response_model=List[HistorialCambioResponse])
def get_historial_cambios(db: Session = Depends(get_db)):
    # Solo permisos de Lectura (GET) para HistorialCambios. 
    # La escritura la manejan los Triggers de BD.
    return db.query(HistorialCambio).all()

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
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

@router.post("/solicitudes-mentoria/", response_model=SolicitudMentoriaResponse)
def create_solicitud_mentoria(item: SolicitudMentoriaCreate, db: Session = Depends(get_db)):
    db_item = SolicitudMentoria(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

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
    db.delete(db_item)
    db.commit()
    return {"message": "Eliminado exitosamente"}


# ==========================================
# CRUD para SesionesMentoria
# ==========================================
@router.get("/sesiones-mentoria/", response_model=List[SesionMentoriaResponse])
def get_sesiones_mentoria(db: Session = Depends(get_db)):
    return db.query(SesionMentoria).all()

@router.post("/sesiones-mentoria/", response_model=SesionMentoriaResponse)
def create_sesion_mentoria(item: SesionMentoriaCreate, db: Session = Depends(get_db)):
    db_item = SesionMentoria(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

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
    db.delete(db_item)
    db.commit()
    return {"message": "Eliminado exitosamente"}


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
    db.delete(db_item)
    db.commit()
    return {"message": "Eliminado exitosamente"}


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
    db.delete(db_item)
    db.commit()
    return {"message": "Eliminado exitosamente"}


# ==========================================
# CRUD para HistorialCambios
# ==========================================
@router.get("/historial-cambios/", response_model=List[HistorialCambioResponse])
def get_historial_cambios(db: Session = Depends(get_db)):
    return db.query(HistorialCambio).all()

@router.post("/historial-cambios/", response_model=HistorialCambioResponse)
def create_historial_cambio(item: HistorialCambioCreate, db: Session = Depends(get_db)):
    db_item = HistorialCambio(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/historial-cambios/{id}", response_model=HistorialCambioResponse)
def update_historial_cambio(id: int, item: HistorialCambioUpdate, db: Session = Depends(get_db)):
    db_item = db.query(HistorialCambio).filter(HistorialCambio.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Registro de historial no encontrado")
    update_data = item.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/historial-cambios/{id}")
def delete_historial_cambio(id: int, db: Session = Depends(get_db)):
    db_item = db.query(HistorialCambio).filter(HistorialCambio.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Registro de historial no encontrado")
    db.delete(db_item)
    db.commit()
    return {"message": "Eliminado exitosamente"}

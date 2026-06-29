from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.catalogs import CatEstadoAprobacion, CatEstadoSolicitud, CatEstadoSesion, CatDias, TablasSistema
from app.schemas.catalogs import (
    CatEstadoAprobacionCreate, CatEstadoAprobacionUpdate, CatEstadoAprobacionResponse,
    CatEstadoSolicitudCreate, CatEstadoSolicitudUpdate, CatEstadoSolicitudResponse,
    CatEstadoSesionCreate, CatEstadoSesionUpdate, CatEstadoSesionResponse,
    CatDiasCreate, CatDiasUpdate, CatDiasResponse,
    TablasSistemaCreate, TablasSistemaUpdate, TablasSistemaResponse
)

router = APIRouter()

# ==========================================
# CRUD para CatEstadoAprobacion
# ==========================================
@router.get("/estado-aprobacion/", response_model=List[CatEstadoAprobacionResponse])
def get_estados_aprobacion(db: Session = Depends(get_db)):
    return db.query(CatEstadoAprobacion).all()

@router.post("/estado-aprobacion/", response_model=CatEstadoAprobacionResponse)
def create_estado_aprobacion(item: CatEstadoAprobacionCreate, db: Session = Depends(get_db)):
    db_item = CatEstadoAprobacion(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/estado-aprobacion/{codigo}", response_model=CatEstadoAprobacionResponse)
def update_estado_aprobacion(codigo: str, item: CatEstadoAprobacionUpdate, db: Session = Depends(get_db)):
    db_item = db.query(CatEstadoAprobacion).filter(CatEstadoAprobacion.codigo == codigo).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Estado de aprobación no encontrado")
    update_data = item.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/estado-aprobacion/{codigo}")
def delete_estado_aprobacion(codigo: str, db: Session = Depends(get_db)):
    db_item = db.query(CatEstadoAprobacion).filter(CatEstadoAprobacion.codigo == codigo).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Estado de aprobación no encontrado")
    db.delete(db_item)
    db.commit()
    return {"message": "Eliminado exitosamente"}


# ==========================================
# CRUD para CatEstadoSolicitud
# ==========================================
@router.get("/estado-solicitud/", response_model=List[CatEstadoSolicitudResponse])
def get_estados_solicitud(db: Session = Depends(get_db)):
    return db.query(CatEstadoSolicitud).all()

@router.post("/estado-solicitud/", response_model=CatEstadoSolicitudResponse)
def create_estado_solicitud(item: CatEstadoSolicitudCreate, db: Session = Depends(get_db)):
    db_item = CatEstadoSolicitud(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/estado-solicitud/{codigo}", response_model=CatEstadoSolicitudResponse)
def update_estado_solicitud(codigo: str, item: CatEstadoSolicitudUpdate, db: Session = Depends(get_db)):
    db_item = db.query(CatEstadoSolicitud).filter(CatEstadoSolicitud.codigo == codigo).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Estado de solicitud no encontrado")
    update_data = item.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/estado-solicitud/{codigo}")
def delete_estado_solicitud(codigo: str, db: Session = Depends(get_db)):
    db_item = db.query(CatEstadoSolicitud).filter(CatEstadoSolicitud.codigo == codigo).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Estado de solicitud no encontrado")
    db.delete(db_item)
    db.commit()
    return {"message": "Eliminado exitosamente"}


# ==========================================
# CRUD para CatEstadoSesion
# ==========================================
@router.get("/estado-sesion/", response_model=List[CatEstadoSesionResponse])
def get_estados_sesion(db: Session = Depends(get_db)):
    return db.query(CatEstadoSesion).all()

@router.post("/estado-sesion/", response_model=CatEstadoSesionResponse)
def create_estado_sesion(item: CatEstadoSesionCreate, db: Session = Depends(get_db)):
    db_item = CatEstadoSesion(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/estado-sesion/{codigo}", response_model=CatEstadoSesionResponse)
def update_estado_sesion(codigo: str, item: CatEstadoSesionUpdate, db: Session = Depends(get_db)):
    db_item = db.query(CatEstadoSesion).filter(CatEstadoSesion.codigo == codigo).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Estado de sesión no encontrado")
    update_data = item.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/estado-sesion/{codigo}")
def delete_estado_sesion(codigo: str, db: Session = Depends(get_db)):
    db_item = db.query(CatEstadoSesion).filter(CatEstadoSesion.codigo == codigo).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Estado de sesión no encontrado")
    db.delete(db_item)
    db.commit()
    return {"message": "Eliminado exitosamente"}


# ==========================================
# CRUD para CatDias
# ==========================================
@router.get("/dias/", response_model=List[CatDiasResponse])
def get_dias(db: Session = Depends(get_db)):
    return db.query(CatDias).all()

@router.post("/dias/", response_model=CatDiasResponse)
def create_dia(item: CatDiasCreate, db: Session = Depends(get_db)):
    db_item = CatDias(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/dias/{id}", response_model=CatDiasResponse)
def update_dia(id: int, item: CatDiasUpdate, db: Session = Depends(get_db)):
    db_item = db.query(CatDias).filter(CatDias.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Día no encontrado")
    update_data = item.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/dias/{id}")
def delete_dia(id: int, db: Session = Depends(get_db)):
    db_item = db.query(CatDias).filter(CatDias.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Día no encontrado")
    db.delete(db_item)
    db.commit()
    return {"message": "Eliminado exitosamente"}


# ==========================================
# CRUD para TablasSistema
# ==========================================
@router.get("/tablas-sistema/", response_model=List[TablasSistemaResponse])
def get_tablas_sistema(db: Session = Depends(get_db)):
    return db.query(TablasSistema).all()

@router.post("/tablas-sistema/", response_model=TablasSistemaResponse)
def create_tabla_sistema(item: TablasSistemaCreate, db: Session = Depends(get_db)):
    db_item = TablasSistema(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/tablas-sistema/{id}", response_model=TablasSistemaResponse)
def update_tabla_sistema(id: int, item: TablasSistemaUpdate, db: Session = Depends(get_db)):
    db_item = db.query(TablasSistema).filter(TablasSistema.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Tabla no encontrada")
    update_data = item.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/tablas-sistema/{id}")
def delete_tabla_sistema(id: int, db: Session = Depends(get_db)):
    db_item = db.query(TablasSistema).filter(TablasSistema.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Tabla no encontrada")
    db.delete(db_item)
    db.commit()
    return {"message": "Eliminado exitosamente"}

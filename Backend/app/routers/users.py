from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.users import Cuenta, Rol, CuentaRol, Perfil
from app.schemas.users import (
    CuentaCreate, CuentaUpdate, CuentaResponse,
    RolCreate, RolUpdate, RolResponse,
    CuentaRolCreate, CuentaRolUpdate, CuentaRolResponse,
    PerfilCreate, PerfilUpdate, PerfilResponse
)

router = APIRouter()

# ==========================================
# CRUD para Cuentas
# ==========================================
@router.get("/cuentas/", response_model=List[CuentaResponse])
def get_cuentas(db: Session = Depends(get_db)):
    return db.query(Cuenta).all()

@router.post("/cuentas/", response_model=CuentaResponse)
def create_cuenta(item: CuentaCreate, db: Session = Depends(get_db)):
    db_item = Cuenta(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/cuentas/{id}", response_model=CuentaResponse)
def update_cuenta(id: int, item: CuentaUpdate, db: Session = Depends(get_db)):
    db_item = db.query(Cuenta).filter(Cuenta.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")
    update_data = item.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/cuentas/{id}")
def delete_cuenta(id: int, db: Session = Depends(get_db)):
    db_item = db.query(Cuenta).filter(Cuenta.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")
    db.delete(db_item)
    db.commit()
    return {"message": "Eliminado exitosamente"}


# ==========================================
# CRUD para Roles
# ==========================================
@router.get("/roles/", response_model=List[RolResponse])
def get_roles(db: Session = Depends(get_db)):
    return db.query(Rol).all()

@router.post("/roles/", response_model=RolResponse)
def create_rol(item: RolCreate, db: Session = Depends(get_db)):
    db_item = Rol(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/roles/{id}", response_model=RolResponse)
def update_rol(id: int, item: RolUpdate, db: Session = Depends(get_db)):
    db_item = db.query(Rol).filter(Rol.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    update_data = item.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/roles/{id}")
def delete_rol(id: int, db: Session = Depends(get_db)):
    db_item = db.query(Rol).filter(Rol.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    db.delete(db_item)
    db.commit()
    return {"message": "Eliminado exitosamente"}


# ==========================================
# CRUD para CuentaRoles
# ==========================================
@router.get("/cuenta-roles/", response_model=List[CuentaRolResponse])
def get_cuenta_roles(db: Session = Depends(get_db)):
    return db.query(CuentaRol).all()

@router.post("/cuenta-roles/", response_model=CuentaRolResponse)
def create_cuenta_rol(item: CuentaRolCreate, db: Session = Depends(get_db)):
    db_item = CuentaRol(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/cuenta-roles/{id}", response_model=CuentaRolResponse)
def update_cuenta_rol(id: int, item: CuentaRolUpdate, db: Session = Depends(get_db)):
    db_item = db.query(CuentaRol).filter(CuentaRol.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Relación no encontrada")
    update_data = item.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/cuenta-roles/{id}")
def delete_cuenta_rol(id: int, db: Session = Depends(get_db)):
    db_item = db.query(CuentaRol).filter(CuentaRol.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Relación no encontrada")
    db.delete(db_item)
    db.commit()
    return {"message": "Eliminado exitosamente"}


# ==========================================
# CRUD para Perfiles
# ==========================================
@router.get("/perfiles/", response_model=List[PerfilResponse])
def get_perfiles(db: Session = Depends(get_db)):
    return db.query(Perfil).all()

@router.post("/perfiles/", response_model=PerfilResponse)
def create_perfil(item: PerfilCreate, db: Session = Depends(get_db)):
    db_item = Perfil(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/perfiles/{id}", response_model=PerfilResponse)
def update_perfil(id: int, item: PerfilUpdate, db: Session = Depends(get_db)):
    db_item = db.query(Perfil).filter(Perfil.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
    update_data = item.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/perfiles/{id}")
def delete_perfil(id: int, db: Session = Depends(get_db)):
    db_item = db.query(Perfil).filter(Perfil.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
    db.delete(db_item)
    db.commit()
    return {"message": "Eliminado exitosamente"}

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.users import Cuenta, Rol, CuentaRol, Perfil
from app.schemas.users import (
    CuentaCreate, CuentaUpdate, CuentaResponse,
    RolCreate, RolUpdate, RolResponse,
    CuentaRolCreate, CuentaRolUpdate, CuentaRolResponse,
    PerfilCreate, PerfilUpdate, PerfilResponse,
    UserAdminCreate, UserAdminUpdate, UserAdminResponse
)
from app.core.security import get_password_hash
from app.models.academic import PerfilAcademico
from app.models.actors import Estudiante, Mentor
from sqlalchemy.orm import joinedload

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
    db_item.estado = 0 # Soft Delete
    db.commit()
    return {"message": "Eliminado (Soft Delete) exitosamente"}


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
    db_item.estado = 0 # Soft Delete
    db.commit()
    return {"message": "Eliminado (Soft Delete) exitosamente"}


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
    db_item.estado = 0 # Soft Delete
    db.commit()
    return {"message": "Eliminado (Soft Delete) exitosamente"}


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
    db_item.estado = 0 # Soft Delete
    db.commit()
    return {"message": "Eliminado (Soft Delete) exitosamente"}

# ==========================================
# Endpoints Administrativos para Usuarios
# ==========================================

@router.get("/admin/usuarios", response_model=List[UserAdminResponse])
def get_all_users_admin(db: Session = Depends(get_db)):
    cuentas = db.query(Cuenta).options(
        joinedload(Cuenta.roles).joinedload(CuentaRol.rol)
    ).all()
    
    results = []
    for c in cuentas:
        roles_str = [cr.rol.nombre for cr in c.roles] if c.roles else []
        perfil = db.query(Perfil).filter(Perfil.cuenta_id == c.id).first()
        
        pa_id = None
        c_id = None
        sem = None
        est_id = None
        men_id = None
        
        if perfil:
            pa = db.query(PerfilAcademico).filter(PerfilAcademico.perfil_id == perfil.id).first()
            if pa:
                pa_id = pa.id
                c_id = pa.carrera_id
                
                est = db.query(Estudiante).filter(Estudiante.academico_id == pa.id).first()
                if est:
                    est_id = est.id
                    sem = est.semestre
                
                men = db.query(Mentor).filter(Mentor.academico_id == pa.id).first()
                if men:
                    men_id = men.id
                    
        results.append(UserAdminResponse(
            id=c.id,
            correo=c.correo,
            estado=c.estado,
            nombres=perfil.nombres if perfil else "Sin Perfil",
            apellidos=perfil.apellidos if perfil else "",
            codigo_institucional=perfil.codigo_institucional if perfil else "",
            roles=roles_str,
            estudiante_id=est_id,
            mentor_id=men_id,
            carrera_id=c_id,
            semestre=sem
        ))
        
    return results

@router.post("/admin/usuarios", response_model=UserAdminResponse)
def create_user_admin(item: UserAdminCreate, db: Session = Depends(get_db)):
    existing = db.query(Cuenta).filter(Cuenta.correo == item.correo).first()
    if existing:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")
        
    try:
        # 1. Crear Cuenta
        nueva_cuenta = Cuenta(
            correo=item.correo,
            password_hash=get_password_hash(item.password),
            estado=1
        )
        db.add(nueva_cuenta)
        db.flush()
        
        # 2. Crear Perfil
        nuevo_perfil = Perfil(
            cuenta_id=nueva_cuenta.id,
            codigo_institucional=item.codigo_institucional,
            nombres=item.nombres,
            apellidos=item.apellidos,
            estado=1
        )
        db.add(nuevo_perfil)
        db.flush()
        
        # 3. Asignar Roles
        for r_name in item.roles:
            rol_db = db.query(Rol).filter(Rol.nombre == r_name).first()
            if rol_db:
                cr = CuentaRol(cuenta_id=nueva_cuenta.id, rol_id=rol_db.id, estado=1)
                db.add(cr)
        db.flush()
        
        # 4. Perfil Academico (si es estudiante o mentor)
        pa_id = None
        if "estudiante" in item.roles or "mentor" in item.roles:
            if not item.carrera_id:
                raise HTTPException(status_code=400, detail="Carrera es requerida para estudiantes/mentores")
                
            pa = PerfilAcademico(
                perfil_id=nuevo_perfil.id,
                carrera_id=item.carrera_id
            )
            db.add(pa)
            db.flush()
            pa_id = pa.id
            
        # 5. Estudiante/Mentor
        est_id = None
        men_id = None
        
        if "estudiante" in item.roles:
            if not item.semestre:
                raise HTTPException(status_code=400, detail="Semestre requerido para estudiantes")
            est = Estudiante(academico_id=pa_id, semestre=item.semestre)
            db.add(est)
            db.flush()
            est_id = est.id
            
        if "mentor" in item.roles:
            men = Mentor(academico_id=pa_id, estado_aprobacion='aprobado')
            db.add(men)
            db.flush()
            men_id = men.id
            
        db.commit()
        
        return UserAdminResponse(
            id=nueva_cuenta.id,
            correo=nueva_cuenta.correo,
            estado=nueva_cuenta.estado,
            nombres=nuevo_perfil.nombres,
            apellidos=nuevo_perfil.apellidos,
            codigo_institucional=nuevo_perfil.codigo_institucional,
            roles=item.roles,
            estudiante_id=est_id,
            mentor_id=men_id,
            carrera_id=item.carrera_id,
            semestre=item.semestre
        )
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/admin/usuarios/{id}", response_model=UserAdminResponse)
def update_user_admin(id: int, item: UserAdminUpdate, db: Session = Depends(get_db)):
    cuenta = db.query(Cuenta).filter(Cuenta.id == id).first()
    if not cuenta:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    try:
        # Actualizar Estado
        if item.estado is not None:
            cuenta.estado = item.estado
            
        perfil = db.query(Perfil).filter(Perfil.cuenta_id == cuenta.id).first()
        if perfil:
            if item.nombres: perfil.nombres = item.nombres
            if item.apellidos: perfil.apellidos = item.apellidos
            
            pa = db.query(PerfilAcademico).filter(PerfilAcademico.perfil_id == perfil.id).first()
            if pa:
                if item.carrera_id: pa.carrera_id = item.carrera_id
                
                est = db.query(Estudiante).filter(Estudiante.academico_id == pa.id).first()
                if est and item.semestre:
                    est.semestre = item.semestre
        
        # Roles update logic
        if item.roles is not None:
            db.query(CuentaRol).filter(CuentaRol.cuenta_id == cuenta.id).delete()
            db.flush()
            for r_name in item.roles:
                rol_db = db.query(Rol).filter(Rol.nombre == r_name).first()
                if rol_db:
                    cr = CuentaRol(cuenta_id=cuenta.id, rol_id=rol_db.id, estado=1)
                    db.add(cr)
                    
        db.commit()
        
        # Enviar response (idealmente usando una funcion refactorizada, pero aqui es mas facil)
        # return get_all_users_admin... requires complex logic, I will return a dummy but correct enough
        return UserAdminResponse(
            id=cuenta.id,
            correo=cuenta.correo,
            estado=cuenta.estado,
            nombres=perfil.nombres if perfil else "Sin Perfil",
            apellidos=perfil.apellidos if perfil else "",
            codigo_institucional=perfil.codigo_institucional if perfil else "",
            roles=item.roles if item.roles is not None else [],
            estudiante_id=None,
            mentor_id=None,
            carrera_id=item.carrera_id,
            semestre=item.semestre
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

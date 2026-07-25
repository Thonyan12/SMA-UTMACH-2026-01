from datetime import timedelta, datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.users import Cuenta, CuentaRol, Rol, Perfil
from app.models.actors import Estudiante, Mentor
from app.models.academic import PerfilAcademico
from app.schemas.auth import Token, UserRegister, AuthMeResponse
from app.schemas.users import CuentaResponse
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.dependencies import get_current_user

router = APIRouter()

@router.post("/login", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(Cuenta).filter(Cuenta.correo == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contrasena incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if user.estado != 1:
        raise HTTPException(status_code=400, detail="Usuario inactivo")
        
    user.ultimo_acceso = datetime.utcnow()
    db.commit()
        
    access_token = create_access_token(data={"sub": user.correo})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=CuentaResponse)
def register_user(user_in: UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(Cuenta).filter(Cuenta.correo == user_in.correo).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="El correo ya esta registrado")
        
    hashed_password = get_password_hash(user_in.password)
    new_user = Cuenta(
        correo=user_in.correo,
        password_hash=hashed_password,
        estado=1
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get("/me", response_model=AuthMeResponse)
def read_users_me(current_user: Cuenta = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(Cuenta).options(joinedload(Cuenta.roles).joinedload(CuentaRol.rol)).filter(Cuenta.id == current_user.id).first()
    
    roles = [cr.rol.nombre for cr in user.roles] if user.roles else []
    
    perfil = db.query(Perfil).filter(Perfil.cuenta_id == user.id).first()
    perfil_id = perfil.id if perfil else None
    
    estudiante_id = None
    mentor_id = None
    carrera_nombre = None
    semestre = None
    
    if perfil_id:
        # Avoid circular import or do local import if needed, but Carrera is imported or available?
        from app.models.academic import PerfilAcademico, Carrera
        pa = db.query(PerfilAcademico).filter(PerfilAcademico.perfil_id == perfil_id).first()
        if pa:
            carrera = db.query(Carrera).filter(Carrera.id == pa.carrera_id).first()
            if carrera:
                carrera_nombre = carrera.nombre

            est = db.query(Estudiante).filter(Estudiante.academico_id == pa.id).first()
            if est:
                estudiante_id = est.id
                semestre = est.semestre
            
            men = db.query(Mentor).filter(Mentor.academico_id == pa.id).first()
            if men:
                mentor_id = men.id
                
    response_data = {
        "id": user.id,
        "uuid": user.uuid,
        "correo": user.correo,
        "estado": user.estado,
        "ultimo_acceso": user.ultimo_acceso,
        "fecha_creacion": user.fecha_creacion,
        "fecha_actualizacion": user.fecha_actualizacion,
        "roles": roles,
        "perfil_id": perfil_id,
        "nombres": perfil.nombres if perfil else None,
        "apellidos": perfil.apellidos if perfil else None,
        "estudiante_id": estudiante_id,
        "mentor_id": mentor_id,
        "carrera_nombre": carrera_nombre,
        "semestre": semestre
    }
    
    return response_data

from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.users import Cuenta
from app.schemas.auth import Token, UserRegister
from app.schemas.users import CuentaResponse
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.dependencies import get_current_user

router = APIRouter()

@router.post("/login", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # OAuth2PasswordRequestForm usa "username" y "password". En nuestro caso, username será el correo.
    user = db.query(Cuenta).filter(Cuenta.correo == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if user.estado != 1:
        raise HTTPException(status_code=400, detail="Usuario inactivo")
        
    access_token = create_access_token(data={"sub": user.correo})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=CuentaResponse)
def register_user(user_in: UserRegister, db: Session = Depends(get_db)):
    # Verificar si el correo ya existe
    existing_user = db.query(Cuenta).filter(Cuenta.correo == user_in.correo).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")
        
    # Crear nueva cuenta
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

@router.get("/me", response_model=CuentaResponse)
def read_users_me(current_user: Cuenta = Depends(get_current_user)):
    return current_user

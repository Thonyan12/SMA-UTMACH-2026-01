from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload

from app.core.config import settings
from app.database import get_db
from app.models.users import Cuenta

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        correo: str = payload.get("sub")
        if correo is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Load cuenta with its roles eager-loaded to avoid N+1 queries when checking roles
    user = db.query(Cuenta).options(
        joinedload(Cuenta.roles).joinedload("rol")
    ).filter(Cuenta.correo == correo).first()

    if user is None:
        raise credentials_exception
    if user.estado != 1:
        raise HTTPException(status_code=400, detail="Usuario inactivo")
    return user

def require_roles(allowed_roles: list[str]):
    def role_checker(current_user: Cuenta = Depends(get_current_user)):
        # Extract role names from the user's assigned roles
        user_roles = [cr.rol.nombre.lower() for cr.rol in current_user.roles if cr.estado == 1 and cr.rol.estado == 1]
        
        # Check if any of the user's roles are in the allowed_roles list
        if not any(role.lower() in allowed_roles for role in user_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes los permisos suficientes para realizar esta acción."
            )
        return current_user
    return role_checker

from pydantic import BaseModel, EmailStr
from typing import Optional, List
from app.schemas.users import CuentaResponse

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    correo: Optional[str] = None

class UserRegister(BaseModel):
    correo: EmailStr
    password: str

class UserLogin(BaseModel):
    correo: EmailStr
    password: str

class AuthMeResponse(CuentaResponse):
    roles: List[str] = []
    perfil_id: Optional[int] = None
    nombres: Optional[str] = None
    apellidos: Optional[str] = None
    estudiante_id: Optional[int] = None
    mentor_id: Optional[int] = None

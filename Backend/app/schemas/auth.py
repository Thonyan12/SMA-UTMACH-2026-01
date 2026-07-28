from pydantic import BaseModel, EmailStr
from typing import Optional, List
from app.schemas.users import CuentaResponse

class Token(BaseModel):
    access_token: Optional[str] = None
    token_type: Optional[str] = None
    requires_2fa: Optional[bool] = False
    cuenta_id: Optional[int] = None
    message: Optional[str] = None

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
    carrera_nombre: Optional[str] = None
    semestre: Optional[int] = None

class ForgotPasswordRequest(BaseModel):
    correo: EmailStr

class ResetPasswordRequest(BaseModel):
    correo: EmailStr
    codigo: str
    nueva_password: str

class Verify2FARequest(BaseModel):
    cuenta_id: int
    codigo: str
    device_id: str

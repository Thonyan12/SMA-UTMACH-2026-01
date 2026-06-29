from pydantic import BaseModel, EmailStr
from typing import Optional

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

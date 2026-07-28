from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime

# =======================
# Cuentas
# =======================
class CuentaBase(BaseModel):
    correo: EmailStr
    estado: int = 1

class CuentaCreate(CuentaBase):
    password_hash: str

class CuentaUpdate(BaseModel):
    correo: Optional[EmailStr] = None
    password_hash: Optional[str] = None
    estado: Optional[int] = None

class CuentaResponse(CuentaBase):
    id: int
    uuid: Optional[str]
    ultimo_acceso: Optional[datetime]
    fecha_creacion: datetime
    fecha_actualizacion: datetime

    @field_validator('uuid', mode='before')
    @classmethod
    def parse_uuid(cls, v):
        if isinstance(v, bytes):
            return v.hex()
        return v

    class Config:
        from_attributes = True

# =======================
# Roles
# =======================
class RolBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    estado: int = 1

class RolCreate(RolBase):
    pass

class RolUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    estado: Optional[int] = None

class RolResponse(RolBase):
    id: int
    fecha_creacion: datetime
    fecha_actualizacion: datetime

    class Config:
        from_attributes = True

# =======================
# CuentaRoles
# =======================
class CuentaRolBase(BaseModel):
    cuenta_id: int
    rol_id: int
    asignado_por: Optional[int] = None
    estado: int = 1

class CuentaRolCreate(CuentaRolBase):
    pass

class CuentaRolUpdate(BaseModel):
    estado: Optional[int] = None

class CuentaRolResponse(CuentaRolBase):
    id: int
    fecha_creacion: datetime
    fecha_actualizacion: datetime

    class Config:
        from_attributes = True

# =======================
# Perfiles
# =======================
class PerfilBase(BaseModel):
    cuenta_id: int
    codigo_institucional: str
    nombres: str
    apellidos: str
    foto_perfil_url: Optional[str] = None
    estado: int = 1

class PerfilCreate(PerfilBase):
    pass

class PerfilUpdate(BaseModel):
    codigo_institucional: Optional[str] = None
    nombres: Optional[str] = None
    apellidos: Optional[str] = None
    foto_perfil_url: Optional[str] = None
    estado: Optional[int] = None

class PerfilResponse(PerfilBase):
    id: int
    fecha_creacion: datetime
    fecha_actualizacion: datetime

    class Config:
        from_attributes = True

# =======================
# Admin Gestión Usuarios
# =======================
class UserAdminCreate(BaseModel):
    correo: EmailStr
    password: str
    codigo_institucional: str
    nombres: str
    apellidos: str
    roles: List[str] # ["estudiante", "mentor", "administrador"]
    carrera_id: Optional[int] = None
    semestre: Optional[int] = None

class UserAdminUpdate(BaseModel):
    nombres: Optional[str] = None
    apellidos: Optional[str] = None
    roles: Optional[List[str]] = None
    estado: Optional[int] = None
    carrera_id: Optional[int] = None
    semestre: Optional[int] = None

class UserAdminResponse(BaseModel):
    id: int
    correo: str
    estado: int
    nombres: str
    apellidos: str
    codigo_institucional: str
    roles: List[str]
    estudiante_id: Optional[int] = None
    mentor_id: Optional[int] = None
    carrera_id: Optional[int] = None
    semestre: Optional[int] = None

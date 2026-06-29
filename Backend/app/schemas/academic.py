from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# =======================
# Facultades
# =======================
class FacultadBase(BaseModel):
    codigo: str
    nombre: str
    descripcion: Optional[str] = None
    estado: int = 1

class FacultadCreate(FacultadBase):
    pass

class FacultadUpdate(BaseModel):
    codigo: Optional[str] = None
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    estado: Optional[int] = None

class FacultadResponse(FacultadBase):
    id: int
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    class Config:
        from_attributes = True

# =======================
# Carreras
# =======================
class CarreraBase(BaseModel):
    codigo: str
    nombre: str
    facultad_id: int
    descripcion: Optional[str] = None
    estado: int = 1

class CarreraCreate(CarreraBase):
    pass

class CarreraUpdate(BaseModel):
    codigo: Optional[str] = None
    nombre: Optional[str] = None
    facultad_id: Optional[int] = None
    descripcion: Optional[str] = None
    estado: Optional[int] = None

class CarreraResponse(CarreraBase):
    id: int
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    class Config:
        from_attributes = True

# =======================
# Materias
# =======================
class MateriaBase(BaseModel):
    codigo: str
    nombre: str
    descripcion: Optional[str] = None
    nivel: int
    creditos: Optional[int] = None
    estado: int = 1

class MateriaCreate(MateriaBase):
    pass

class MateriaUpdate(BaseModel):
    codigo: Optional[str] = None
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    nivel: Optional[int] = None
    creditos: Optional[int] = None
    estado: Optional[int] = None

class MateriaResponse(MateriaBase):
    id: int
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    class Config:
        from_attributes = True

# =======================
# CarreraMaterias
# =======================
class CarreraMateriaBase(BaseModel):
    carrera_id: int
    materia_id: int
    estado: int = 1

class CarreraMateriaCreate(CarreraMateriaBase):
    pass

class CarreraMateriaUpdate(BaseModel):
    estado: Optional[int] = None

class CarreraMateriaResponse(CarreraMateriaBase):
    id: int
    fecha_creacion: datetime
    class Config:
        from_attributes = True

# =======================
# PerfilesAcademicos
# =======================
class PerfilAcademicoBase(BaseModel):
    perfil_id: int
    carrera_id: int

class PerfilAcademicoCreate(PerfilAcademicoBase):
    pass

class PerfilAcademicoUpdate(BaseModel):
    carrera_id: Optional[int] = None

class PerfilAcademicoResponse(PerfilAcademicoBase):
    id: int
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    class Config:
        from_attributes = True

# =======================
# FacultadDirectores
# =======================
class FacultadDirectorBase(BaseModel):
    facultad_id: int
    perfil_id: int
    fecha_inicio: datetime
    fecha_fin: Optional[datetime] = None
    estado: int = 1

class FacultadDirectorCreate(FacultadDirectorBase):
    pass

class FacultadDirectorUpdate(BaseModel):
    fecha_inicio: Optional[datetime] = None
    fecha_fin: Optional[datetime] = None
    estado: Optional[int] = None

class FacultadDirectorResponse(FacultadDirectorBase):
    id: int
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    class Config:
        from_attributes = True

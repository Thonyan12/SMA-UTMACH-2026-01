from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# =======================
# Estudiantes
# =======================
class EstudianteBase(BaseModel):
    academico_id: int
    semestre: int
    estado: int = 1

class EstudianteCreate(EstudianteBase):
    pass

class EstudianteUpdate(BaseModel):
    semestre: Optional[int] = None
    estado: Optional[int] = None

class EstudianteResponse(EstudianteBase):
    id: int
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    class Config:
        from_attributes = True

# =======================
# Mentores
# =======================
class MentorBase(BaseModel):
    academico_id: int
    biografia: Optional[str] = None
    experiencia: Optional[str] = None
    estado_aprobacion: str = "pendiente"
    aprobado_por: Optional[int] = None
    observaciones_admin: Optional[str] = None
    estado: int = 1

class MentorCreate(MentorBase):
    pass

class MentorUpdate(BaseModel):
    biografia: Optional[str] = None
    experiencia: Optional[str] = None
    estado_aprobacion: Optional[str] = None
    aprobado_por: Optional[int] = None
    observaciones_admin: Optional[str] = None
    estado: Optional[int] = None

class MentorResponse(MentorBase):
    id: int
    fecha_aprobacion: Optional[datetime] = None
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    class Config:
        from_attributes = True

# =======================
# MentorEspecialidades
# =======================
class MentorEspecialidadBase(BaseModel):
    mentor_id: int
    materia_id: int
    nivel_dominio: int = 3
    descripcion: Optional[str] = None
    estado: int = 1

class MentorEspecialidadCreate(MentorEspecialidadBase):
    pass

class MentorEspecialidadUpdate(BaseModel):
    nivel_dominio: Optional[int] = None
    descripcion: Optional[str] = None
    estado: Optional[int] = None

class MentorEspecialidadResponse(MentorEspecialidadBase):
    id: int
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    class Config:
        from_attributes = True

# =======================
# DisponibilidadMentor
# =======================
class DisponibilidadMentorBase(BaseModel):
    mentor_id: int
    dia_id: int
    hora_inicio_min: int
    hora_fin_min: int
    activo: int = 1
    estado: int = 1

class DisponibilidadMentorCreate(DisponibilidadMentorBase):
    pass

class DisponibilidadMentorUpdate(BaseModel):
    dia_id: Optional[int] = None
    hora_inicio_min: Optional[int] = None
    hora_fin_min: Optional[int] = None
    activo: Optional[int] = None
    estado: Optional[int] = None

class DisponibilidadMentorResponse(DisponibilidadMentorBase):
    id: int
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    class Config:
        from_attributes = True

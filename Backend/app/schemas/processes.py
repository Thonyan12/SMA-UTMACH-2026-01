from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# =======================
# SolicitudesMentoria
# =======================
class SolicitudMentoriaBase(BaseModel):
    estudiante_id: int
    mentor_id: Optional[int] = None
    materia_id: int
    descripcion: str
    fecha_hora_deseada: datetime
    prioridad: str = "media"
    estado_solicitud: str = "pendiente"
    motivo_rechazo: Optional[str] = None

class SolicitudMentoriaCreate(SolicitudMentoriaBase):
    pass

class SolicitudMentoriaUpdate(BaseModel):
    mentor_id: Optional[int] = None
    descripcion: Optional[str] = None
    fecha_hora_deseada: Optional[datetime] = None
    prioridad: Optional[str] = None
    estado_solicitud: Optional[str] = None
    motivo_rechazo: Optional[str] = None

class SolicitudMentoriaResponse(SolicitudMentoriaBase):
    id: int
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    class Config:
        from_attributes = True

# =======================
# SesionesMentoria
# =======================
class SesionMentoriaBase(BaseModel):
    solicitud_id: int
    inicio: datetime
    fin: datetime
    enlace_teams: Optional[str] = None
    observaciones: Optional[str] = None
    estado_sesion: str = "programada"

class SesionMentoriaCreate(SesionMentoriaBase):
    pass

class SesionMentoriaUpdate(BaseModel):
    inicio: Optional[datetime] = None
    fin: Optional[datetime] = None
    enlace_teams: Optional[str] = None
    observaciones: Optional[str] = None
    estado_sesion: Optional[str] = None

class SesionMentoriaResponse(SesionMentoriaBase):
    id: int
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    class Config:
        from_attributes = True

# =======================
# Calificaciones
# =======================
class CalificacionBase(BaseModel):
    sesion_id: int
    puntualidad: int
    claridad: int
    dominio_tema: int
    comentario: Optional[str] = None
    estado: int = 1

class CalificacionCreate(CalificacionBase):
    pass

class CalificacionUpdate(BaseModel):
    puntualidad: Optional[int] = None
    claridad: Optional[int] = None
    dominio_tema: Optional[int] = None
    comentario: Optional[str] = None
    estado: Optional[int] = None

class CalificacionResponse(CalificacionBase):
    id: int
    puntaje_total: Optional[float] = None
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    class Config:
        from_attributes = True

# =======================
# Notificaciones
# =======================
class NotificacionBase(BaseModel):
    cuenta_id: int
    tipo: str = "sistema"
    titulo: str
    mensaje: str
    leido: int = 0
    solicitud_id: Optional[int] = None
    sesion_id: Optional[int] = None
    url_referencia: Optional[str] = None
    fecha_leido: Optional[datetime] = None
    estado: int = 1

class NotificacionCreate(NotificacionBase):
    pass

class NotificacionUpdate(BaseModel):
    leido: Optional[int] = None
    fecha_leido: Optional[datetime] = None
    estado: Optional[int] = None

class NotificacionResponse(NotificacionBase):
    id: int
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    class Config:
        from_attributes = True

# =======================
# HistorialCambios
# =======================
class HistorialCambioBase(BaseModel):
    tabla_id: int
    registro_id: int
    accion: str
    datos_anteriores: Optional[str] = None
    datos_nuevos: Optional[str] = None
    cuenta_id: Optional[int] = None
    ip_origen: Optional[str] = None
    descripcion: Optional[str] = None
    db_user: str = "SYSTEM"
    detalles_json: Optional[str] = None
    estado: int = 1

class HistorialCambioCreate(HistorialCambioBase):
    pass

class HistorialCambioUpdate(BaseModel):
    estado: Optional[int] = None

class HistorialCambioResponse(HistorialCambioBase):
    id: int
    fecha_creacion: datetime
    class Config:
        from_attributes = True

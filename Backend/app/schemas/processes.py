from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

# =======================
# Postulaciones Mentor
# =======================
class PostulacionMentorBase(BaseModel):
    motivo: str

class PostulacionMentorCreate(PostulacionMentorBase):
    pass

class PostulacionMentorResponse(PostulacionMentorBase):
    id: int
    estudiante_id: int
    estado: str
    fecha_solicitud: datetime
    fecha_resolucion: Optional[datetime] = None
    motivo_rechazo: Optional[str] = None
    
    # Virtual fields for admin display
    estudiante_nombre: Optional[str] = None
    carrera_nombre: Optional[str] = None
    semestre: Optional[int] = None
    
    class Config:
        from_attributes = True

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
    enlace_teams: Optional[str] = None

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
# Dashboard Estadisticas
# =======================
class EstadisticasResponse(BaseModel):
    total_estudiantes: int
    total_mentores: int
    total_solicitudes: int
    solicitudes_por_estado: List[Dict[str, Any]]
    solicitudes_por_materia: List[Dict[str, Any]]
    tendencia_solicitudes: List[Dict[str, Any]] = []
    ranking_mentores: List[Dict[str, Any]] = []

# =======================
# Logros y Gamificacion
# =======================
class CatLogroResponse(BaseModel):
    id: int
    nombre: str
    descripcion: str
    icono: str
    puntos_requeridos: int
    fecha_creacion: datetime
    class Config:
        from_attributes = True

class MentorLogroResponse(BaseModel):
    id: int
    mentor_id: int
    logro_id: int
    fecha_obtenido: datetime
    logro: CatLogroResponse
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

# =======================
# MensajesSesion
# =======================
class MensajeSesionBase(BaseModel):
    sesion_id: int
    remitente_id: int
    mensaje: str

class MensajeSesionCreate(MensajeSesionBase):
    pass

class MensajeSesionResponse(MensajeSesionBase):
    id: int
    fecha_envio: datetime
    remitente_nombre: Optional[str] = None
    class Config:
        from_attributes = True

# =======================
# RecursosSesion
# =======================
class RecursoSesionBase(BaseModel):
    sesion_id: int
    subido_por: int
    nombre_archivo: str
    url_archivo: str

class RecursoSesionCreate(RecursoSesionBase):
    pass

class RecursoSesionResponse(RecursoSesionBase):
    id: int
    fecha_subida: datetime
    subido_por_nombre: Optional[str] = None
    class Config:
        from_attributes = True

# =======================
# ReportesSesion
# =======================
class ReporteSesionBase(BaseModel):
    sesion_id: int
    reportador_id: int
    descripcion: str

class ReporteSesionCreate(ReporteSesionBase):
    pass

class ReporteSesionResponse(ReporteSesionBase):
    id: int
    estado: str
    fecha_creacion: datetime
    reportador_nombre: Optional[str] = None
    class Config:
        from_attributes = True

# =======================
# Directorio
# =======================
class DirectorioMentorResponse(BaseModel):
    id: int
    nombres: str
    apellidos: str
    biografia: Optional[str]
    experiencia: Optional[str]
    promedio_calificacion: float
    total_sesiones: int
    especialidades: List[Dict[str, Any]]


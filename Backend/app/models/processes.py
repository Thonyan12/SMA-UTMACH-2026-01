from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey, Boolean, Float, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base

class SolicitudMentoria(Base):
    __tablename__ = "solicitudes_mentoria"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    estudiante_id = Column(Integer, ForeignKey("estudiantes.id", ondelete="CASCADE"), nullable=False)
    mentor_id = Column(Integer, ForeignKey("mentores.id", ondelete="CASCADE"))
    materia_id = Column(Integer, ForeignKey("materias.id", ondelete="CASCADE"), nullable=False)
    descripcion = Column(String(4000), nullable=False)
    fecha_hora_deseada = Column(TIMESTAMP, nullable=False)
    prioridad = Column(String(20), default="media", nullable=False)
    estado_solicitud = Column(String(20), ForeignKey("cat_estado_solicitud.codigo"), default="pendiente", nullable=False)
    motivo_rechazo = Column(String(4000))
    fecha_creacion = Column(TIMESTAMP, default=datetime.utcnow, nullable=False)
    fecha_actualizacion = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    estudiante = relationship("Estudiante", back_populates="solicitudes")
    mentor = relationship("Mentor", back_populates="solicitudes")
    sesion = relationship("SesionMentoria", back_populates="solicitud", uselist=False)
    notificaciones = relationship("Notificacion", back_populates="solicitud")

class SesionMentoria(Base):
    __tablename__ = "sesiones_mentoria"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    solicitud_id = Column(Integer, ForeignKey("solicitudes_mentoria.id", ondelete="CASCADE"), unique=True, nullable=False)
    inicio = Column(TIMESTAMP, nullable=False)
    fin = Column(TIMESTAMP, nullable=False)
    enlace_teams = Column(String(4000))
    observaciones = Column(String(4000))
    estado_sesion = Column(String(20), ForeignKey("cat_estado_sesion.codigo"), default="programada", nullable=False)
    fecha_creacion = Column(TIMESTAMP, default=datetime.utcnow, nullable=False)
    fecha_actualizacion = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    solicitud = relationship("SolicitudMentoria", back_populates="sesion")
    calificacion = relationship("Calificacion", back_populates="sesion", uselist=False)
    notificaciones = relationship("Notificacion", back_populates="sesion")

class Calificacion(Base):
    __tablename__ = "calificaciones"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sesion_id = Column(Integer, ForeignKey("sesiones_mentoria.id", ondelete="CASCADE"), unique=True, nullable=False)
    puntualidad = Column(Integer, nullable=False)
    claridad = Column(Integer, nullable=False)
    dominio_tema = Column(Integer, nullable=False)
    # puntaje_total is a VIRTUAL column in Oracle, we can omit it from Inserts/Updates, or map it as read-only.
    # We will map it to fetch it but not write to it.
    puntaje_total = Column(Float, nullable=True) 
    comentario = Column(String(4000))
    estado = Column(Integer, default=1, nullable=False)
    fecha_creacion = Column(TIMESTAMP, default=datetime.utcnow, nullable=False)
    fecha_actualizacion = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    sesion = relationship("SesionMentoria", back_populates="calificacion")

class Notificacion(Base):
    __tablename__ = "notificaciones"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    cuenta_id = Column(Integer, ForeignKey("cuentas.id", ondelete="CASCADE"), nullable=False)
    tipo = Column(String(20), default="sistema", nullable=False)
    titulo = Column(String(200), nullable=False)
    mensaje = Column(String(4000), nullable=False)
    leido = Column(Integer, default=0, nullable=False)
    solicitud_id = Column(Integer, ForeignKey("solicitudes_mentoria.id", ondelete="CASCADE"))
    sesion_id = Column(Integer, ForeignKey("sesiones_mentoria.id", ondelete="CASCADE"))
    url_referencia = Column(String(512))
    fecha_leido = Column(TIMESTAMP)
    estado = Column(Integer, default=1, nullable=False)
    fecha_creacion = Column(TIMESTAMP, default=datetime.utcnow, nullable=False)
    fecha_actualizacion = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    solicitud = relationship("SolicitudMentoria", back_populates="notificaciones")
    sesion = relationship("SesionMentoria", back_populates="notificaciones")

class HistorialCambio(Base):
    __tablename__ = "historial_cambios"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tabla_id = Column(Integer, ForeignKey("tablas_sistema.id", ondelete="CASCADE"), nullable=False)
    registro_id = Column(Integer, nullable=False)
    accion = Column(String(20), nullable=False)
    datos_anteriores = Column(Text)
    datos_nuevos = Column(Text)
    cuenta_id = Column(Integer, ForeignKey("cuentas.id", ondelete="SET NULL"))
    ip_origen = Column(String(45))
    descripcion = Column(String(4000))
    db_user = Column(String(128), nullable=False)
    detalles_json = Column(Text)
    estado = Column(Integer, default=1, nullable=False)
    fecha_creacion = Column(TIMESTAMP, default=datetime.utcnow, nullable=False)

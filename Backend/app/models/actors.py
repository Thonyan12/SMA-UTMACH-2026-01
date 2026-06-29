from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base

class Estudiante(Base):
    __tablename__ = "estudiantes"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    academico_id = Column(Integer, ForeignKey("perfiles_academicos.id", ondelete="CASCADE"), unique=True, nullable=False)
    semestre = Column(Integer, nullable=False)
    estado = Column(Integer, default=1, nullable=False)
    fecha_creacion = Column(TIMESTAMP, default=datetime.utcnow, nullable=False)
    fecha_actualizacion = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    solicitudes = relationship("SolicitudMentoria", back_populates="estudiante")

class Mentor(Base):
    __tablename__ = "mentores"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    academico_id = Column(Integer, ForeignKey("perfiles_academicos.id", ondelete="CASCADE"), unique=True, nullable=False)
    biografia = Column(String(4000))
    experiencia = Column(String(4000))
    estado_aprobacion = Column(String(20), ForeignKey("cat_estado_aprobacion.codigo"), default="pendiente", nullable=False)
    aprobado_por = Column(Integer, ForeignKey("cuentas.id", ondelete="SET NULL"))
    fecha_aprobacion = Column(TIMESTAMP)
    observaciones_admin = Column(String(4000))
    estado = Column(Integer, default=1, nullable=False)
    fecha_creacion = Column(TIMESTAMP, default=datetime.utcnow, nullable=False)
    fecha_actualizacion = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    especialidades = relationship("MentorEspecialidad", back_populates="mentor")
    disponibilidades = relationship("DisponibilidadMentor", back_populates="mentor")
    solicitudes = relationship("SolicitudMentoria", back_populates="mentor")

class MentorEspecialidad(Base):
    __tablename__ = "mentor_especialidades"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    mentor_id = Column(Integer, ForeignKey("mentores.id", ondelete="CASCADE"), nullable=False)
    materia_id = Column(Integer, ForeignKey("materias.id", ondelete="CASCADE"), nullable=False)
    nivel_dominio = Column(Integer, default=3, nullable=False)
    descripcion = Column(String(4000))
    estado = Column(Integer, default=1, nullable=False)
    fecha_creacion = Column(TIMESTAMP, default=datetime.utcnow, nullable=False)
    fecha_actualizacion = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    mentor = relationship("Mentor", back_populates="especialidades")

class DisponibilidadMentor(Base):
    __tablename__ = "disponibilidad_mentor"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    mentor_id = Column(Integer, ForeignKey("mentores.id", ondelete="CASCADE"), nullable=False)
    dia_id = Column(Integer, ForeignKey("cat_dias.id"), nullable=False)
    hora_inicio_min = Column(Integer, nullable=False)
    hora_fin_min = Column(Integer, nullable=False)
    activo = Column(Integer, default=1, nullable=False)
    estado = Column(Integer, default=1, nullable=False)
    fecha_creacion = Column(TIMESTAMP, default=datetime.utcnow, nullable=False)
    fecha_actualizacion = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    mentor = relationship("Mentor", back_populates="disponibilidades")

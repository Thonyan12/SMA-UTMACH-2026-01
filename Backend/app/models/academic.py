from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base

class Facultad(Base):
    __tablename__ = "facultades"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    codigo = Column(String(20), unique=True, nullable=False)
    nombre = Column(String(150), nullable=False)
    descripcion = Column(String(4000))
    estado = Column(Integer, default=1, nullable=False)
    fecha_creacion = Column(TIMESTAMP, default=datetime.utcnow, nullable=False)
    fecha_actualizacion = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    carreras = relationship("Carrera", back_populates="facultad")

class Carrera(Base):
    __tablename__ = "carreras"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    codigo = Column(String(20), unique=True, nullable=False)
    nombre = Column(String(150), nullable=False)
    facultad_id = Column(Integer, ForeignKey("facultades.id", ondelete="CASCADE"), nullable=False)
    descripcion = Column(String(4000))
    estado = Column(Integer, default=1, nullable=False)
    fecha_creacion = Column(TIMESTAMP, default=datetime.utcnow, nullable=False)
    fecha_actualizacion = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    facultad = relationship("Facultad", back_populates="carreras")
    carrera_materias = relationship("CarreraMateria", back_populates="carrera")
    perfiles_academicos = relationship("PerfilAcademico", back_populates="carrera")

class Materia(Base):
    __tablename__ = "materias"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    codigo = Column(String(20), unique=True, nullable=False)
    nombre = Column(String(150), nullable=False)
    descripcion = Column(String(4000))
    nivel = Column(Integer, nullable=False)
    creditos = Column(Integer)
    estado = Column(Integer, default=1, nullable=False)
    fecha_creacion = Column(TIMESTAMP, default=datetime.utcnow, nullable=False)
    fecha_actualizacion = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    carrera_materias = relationship("CarreraMateria", back_populates="materia")

class CarreraMateria(Base):
    __tablename__ = "carrera_materias"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    carrera_id = Column(Integer, ForeignKey("carreras.id", ondelete="CASCADE"), nullable=False)
    materia_id = Column(Integer, ForeignKey("materias.id", ondelete="CASCADE"), nullable=False)
    estado = Column(Integer, default=1, nullable=False)
    fecha_creacion = Column(TIMESTAMP, default=datetime.utcnow, nullable=False)

    carrera = relationship("Carrera", back_populates="carrera_materias")
    materia = relationship("Materia", back_populates="carrera_materias")

class PerfilAcademico(Base):
    __tablename__ = "perfiles_academicos"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    perfil_id = Column(Integer, ForeignKey("perfiles.id", ondelete="CASCADE"), unique=True, nullable=False)
    carrera_id = Column(Integer, ForeignKey("carreras.id", ondelete="CASCADE"), nullable=False)
    fecha_creacion = Column(TIMESTAMP, default=datetime.utcnow, nullable=False)
    fecha_actualizacion = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    carrera = relationship("Carrera", back_populates="perfiles_academicos")

class FacultadDirector(Base):
    __tablename__ = "facultad_directores"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    facultad_id = Column(Integer, ForeignKey("facultades.id", ondelete="CASCADE"), nullable=False)
    perfil_id = Column(Integer, ForeignKey("perfiles.id"), nullable=False)
    fecha_inicio = Column(TIMESTAMP, nullable=False)
    fecha_fin = Column(TIMESTAMP)
    estado = Column(Integer, default=1, nullable=False)
    fecha_creacion = Column(TIMESTAMP, default=datetime.utcnow, nullable=False)
    fecha_actualizacion = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

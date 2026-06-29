from sqlalchemy import Column, Integer, String
from app.database import Base

class CatEstadoAprobacion(Base):
    __tablename__ = "cat_estado_aprobacion"
    codigo = Column(String(20), primary_key=True, index=True)
    descripcion = Column(String(100), nullable=False)

class CatEstadoSolicitud(Base):
    __tablename__ = "cat_estado_solicitud"
    codigo = Column(String(20), primary_key=True, index=True)
    descripcion = Column(String(100), nullable=False)

class CatEstadoSesion(Base):
    __tablename__ = "cat_estado_sesion"
    codigo = Column(String(20), primary_key=True, index=True)
    descripcion = Column(String(100), nullable=False)

class CatDias(Base):
    __tablename__ = "cat_dias"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(20), unique=True, nullable=False)

class TablasSistema(Base):
    __tablename__ = "tablas_sistema"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), unique=True, nullable=False)
    descripcion = Column(String(4000))
    estado = Column(Integer, default=1, nullable=False)

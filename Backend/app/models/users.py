from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey, Boolean, text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base

class Cuenta(Base):
    __tablename__ = "cuentas"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    uuid = Column(String(32), unique=True, index=True) # RAW(16) in Oracle, often handled as string in SQLAlchemy
    correo = Column(String(180), unique=True, index=True, nullable=False)
    password_hash = Column(String(500), nullable=False)
    ultimo_acceso = Column(TIMESTAMP)
    estado = Column(Integer, default=1, nullable=False)
    fecha_creacion = Column(TIMESTAMP, default=datetime.utcnow, nullable=False)
    fecha_actualizacion = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    perfil = relationship("Perfil", back_populates="cuenta", uselist=False)
    roles = relationship("CuentaRol", back_populates="cuenta")

class Rol(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(50), unique=True, nullable=False)
    descripcion = Column(String(4000))
    estado = Column(Integer, default=1, nullable=False)
    fecha_creacion = Column(TIMESTAMP, default=datetime.utcnow, nullable=False)
    fecha_actualizacion = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    cuenta_roles = relationship("CuentaRol", back_populates="rol")

class CuentaRol(Base):
    __tablename__ = "cuenta_roles"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    cuenta_id = Column(Integer, ForeignKey("cuentas.id", ondelete="CASCADE"), nullable=False)
    rol_id = Column(Integer, ForeignKey("roles.id", ondelete="CASCADE"), nullable=False)
    asignado_por = Column(Integer, ForeignKey("cuentas.id", ondelete="SET NULL"), nullable=True)
    estado = Column(Integer, default=1, nullable=False)
    fecha_creacion = Column(TIMESTAMP, default=datetime.utcnow, nullable=False)
    fecha_actualizacion = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    cuenta = relationship("Cuenta", foreign_keys=[cuenta_id], back_populates="roles")
    rol = relationship("Rol", back_populates="cuenta_roles")

class Perfil(Base):
    __tablename__ = "perfiles"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    cuenta_id = Column(Integer, ForeignKey("cuentas.id", ondelete="CASCADE"), unique=True, nullable=False)
    codigo_institucional = Column(String(20), unique=True, nullable=False)
    nombres = Column(String(100), nullable=False)
    apellidos = Column(String(100), nullable=False)
    foto_perfil_url = Column(String(512))
    estado = Column(Integer, default=1, nullable=False)
    fecha_creacion = Column(TIMESTAMP, default=datetime.utcnow, nullable=False)
    fecha_actualizacion = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    cuenta = relationship("Cuenta", back_populates="perfil")

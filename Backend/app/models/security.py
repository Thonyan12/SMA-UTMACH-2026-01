from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey
from datetime import datetime

from app.database import Base

class CodigoVerificacion(Base):
    __tablename__ = "codigos_verificacion"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    cuenta_id = Column(Integer, ForeignKey("cuentas.id", ondelete="CASCADE"), nullable=False)
    codigo = Column(String(10), nullable=False)
    tipo = Column(String(20), nullable=False) # '2fa' o 'recovery'
    fecha_expiracion = Column(TIMESTAMP, nullable=False)
    fecha_creacion = Column(TIMESTAMP, default=datetime.utcnow, nullable=False)

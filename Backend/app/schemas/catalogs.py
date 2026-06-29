from pydantic import BaseModel
from typing import Optional

# CatEstadoAprobacion
class CatEstadoAprobacionBase(BaseModel):
    codigo: str
    descripcion: str

class CatEstadoAprobacionCreate(CatEstadoAprobacionBase):
    pass

class CatEstadoAprobacionUpdate(BaseModel):
    descripcion: Optional[str] = None

class CatEstadoAprobacionResponse(CatEstadoAprobacionBase):
    class Config:
        from_attributes = True

# CatEstadoSolicitud
class CatEstadoSolicitudBase(BaseModel):
    codigo: str
    descripcion: str

class CatEstadoSolicitudCreate(CatEstadoSolicitudBase):
    pass

class CatEstadoSolicitudUpdate(BaseModel):
    descripcion: Optional[str] = None

class CatEstadoSolicitudResponse(CatEstadoSolicitudBase):
    class Config:
        from_attributes = True

# CatEstadoSesion
class CatEstadoSesionBase(BaseModel):
    codigo: str
    descripcion: str

class CatEstadoSesionCreate(CatEstadoSesionBase):
    pass

class CatEstadoSesionUpdate(BaseModel):
    descripcion: Optional[str] = None

class CatEstadoSesionResponse(CatEstadoSesionBase):
    class Config:
        from_attributes = True

# CatDias
class CatDiasBase(BaseModel):
    id: int
    nombre: str

class CatDiasCreate(CatDiasBase):
    pass

class CatDiasUpdate(BaseModel):
    nombre: Optional[str] = None

class CatDiasResponse(CatDiasBase):
    class Config:
        from_attributes = True

# TablasSistema
class TablasSistemaBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    estado: int = 1

class TablasSistemaCreate(TablasSistemaBase):
    pass

class TablasSistemaUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    estado: Optional[int] = None

class TablasSistemaResponse(TablasSistemaBase):
    id: int
    class Config:
        from_attributes = True

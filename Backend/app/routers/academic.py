from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.academic import (
    Facultad, Carrera, Materia, CarreraMateria, PerfilAcademico, FacultadDirector
)
from app.schemas.academic import (
    FacultadCreate, FacultadUpdate, FacultadResponse,
    CarreraCreate, CarreraUpdate, CarreraResponse,
    MateriaCreate, MateriaUpdate, MateriaResponse,
    CarreraMateriaCreate, CarreraMateriaUpdate, CarreraMateriaResponse,
    PerfilAcademicoCreate, PerfilAcademicoUpdate, PerfilAcademicoResponse,
    FacultadDirectorCreate, FacultadDirectorUpdate, FacultadDirectorResponse
)

router = APIRouter()

# ==========================================
# CRUD para Facultades
# ==========================================
@router.get("/facultades/", response_model=List[FacultadResponse])
def get_facultades(db: Session = Depends(get_db)):
    return db.query(Facultad).all()

@router.post("/facultades/", response_model=FacultadResponse)
def create_facultad(item: FacultadCreate, db: Session = Depends(get_db)):
    db_item = Facultad(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/facultades/{id}", response_model=FacultadResponse)
def update_facultad(id: int, item: FacultadUpdate, db: Session = Depends(get_db)):
    db_item = db.query(Facultad).filter(Facultad.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Facultad no encontrada")
    update_data = item.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/facultades/{id}")
def delete_facultad(id: int, db: Session = Depends(get_db)):
    db_item = db.query(Facultad).filter(Facultad.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Facultad no encontrada")
    db.delete(db_item)
    db.commit()
    return {"message": "Eliminado exitosamente"}


# ==========================================
# CRUD para Carreras
# ==========================================
@router.get("/carreras/", response_model=List[CarreraResponse])
def get_carreras(db: Session = Depends(get_db)):
    return db.query(Carrera).all()

@router.post("/carreras/", response_model=CarreraResponse)
def create_carrera(item: CarreraCreate, db: Session = Depends(get_db)):
    db_item = Carrera(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/carreras/{id}", response_model=CarreraResponse)
def update_carrera(id: int, item: CarreraUpdate, db: Session = Depends(get_db)):
    db_item = db.query(Carrera).filter(Carrera.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Carrera no encontrada")
    update_data = item.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/carreras/{id}")
def delete_carrera(id: int, db: Session = Depends(get_db)):
    db_item = db.query(Carrera).filter(Carrera.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Carrera no encontrada")
    db.delete(db_item)
    db.commit()
    return {"message": "Eliminado exitosamente"}


# ==========================================
# CRUD para Materias
# ==========================================
@router.get("/materias/", response_model=List[MateriaResponse])
def get_materias(db: Session = Depends(get_db)):
    return db.query(Materia).all()

@router.post("/materias/", response_model=MateriaResponse)
def create_materia(item: MateriaCreate, db: Session = Depends(get_db)):
    db_item = Materia(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/materias/{id}", response_model=MateriaResponse)
def update_materia(id: int, item: MateriaUpdate, db: Session = Depends(get_db)):
    db_item = db.query(Materia).filter(Materia.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Materia no encontrada")
    update_data = item.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/materias/{id}")
def delete_materia(id: int, db: Session = Depends(get_db)):
    db_item = db.query(Materia).filter(Materia.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Materia no encontrada")
    db.delete(db_item)
    db.commit()
    return {"message": "Eliminado exitosamente"}


# ==========================================
# CRUD para CarreraMaterias
# ==========================================
@router.get("/carrera-materias/", response_model=List[CarreraMateriaResponse])
def get_carrera_materias(db: Session = Depends(get_db)):
    return db.query(CarreraMateria).all()

@router.post("/carrera-materias/", response_model=CarreraMateriaResponse)
def create_carrera_materia(item: CarreraMateriaCreate, db: Session = Depends(get_db)):
    db_item = CarreraMateria(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/carrera-materias/{id}", response_model=CarreraMateriaResponse)
def update_carrera_materia(id: int, item: CarreraMateriaUpdate, db: Session = Depends(get_db)):
    db_item = db.query(CarreraMateria).filter(CarreraMateria.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Relación no encontrada")
    update_data = item.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/carrera-materias/{id}")
def delete_carrera_materia(id: int, db: Session = Depends(get_db)):
    db_item = db.query(CarreraMateria).filter(CarreraMateria.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Relación no encontrada")
    db.delete(db_item)
    db.commit()
    return {"message": "Eliminado exitosamente"}


# ==========================================
# CRUD para PerfilesAcademicos
# ==========================================
@router.get("/perfiles-academicos/", response_model=List[PerfilAcademicoResponse])
def get_perfiles_academicos(db: Session = Depends(get_db)):
    return db.query(PerfilAcademico).all()

@router.post("/perfiles-academicos/", response_model=PerfilAcademicoResponse)
def create_perfil_academico(item: PerfilAcademicoCreate, db: Session = Depends(get_db)):
    db_item = PerfilAcademico(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/perfiles-academicos/{id}", response_model=PerfilAcademicoResponse)
def update_perfil_academico(id: int, item: PerfilAcademicoUpdate, db: Session = Depends(get_db)):
    db_item = db.query(PerfilAcademico).filter(PerfilAcademico.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Perfil académico no encontrado")
    update_data = item.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/perfiles-academicos/{id}")
def delete_perfil_academico(id: int, db: Session = Depends(get_db)):
    db_item = db.query(PerfilAcademico).filter(PerfilAcademico.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Perfil académico no encontrado")
    db.delete(db_item)
    db.commit()
    return {"message": "Eliminado exitosamente"}


# ==========================================
# CRUD para FacultadDirectores
# ==========================================
@router.get("/facultad-directores/", response_model=List[FacultadDirectorResponse])
def get_facultad_directores(db: Session = Depends(get_db)):
    return db.query(FacultadDirector).all()

@router.post("/facultad-directores/", response_model=FacultadDirectorResponse)
def create_facultad_director(item: FacultadDirectorCreate, db: Session = Depends(get_db)):
    db_item = FacultadDirector(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/facultad-directores/{id}", response_model=FacultadDirectorResponse)
def update_facultad_director(id: int, item: FacultadDirectorUpdate, db: Session = Depends(get_db)):
    db_item = db.query(FacultadDirector).filter(FacultadDirector.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Director de facultad no encontrado")
    update_data = item.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/facultad-directores/{id}")
def delete_facultad_director(id: int, db: Session = Depends(get_db)):
    db_item = db.query(FacultadDirector).filter(FacultadDirector.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Director de facultad no encontrado")
    db.delete(db_item)
    db.commit()
    return {"message": "Eliminado exitosamente"}

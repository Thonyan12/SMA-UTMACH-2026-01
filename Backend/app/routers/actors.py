from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
from app.models.actors import (
    Estudiante, Mentor, MentorEspecialidad, DisponibilidadMentor
)
from app.schemas.actors import (
    EstudianteCreate, EstudianteUpdate, EstudianteResponse,
    MentorCreate, MentorUpdate, MentorResponse,
    MentorEspecialidadCreate, MentorEspecialidadUpdate, MentorEspecialidadResponse,
    DisponibilidadMentorCreate, DisponibilidadMentorUpdate, DisponibilidadMentorResponse
)

router = APIRouter()

# ==========================================
# CRUD para Estudiantes
# ==========================================
@router.get("/estudiantes/", response_model=List[EstudianteResponse])
def get_estudiantes(db: Session = Depends(get_db)):
    return db.query(Estudiante).all()

@router.post("/estudiantes/", response_model=EstudianteResponse)
def create_estudiante(item: EstudianteCreate, db: Session = Depends(get_db)):
    db_item = Estudiante(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/estudiantes/{id}", response_model=EstudianteResponse)
def update_estudiante(id: int, item: EstudianteUpdate, db: Session = Depends(get_db)):
    db_item = db.query(Estudiante).filter(Estudiante.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")
    update_data = item.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/estudiantes/{id}")
def delete_estudiante(id: int, db: Session = Depends(get_db)):
    db_item = db.query(Estudiante).filter(Estudiante.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")
    db_item.estado = 0 # Soft Delete
    db.commit()
    return {"message": "Eliminado (Soft Delete) exitosamente"}


# ==========================================
# CRUD para Mentores
# ==========================================
@router.get("/mentores/", response_model=List[MentorResponse])
def get_mentores(db: Session = Depends(get_db)):
    return db.query(Mentor).all()

@router.post("/mentores/", response_model=MentorResponse)
def create_mentor(item: MentorCreate, db: Session = Depends(get_db)):
    db_item = Mentor(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/mentores/{id}", response_model=MentorResponse)
def update_mentor(id: int, item: MentorUpdate, db: Session = Depends(get_db)):
    db_item = db.query(Mentor).filter(Mentor.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Mentor no encontrado")
    
    update_data = item.model_dump(exclude_unset=True)
    
    # Lógica para registrar fecha de aprobación si cambia a 'aprobado'
    if "estado_aprobacion" in update_data and update_data["estado_aprobacion"] == "aprobado" and db_item.estado_aprobacion != "aprobado":
        db_item.fecha_aprobacion = datetime.utcnow()

    for key, value in update_data.items():
        setattr(db_item, key, value)
    
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/mentores/{id}")
def delete_mentor(id: int, db: Session = Depends(get_db)):
    db_item = db.query(Mentor).filter(Mentor.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Mentor no encontrado")
    db_item.estado = 0 # Soft Delete
    db.commit()
    return {"message": "Eliminado (Soft Delete) exitosamente"}


# ==========================================
# CRUD para MentorEspecialidades
# ==========================================
@router.get("/mentor-especialidades/", response_model=List[MentorEspecialidadResponse])
def get_mentor_especialidades(db: Session = Depends(get_db)):
    return db.query(MentorEspecialidad).all()

@router.post("/mentor-especialidades/", response_model=MentorEspecialidadResponse)
def create_mentor_especialidad(item: MentorEspecialidadCreate, db: Session = Depends(get_db)):
    db_item = MentorEspecialidad(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/mentor-especialidades/{id}", response_model=MentorEspecialidadResponse)
def update_mentor_especialidad(id: int, item: MentorEspecialidadUpdate, db: Session = Depends(get_db)):
    db_item = db.query(MentorEspecialidad).filter(MentorEspecialidad.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Especialidad no encontrada")
    update_data = item.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/mentor-especialidades/{id}")
def delete_mentor_especialidad(id: int, db: Session = Depends(get_db)):
    db_item = db.query(MentorEspecialidad).filter(MentorEspecialidad.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Especialidad no encontrada")
    db.delete(db_item)
    db.commit()
    return {"message": "Eliminado exitosamente"}

from typing import Optional

@router.get("/mentores-por-materia/{materia_id}")
def get_mentores_por_materia(materia_id: int, estudiante_id: Optional[int] = None, db: Session = Depends(get_db)):
    from app.models.academic import PerfilAcademico
    from app.models.users import Perfil
    from app.models.processes import SolicitudMentoria
    
    mentores_esp_query = db.query(MentorEspecialidad).join(Mentor).filter(
        MentorEspecialidad.materia_id == materia_id,
        Mentor.estado_aprobacion == 'aprobado',
        Mentor.estado == 1
    )
    
    mentores_esp = mentores_esp_query.all()
    
    if estudiante_id:
        # Buscar tutores con los que el estudiante ya ha tenido al menos una solicitud asignada/aceptada/programada/completada
        tutores_previos = db.query(SolicitudMentoria.mentor_id).filter(
            SolicitudMentoria.estudiante_id == estudiante_id,
            SolicitudMentoria.mentor_id.isnot(None)
        ).distinct().all()
        tutores_previos_ids = [t[0] for t in tutores_previos]
        
        # Filtrar la lista original
        mentores_esp = [me for me in mentores_esp if me.mentor_id in tutores_previos_ids]
    
    resultados = []
    for me in mentores_esp:
        # Get Mentor Name
        mentor = db.query(Mentor).filter(Mentor.id == me.mentor_id).first()
        nombre_completo = "Mentor Desconocido"
        if mentor:
            pa = db.query(PerfilAcademico).filter(PerfilAcademico.id == mentor.academico_id).first()
            if pa:
                perf = db.query(Perfil).filter(Perfil.id == pa.perfil_id).first()
                if perf:
                    nombre_completo = f"{perf.nombres} {perf.apellidos}"
                    
        resultados.append({
            "mentor_id": me.mentor_id,
            "nombre": nombre_completo,
            "nivel_dominio": me.nivel_dominio
        })
        
    return resultados


# ==========================================
# CRUD para DisponibilidadMentor
# ==========================================
@router.get("/disponibilidad-mentor/", response_model=List[DisponibilidadMentorResponse])
def get_disponibilidad_mentor(db: Session = Depends(get_db)):
    return db.query(DisponibilidadMentor).all()

@router.post("/disponibilidad-mentor/", response_model=DisponibilidadMentorResponse)
def create_disponibilidad_mentor(item: DisponibilidadMentorCreate, db: Session = Depends(get_db)):
    db_item = DisponibilidadMentor(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/disponibilidad-mentor/{id}", response_model=DisponibilidadMentorResponse)
def update_disponibilidad_mentor(id: int, item: DisponibilidadMentorUpdate, db: Session = Depends(get_db)):
    db_item = db.query(DisponibilidadMentor).filter(DisponibilidadMentor.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Disponibilidad no encontrada")
    update_data = item.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/disponibilidad-mentor/{id}")
def delete_disponibilidad_mentor(id: int, db: Session = Depends(get_db)):
    db_item = db.query(DisponibilidadMentor).filter(DisponibilidadMentor.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Disponibilidad no encontrada")
    db.delete(db_item)
    db.commit()
    return {"message": "Eliminado exitosamente"}

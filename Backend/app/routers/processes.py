import re
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from sqlalchemy.exc import DatabaseError
from typing import List

from app.database import get_db
from app.models.processes import (
    SolicitudMentoria, SesionMentoria, Calificacion, Notificacion, HistorialCambio
)
from app.models.actors import Estudiante, Mentor, MentorEspecialidad
from app.models.academic import PerfilAcademico
from app.models.users import Perfil
from app.schemas.processes import (
    SolicitudMentoriaCreate, SolicitudMentoriaUpdate, SolicitudMentoriaResponse,
    SesionMentoriaCreate, SesionMentoriaUpdate, SesionMentoriaResponse,
    CalificacionCreate, CalificacionUpdate, CalificacionResponse,
    NotificacionCreate, NotificacionUpdate, NotificacionResponse,
    HistorialCambioCreate, HistorialCambioUpdate, HistorialCambioResponse
)

router = APIRouter()

# ==========================================
# Funciones Auxiliares para Notificaciones
# ==========================================

def parse_oracle_error(e: Exception) -> str:
    error_msg = str(e.orig) if hasattr(e, 'orig') else str(e)
    match = re.search(r'ORA-\d+:\s*(.*)', error_msg)
    if match:
        return match.group(1).split('\n')[0].strip()
    return "Ocurrió un error de validación en la base de datos."

def get_cuenta_id_for_estudiante(db: Session, estudiante_id: int):
    est = db.query(Estudiante).filter(Estudiante.id == estudiante_id).first()
    if est:
        pa = db.query(PerfilAcademico).filter(PerfilAcademico.id == est.academico_id).first()
        if pa:
            perf = db.query(Perfil).filter(Perfil.id == pa.perfil_id).first()
            if perf:
                return perf.cuenta_id
    return None

def get_cuenta_id_for_mentor(db: Session, mentor_id: int):
    men = db.query(Mentor).filter(Mentor.id == mentor_id).first()
    if men:
        pa = db.query(PerfilAcademico).filter(PerfilAcademico.id == men.academico_id).first()
        if pa:
            perf = db.query(Perfil).filter(Perfil.id == pa.perfil_id).first()
            if perf:
                return perf.cuenta_id
    return None

def create_system_notification(db: Session, cuenta_id: int, titulo: str, mensaje: str, solicitud_id=None, sesion_id=None):
    if not cuenta_id: return
    notif = Notificacion(
        cuenta_id=cuenta_id,
        tipo='sistema',
        titulo=titulo,
        mensaje=mensaje,
        solicitud_id=solicitud_id,
        sesion_id=sesion_id
    )
    db.add(notif)

# ==========================================
# CRUD para SolicitudesMentoria
# ==========================================
from sqlalchemy import func
from app.models.academic import Materia
from app.schemas.processes import EstadisticasResponse

@router.get("/estadisticas/", response_model=EstadisticasResponse)
def get_estadisticas(db: Session = Depends(get_db)):
    # Totals
    total_estudiantes = db.query(func.count(Estudiante.id)).scalar()
    total_mentores = db.query(func.count(Mentor.id)).scalar()
    total_solicitudes = db.query(func.count(SolicitudMentoria.id)).scalar()
    
    # Solicitudes por estado
    sol_estado_query = db.query(SolicitudMentoria.estado_solicitud, func.count(SolicitudMentoria.id)).group_by(SolicitudMentoria.estado_solicitud).all()
    solicitudes_por_estado = [{"name": estado, "value": count} for estado, count in sol_estado_query]
    
    # Solicitudes por materia
    sol_materia_query = db.query(Materia.nombre, func.count(SolicitudMentoria.id)).join(Materia, Materia.id == SolicitudMentoria.materia_id).group_by(Materia.nombre).all()
    solicitudes_por_materia = [{"name": nombre, "value": count} for nombre, count in sol_materia_query]
    
    return {
        "total_estudiantes": total_estudiantes,
        "total_mentores": total_mentores,
        "total_solicitudes": total_solicitudes,
        "solicitudes_por_estado": solicitudes_por_estado,
        "solicitudes_por_materia": solicitudes_por_materia
    }

@router.get("/solicitudes-mentoria/", response_model=List[SolicitudMentoriaResponse])
def get_solicitudes_mentoria(db: Session = Depends(get_db)):
    return db.query(SolicitudMentoria).all()

@router.post("/solicitudes-mentoria/")
def create_solicitud_mentoria(item: SolicitudMentoriaCreate, db: Session = Depends(get_db)):
    try:
        nueva_solicitud = SolicitudMentoria(
            estudiante_id=item.estudiante_id,
            materia_id=item.materia_id,
            descripcion=item.descripcion,
            fecha_hora_deseada=item.fecha_hora_deseada,
            prioridad=item.prioridad,
            estado_solicitud="pendiente"
        )
        db.add(nueva_solicitud)
        db.commit()
        db.refresh(nueva_solicitud)
        
        # Auto-asignar un mentor disponible para la materia
        solicitud = db.query(SolicitudMentoria).filter(
            SolicitudMentoria.estudiante_id == item.estudiante_id,
            SolicitudMentoria.materia_id == item.materia_id
        ).order_by(SolicitudMentoria.id.desc()).first()
        
        if solicitud:
            import random
            # Buscar un mentor aprobado que dicte esta materia
            mentores_esp = db.query(MentorEspecialidad).join(Mentor).filter(
                MentorEspecialidad.materia_id == item.materia_id,
                Mentor.estado_aprobacion == 'aprobado',
                Mentor.estado == 1
            ).all()
            
            if mentores_esp:
                mentor_esp = random.choice(mentores_esp)
                solicitud.mentor_id = mentor_esp.mentor_id
                solicitud.estado_solicitud = "asignada"
                db.commit()
                
                # Notificar al mentor que se le ha asignado una nueva solicitud
                m_cuenta_id = get_cuenta_id_for_mentor(db, mentor_esp.mentor_id)
                if m_cuenta_id:
                    create_system_notification(
                        db, m_cuenta_id, 
                        "Nueva Solicitud Asignada", 
                        "Se te ha asignado automáticamente una nueva solicitud de mentoría para revisión.", 
                        solicitud_id=solicitud.id
                    )
                    db.commit()
        
        return {"message": "Solicitud creada exitosamente a través de PKG_MENTORIAS"}
    except DatabaseError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=parse_oracle_error(e))

@router.put("/solicitudes-mentoria/{id}", response_model=SolicitudMentoriaResponse)
def update_solicitud_mentoria(id: int, item: SolicitudMentoriaUpdate, db: Session = Depends(get_db)):
    db_item = db.query(SolicitudMentoria).filter(SolicitudMentoria.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    update_data = item.model_dump(exclude_unset=True)
    
    # Sistema de Rebote (Reasignación Automática)
    was_reassigned = False
    if update_data.get('estado_solicitud') == 'rechazada':
        import random
        other_mentors = db.query(MentorEspecialidad).join(Mentor).filter(
            MentorEspecialidad.materia_id == db_item.materia_id,
            MentorEspecialidad.mentor_id != db_item.mentor_id,
            Mentor.estado_aprobacion == 'aprobado',
            Mentor.estado == 1
        ).all()
        
        if other_mentors:
            other_mentor = random.choice(other_mentors)
            update_data['estado_solicitud'] = 'asignada'
            update_data['mentor_id'] = other_mentor.mentor_id
            update_data['motivo_rechazo'] = None
            was_reassigned = True

    for key, value in update_data.items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    
    # Crear notificación si el estado cambió o fue reasignada
    if was_reassigned:
        c_id_est = get_cuenta_id_for_estudiante(db, db_item.estudiante_id)
        if c_id_est:
            create_system_notification(
                db, c_id_est, 
                "Solicitud Reasignada", 
                "El mentor original no estaba disponible, hemos reasignado tu solicitud a otro mentor disponible.", 
                solicitud_id=id
            )
        
        c_id_men = get_cuenta_id_for_mentor(db, db_item.mentor_id)
        if c_id_men:
            create_system_notification(
                db, c_id_men, 
                "Nueva Solicitud Asignada", 
                "Se te ha reasignado automáticamente una solicitud de mentoría para revisión.", 
                solicitud_id=id
            )
        db.commit()
    else:
        if item.estado_solicitud in ['aceptada', 'rechazada'] and not was_reassigned:
            c_id = get_cuenta_id_for_estudiante(db, db_item.estudiante_id)
            if c_id:
                titulo = f"Solicitud {item.estado_solicitud.capitalize()}"
                msg = f"Tu solicitud de mentoría ha sido {item.estado_solicitud}."
                create_system_notification(db, c_id, titulo, msg, solicitud_id=id)
                db.commit()
                
            if item.estado_solicitud == 'aceptada':
                from datetime import timedelta
                # Crear la sesión de mentoría automáticamente
                sesion_existente = db.query(SesionMentoria).filter(SesionMentoria.solicitud_id == id).first()
                if not sesion_existente:
                    nueva_sesion = SesionMentoria(
                        solicitud_id=id,
                        inicio=db_item.fecha_hora_deseada,
                        fin=db_item.fecha_hora_deseada + timedelta(hours=1),
                        enlace_teams="https://teams.microsoft.com/l/meetup-join/..." # Placeholder generico
                    )
                    db.add(nueva_sesion)
                    db.commit()
                    
                    if c_id:
                        create_system_notification(
                            db, c_id, 
                            "Reunión Programada", 
                            f"Se ha programado tu reunión de mentoría para el {db_item.fecha_hora_deseada.strftime('%d/%m/%Y %H:%M')}.", 
                            solicitud_id=id
                        )
                        db.commit()
            
    return db_item

@router.delete("/solicitudes-mentoria/{id}")
def delete_solicitud_mentoria(id: int, db: Session = Depends(get_db)):
    db_item = db.query(SolicitudMentoria).filter(SolicitudMentoria.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    # Soft Delete: En la arquitectura V8 no se borran físicamente los datos
    db_item.estado_solicitud = 'cancelada'
    db.commit()
    return {"message": "Solicitud cancelada exitosamente"}


# ==========================================
# CRUD para SesionesMentoria
# ==========================================
@router.get("/sesiones-mentoria/", response_model=List[SesionMentoriaResponse])
def get_sesiones_mentoria(db: Session = Depends(get_db)):
    return db.query(SesionMentoria).all()

@router.post("/sesiones-mentoria/")
def create_sesion_mentoria(item: SesionMentoriaCreate, db: Session = Depends(get_db)):
    try:
        db.execute(
            text("""
                CALL pkg_mentorias.sp_programar_sesion(
                    :p_solicitud_id, :p_inicio, :p_fin, :p_enlace
                )
            """),
            {
                "p_solicitud_id": item.solicitud_id,
                "p_inicio": item.inicio,
                "p_fin": item.fin,
                "p_enlace": item.enlace_teams
            }
        )
        db.commit()
        
        # Notify student that a session was scheduled
        sol = db.query(SolicitudMentoria).filter(SolicitudMentoria.id == item.solicitud_id).first()
        if sol:
            c_id = get_cuenta_id_for_estudiante(db, sol.estudiante_id)
            if c_id:
                create_system_notification(db, c_id, "Sesión Programada", "Se ha programado una sesión para tu solicitud.", solicitud_id=item.solicitud_id)
                db.commit()
                
        return {"message": "Sesión programada exitosamente a través de PKG_MENTORIAS"}
    except DatabaseError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=parse_oracle_error(e))

@router.put("/sesiones-mentoria/{id}", response_model=SesionMentoriaResponse)
def update_sesion_mentoria(id: int, item: SesionMentoriaUpdate, db: Session = Depends(get_db)):
    db_item = db.query(SesionMentoria).filter(SesionMentoria.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    update_data = item.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    
    # Notificaciones de sesión
    if item.estado_sesion in ['cancelada', 'completada']:
        sol = db.query(SolicitudMentoria).filter(SolicitudMentoria.id == db_item.solicitud_id).first()
        if sol:
            est_cuenta_id = get_cuenta_id_for_estudiante(db, sol.estudiante_id)
            men_cuenta_id = get_cuenta_id_for_mentor(db, sol.mentor_id) if sol.mentor_id else None
            
            titulo = f"Sesión {item.estado_sesion.capitalize()}"
            msg_est = f"Tu sesión de mentoría ha sido {item.estado_sesion}."
            msg_men = f"La sesión de mentoría ha sido {item.estado_sesion}."
            
            if est_cuenta_id:
                create_system_notification(db, est_cuenta_id, titulo, msg_est, sesion_id=id)
            if men_cuenta_id:
                create_system_notification(db, men_cuenta_id, titulo, msg_men, sesion_id=id)
            db.commit()
            
    return db_item

@router.delete("/sesiones-mentoria/{id}")
def delete_sesion_mentoria(id: int, db: Session = Depends(get_db)):
    db_item = db.query(SesionMentoria).filter(SesionMentoria.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    # Soft Delete
    db_item.estado_sesion = 'cancelada'
    db.commit()
    return {"message": "Sesión cancelada exitosamente"}


# ==========================================
# CRUD para Calificaciones
# ==========================================
@router.get("/calificaciones/", response_model=List[CalificacionResponse])
def get_calificaciones(db: Session = Depends(get_db)):
    return db.query(Calificacion).all()

@router.get("/calificaciones/mentor/{mentor_id}")
def get_calificacion_promedio_mentor(mentor_id: int, db: Session = Depends(get_db)):
    # Calculate average of puntaje_total for all sessions of this mentor
    from sqlalchemy import func
    
    # First, join Calificacion with SesionMentoria and SolicitudMentoria
    result = db.query(
        func.avg(Calificacion.puntaje_total).label("promedio"),
        func.count(Calificacion.id).label("total_sesiones")
    ).join(
        SesionMentoria, SesionMentoria.id == Calificacion.sesion_id
    ).join(
        SolicitudMentoria, SolicitudMentoria.id == SesionMentoria.solicitud_id
    ).filter(
        SolicitudMentoria.mentor_id == mentor_id,
        Calificacion.estado == 1
    ).first()
    
    return {
        "promedio": round(result.promedio, 2) if result.promedio else 0.0,
        "total_sesiones": result.total_sesiones or 0
    }

@router.post("/calificaciones/", response_model=CalificacionResponse)
def create_calificacion(item: CalificacionCreate, db: Session = Depends(get_db)):
    db_item = Calificacion(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/calificaciones/{id}", response_model=CalificacionResponse)
def update_calificacion(id: int, item: CalificacionUpdate, db: Session = Depends(get_db)):
    db_item = db.query(Calificacion).filter(Calificacion.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Calificación no encontrada")
    update_data = item.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/calificaciones/{id}")
def delete_calificacion(id: int, db: Session = Depends(get_db)):
    db_item = db.query(Calificacion).filter(Calificacion.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Calificación no encontrada")
    db_item.estado = 0 # Soft Delete
    db.commit()
    return {"message": "Calificación eliminada (Soft Delete) exitosamente"}


# ==========================================
# CRUD para Notificaciones
# ==========================================
@router.get("/notificaciones/", response_model=List[NotificacionResponse])
def get_notificaciones(db: Session = Depends(get_db)):
    return db.query(Notificacion).all()

@router.get("/notificaciones/cuenta/{cuenta_id}", response_model=List[NotificacionResponse])
def get_notificaciones_by_cuenta(cuenta_id: int, db: Session = Depends(get_db)):
    return db.query(Notificacion).filter(Notificacion.cuenta_id == cuenta_id).order_by(Notificacion.id.desc()).all()

@router.post("/notificaciones/", response_model=NotificacionResponse)
def create_notificacion(item: NotificacionCreate, db: Session = Depends(get_db)):
    db_item = Notificacion(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/notificaciones/{id}", response_model=NotificacionResponse)
def update_notificacion(id: int, item: NotificacionUpdate, db: Session = Depends(get_db)):
    db_item = db.query(Notificacion).filter(Notificacion.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    update_data = item.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    
    if item.leido == 1 and not db_item.fecha_leido:
        from datetime import datetime
        db_item.fecha_leido = datetime.utcnow()
        
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/notificaciones/{id}")
def delete_notificacion(id: int, db: Session = Depends(get_db)):
    db_item = db.query(Notificacion).filter(Notificacion.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    db_item.estado = 0 # Soft Delete
    db.commit()
    return {"message": "Notificación eliminada (Soft Delete) exitosamente"}


# ==========================================
# CRUD para HistorialCambios
# ==========================================
@router.get("/historial-cambios/", response_model=List[HistorialCambioResponse])
def get_historial_cambios(db: Session = Depends(get_db)):
    # Solo permisos de Lectura (GET) para HistorialCambios. 
    # La escritura la manejan los Triggers de BD.
    return db.query(HistorialCambio).all()

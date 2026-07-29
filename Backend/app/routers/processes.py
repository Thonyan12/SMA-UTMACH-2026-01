import re
from fastapi import APIRouter, Depends, HTTPException, Request, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from sqlalchemy import text, func
from sqlalchemy.exc import DatabaseError
from typing import List, Optional

from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.processes import (
    SolicitudMentoria, SesionMentoria, Calificacion, Notificacion, HistorialCambio, PostulacionMentor,
    MensajeSesion, RecursoSesion, ReporteSesion
)
from app.models.actors import Estudiante, Mentor, MentorEspecialidad, DisponibilidadMentor
from app.models.academic import PerfilAcademico, Carrera
from app.models.catalogs import TablasSistema
from app.models.users import Perfil, Cuenta, CuentaRol, Rol
from app.schemas.processes import (
    SolicitudMentoriaCreate, SolicitudMentoriaUpdate, SolicitudMentoriaResponse,
    SesionMentoriaCreate, SesionMentoriaUpdate, SesionMentoriaResponse,
    CalificacionCreate, CalificacionUpdate, CalificacionResponse,
    NotificacionCreate, NotificacionUpdate, NotificacionResponse,
    HistorialCambioCreate, HistorialCambioUpdate, HistorialCambioResponse,
    PostulacionMentorCreate, PostulacionMentorResponse,
    MensajeSesionCreate, MensajeSesionResponse,
    RecursoSesionCreate, RecursoSesionResponse,
    ReporteSesionCreate, ReporteSesionResponse
)
from app.services.email_service import send_email
from datetime import datetime
from pydantic import BaseModel

router = APIRouter()
ws_router = APIRouter()

# ==========================================
# WebSocket Manager (Chat)
# ==========================================
class ConnectionManager:
    def __init__(self):
        # Dictionary to hold active connections per session: {sesion_id: {websocket: cuenta_id}}
        self.active_connections: dict[int, dict[WebSocket, int]] = {}

    async def connect(self, websocket: WebSocket, sesion_id: int, cuenta_id: int):
        await websocket.accept()
        if sesion_id not in self.active_connections:
            self.active_connections[sesion_id] = {}
        self.active_connections[sesion_id][websocket] = cuenta_id

    def disconnect(self, websocket: WebSocket, sesion_id: int):
        if sesion_id in self.active_connections:
            if websocket in self.active_connections[sesion_id]:
                del self.active_connections[sesion_id][websocket]
            if not self.active_connections[sesion_id]:
                del self.active_connections[sesion_id]

    async def broadcast(self, message: str, sesion_id: int):
        if sesion_id in self.active_connections:
            for connection in self.active_connections[sesion_id].keys():
                try:
                    await connection.send_text(message)
                except Exception:
                    pass
                    
    def is_user_connected(self, sesion_id: int, cuenta_id: int) -> bool:
        if sesion_id in self.active_connections:
            return cuenta_id in self.active_connections[sesion_id].values()
        return False

manager = ConnectionManager()

# ==========================================
# Funciones Auxiliares para Notificaciones
# ==========================================

def parse_oracle_error(e: Exception) -> str:
    error_msg = str(e.orig) if hasattr(e, 'orig') else str(e)
    match = re.search(r'ORA-\d+:\s*(.*)', error_msg)
    if match:
        return match.group(1).split('\n')[0].strip()
    return "Ocurrió un error de validación en la base de datos."

def set_audit_context(db: Session, cuenta_id: int, request: Request = None):
    try:
        ip = getattr(request.client, "host", "Unknown") if request and request.client else "Unknown"
        if cuenta_id:
            db.execute(
                text("BEGIN DBMS_SESSION.SET_IDENTIFIER(:cid); DBMS_APPLICATION_INFO.SET_CLIENT_INFO(:ip); END;"),
                {"cid": str(cuenta_id), "ip": str(ip)[:64]}
            )
    except Exception as e:
        print(f"Error setting audit context: {e}")

def get_cuenta_id_for_estudiante(db: Session, estudiante_id: int):
    est = db.query(Estudiante).filter(Estudiante.id == estudiante_id).first()
    if est:
        pa = db.query(PerfilAcademico).filter(PerfilAcademico.id == est.academico_id).first()
        if pa:
            perf = db.query(Perfil).filter(Perfil.id == pa.perfil_id).first()
            if perf:
                return perf.cuenta_id
    return None

def get_estudiante_id_from_cuenta(db: Session, cuenta_id: int):
    perf = db.query(Perfil).filter(Perfil.cuenta_id == cuenta_id).first()
    if perf:
        pa = db.query(PerfilAcademico).filter(PerfilAcademico.perfil_id == perf.id).first()
        if pa:
            est = db.query(Estudiante).filter(Estudiante.academico_id == pa.id).first()
            if est:
                return est.id
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

def get_nombre_for_estudiante(db: Session, estudiante_id: int):
    est = db.query(Estudiante).filter(Estudiante.id == estudiante_id).first()
    if est:
        pa = db.query(PerfilAcademico).filter(PerfilAcademico.id == est.academico_id).first()
        if pa:
            perf = db.query(Perfil).filter(Perfil.id == pa.perfil_id).first()
            if perf:
                return f"{perf.nombres} {perf.apellidos}"
    return "Estudiante Desconocido"

def get_nombre_for_mentor(db: Session, mentor_id: int):
    men = db.query(Mentor).filter(Mentor.id == mentor_id).first()
    if men:
        pa = db.query(PerfilAcademico).filter(PerfilAcademico.id == men.academico_id).first()
        if pa:
            perf = db.query(Perfil).filter(Perfil.id == pa.perfil_id).first()
            if perf:
                return f"{perf.nombres} {perf.apellidos}"
    return "Mentor Desconocido"

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
    
    # Ranking de Mentores
    mentores_activos = db.query(Mentor).filter(Mentor.estado == 1).all()
    ranking_mentores = []
    for m in mentores_activos:
        calificaciones = db.query(Calificacion).join(SesionMentoria).join(SolicitudMentoria).filter(SolicitudMentoria.mentor_id == m.id, Calificacion.estado == 1).all()
        if calificaciones:
            promedio = sum((c.puntaje_total or 0) for c in calificaciones) / len(calificaciones)
            ranking_mentores.append({
                "id": m.id,
                "nombre": get_nombre_for_mentor(db, m.id),
                "promedio": round(promedio, 2),
                "total_calificaciones": len(calificaciones)
            })
        else:
            ranking_mentores.append({
                "id": m.id,
                "nombre": get_nombre_for_mentor(db, m.id),
                "promedio": 0.0,
                "total_calificaciones": 0
            })
            
    # Ordenar por promedio descendente y luego por cantidad de calificaciones
    ranking_mentores.sort(key=lambda x: (x["promedio"], x["total_calificaciones"]), reverse=True)
    
    return {
        "total_estudiantes": total_estudiantes,
        "total_mentores": total_mentores,
        "total_solicitudes": total_solicitudes,
        "solicitudes_por_estado": solicitudes_por_estado,
        "solicitudes_por_materia": solicitudes_por_materia,
        "ranking_mentores": ranking_mentores[:10]
    }

@router.get("/dashboard/estudiante/{estudiante_id}")
def get_dashboard_estudiante(estudiante_id: int, db: Session = Depends(get_db)):
    solicitudes = db.query(SolicitudMentoria).filter(SolicitudMentoria.estudiante_id == estudiante_id).all()
    sesiones = db.query(SesionMentoria).join(SolicitudMentoria).filter(SolicitudMentoria.estudiante_id == estudiante_id).all()
    
    total_solicitudes = len(solicitudes)
    solicitudes_pendientes = len([s for s in solicitudes if s.estado_solicitud == 'pendiente'])
    mentorias_aceptadas = len([s for s in solicitudes if s.estado_solicitud == 'aceptada'])
    
    # Pre-cargar diccionarios para nombres
    materias = {m.id: m.nombre for m in db.query(Materia).all()}
    
    # Próximas sesiones (programadas)
    proximas_sesiones = []
    for s in sesiones:
        if s.estado_sesion == 'programada':
            sol = s.solicitud
            mentor_nombre = "Mentor no asignado"
            if sol.mentor_id:
                mentor_nombre = get_nombre_for_mentor(db, sol.mentor_id)
                
            proximas_sesiones.append({
                "id": s.id,
                "inicio": s.inicio,
                "fin": s.fin,
                "materia": materias.get(sol.materia_id, "Materia Desconocida"),
                "mentor": mentor_nombre,
                "descripcion": sol.descripcion,
                "prioridad": sol.prioridad,
                "enlace": s.enlace_teams
            })
    
    # Historial reciente
    historial = [
        {
            "id": s.id,
            "fecha": s.fecha_hora_deseada,
            "estado": s.estado_solicitud,
            "materia": materias.get(s.materia_id, "Materia Desconocida")
        }
        for s in solicitudes
    ]
    historial.sort(key=lambda x: x["fecha"], reverse=True)
    
    return {
        "total_solicitudes": total_solicitudes,
        "solicitudes_pendientes": solicitudes_pendientes,
        "mentorias_aceptadas": mentorias_aceptadas,
        "proximas_sesiones": proximas_sesiones[:5],
        "historial": historial[:10]
    }

@router.get("/dashboard/mentor/{mentor_id}")
def get_dashboard_mentor(mentor_id: int, db: Session = Depends(get_db)):
    solicitudes = db.query(SolicitudMentoria).filter(SolicitudMentoria.mentor_id == mentor_id).all()
    sesiones = db.query(SesionMentoria).join(SolicitudMentoria).filter(SolicitudMentoria.mentor_id == mentor_id).all()
    
    pendientes_atencion = len([s for s in solicitudes if s.estado_solicitud in ['pendiente', 'asignada']])
    mentorias_completadas = len([s for s in sesiones if s.estado_sesion == 'completada'])
    
    materias = {m.id: m.nombre for m in db.query(Materia).all()}
    
    proximas_sesiones = []
    for s in sesiones:
        if s.estado_sesion == 'programada':
            sol = s.solicitud
            estudiante_nombre = "Estudiante no asignado"
            if sol.estudiante_id:
                estudiante_nombre = get_nombre_for_estudiante(db, sol.estudiante_id)
                
            proximas_sesiones.append({
                "id": s.id,
                "inicio": s.inicio,
                "fin": s.fin,
                "materia": materias.get(sol.materia_id, "Materia Desconocida"),
                "estudiante": estudiante_nombre,
                "descripcion": sol.descripcion,
                "prioridad": sol.prioridad,
                "enlace": s.enlace_teams
            })
            
    # Promedio calificaciones
    calificaciones = db.query(Calificacion).join(SesionMentoria).join(SolicitudMentoria).filter(SolicitudMentoria.mentor_id == mentor_id, Calificacion.estado == 1).order_by(Calificacion.fecha_creacion.desc()).all()
    promedio = 0
    calificaciones_detalle = []
    
    if calificaciones:
        promedio = sum((c.puntaje_total or 0) for c in calificaciones) / len(calificaciones)
        
        for c in calificaciones:
            sesion = db.query(SesionMentoria).filter(SesionMentoria.id == c.sesion_id).first()
            sol = db.query(SolicitudMentoria).filter(SolicitudMentoria.id == sesion.solicitud_id).first()
            
            # Optionally fetch student name, or keep it anonymous
            # For now we use the subject name
            calificaciones_detalle.append({
                "id": c.id,
                "fecha": c.fecha_creacion,
                "puntualidad": c.puntualidad,
                "claridad": c.claridad,
                "dominio_tema": c.dominio_tema,
                "puntaje_total": c.puntaje_total,
                "comentario": c.comentario,
                "materia": materias.get(sol.materia_id, "Materia Desconocida")
            })
        
    historial = [
        {
            "id": s.id,
            "fecha": s.fecha_hora_deseada,
            "estado": s.estado_solicitud,
            "materia": materias.get(s.materia_id, "Materia Desconocida")
        }
        for s in solicitudes
    ]
    historial.sort(key=lambda x: x["fecha"], reverse=True)
    
    return {
        "pendientes_atencion": pendientes_atencion,
        "mentorias_completadas": mentorias_completadas,
        "promedio_calificaciones": round(promedio, 2),
        "calificaciones_detalle": calificaciones_detalle,
        "proximas_sesiones": proximas_sesiones[:5],
        "historial": historial[:10]
    }

@router.get("/solicitudes-mentoria/", response_model=List[SolicitudMentoriaResponse])
def get_solicitudes_mentoria(db: Session = Depends(get_db)):
    return db.query(SolicitudMentoria).all()

@router.post("/solicitudes-mentoria/")
def create_solicitud_mentoria(item: SolicitudMentoriaCreate, request: Request, db: Session = Depends(get_db)):
    c_id = get_cuenta_id_for_estudiante(db, item.estudiante_id)
    set_audit_context(db, c_id, request)
    try:
        import random

        # --- Extraer día y hora de la fecha solicitada ---
        fecha_deseada = item.fecha_hora_deseada
        # Python weekday(): Monday=0...Sunday=6 → cat_dias: Lunes=1...Domingo=7
        dia_id_solicitado = fecha_deseada.weekday() + 1
        hora_solicitada_min = fecha_deseada.hour * 60 + fecha_deseada.minute

        dias_nombre = {1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 7: 'Domingo'}

        # --- Función auxiliar: ¿El mentor tiene disponibilidad en ese día/hora? ---
        def mentor_disponible(mentor_id: int) -> bool:
            slot = db.query(DisponibilidadMentor).filter(
                DisponibilidadMentor.mentor_id == mentor_id,
                DisponibilidadMentor.dia_id == dia_id_solicitado,
                DisponibilidadMentor.hora_inicio_min <= hora_solicitada_min,
                DisponibilidadMentor.hora_fin_min > hora_solicitada_min,
                DisponibilidadMentor.activo == 1
            ).first()
            return slot is not None

        # --- Obtener horarios disponibles para sugerir al estudiante ---
        def obtener_horarios_disponibles(materia_id: int):
            mentores_esp = db.query(MentorEspecialidad).join(Mentor).filter(
                MentorEspecialidad.materia_id == materia_id,
                Mentor.estado_aprobacion == 'aprobado',
                Mentor.estado == 1
            ).all()
            mentor_ids = [me.mentor_id for me in mentores_esp]
            if not mentor_ids:
                return []
            slots = db.query(DisponibilidadMentor).filter(
                DisponibilidadMentor.mentor_id.in_(mentor_ids),
                DisponibilidadMentor.activo == 1
            ).all()
            horarios = []
            for s in slots:
                h_inicio = f"{s.hora_inicio_min // 60:02d}:{s.hora_inicio_min % 60:02d}"
                h_fin = f"{s.hora_fin_min // 60:02d}:{s.hora_fin_min % 60:02d}"
                dia = dias_nombre.get(s.dia_id, f"Día {s.dia_id}")
                horarios.append(f"{dia} {h_inicio}-{h_fin}")
            return list(set(horarios))

        # ============================================================
        # VALIDACIÓN PREVIA: ¿Hay al menos un mentor disponible?
        # ============================================================
        mentor_asignado_id = None

        # 1. ¿El estudiante pidió a alguien específico?
        if item.mentor_id:
            mentor_valido = db.query(MentorEspecialidad).join(Mentor).filter(
                MentorEspecialidad.materia_id == item.materia_id,
                MentorEspecialidad.mentor_id == item.mentor_id,
                Mentor.estado_aprobacion == 'aprobado',
                Mentor.estado == 1
            ).first()
            if mentor_valido and mentor_disponible(item.mentor_id):
                mentor_asignado_id = mentor_valido.mentor_id

        # 2. Asignación Inteligente (solo mentores con disponibilidad real)
        if not mentor_asignado_id:
            mentores_esp = db.query(MentorEspecialidad).join(Mentor).filter(
                MentorEspecialidad.materia_id == item.materia_id,
                Mentor.estado_aprobacion == 'aprobado',
                Mentor.estado == 1
            ).all()

            mentores_disponibles = [me for me in mentores_esp if mentor_disponible(me.mentor_id)]

            if mentores_disponibles:
                mejor_score = -1
                mejor_mentor_id = None

                for me in mentores_disponibles:
                    score_compatibilidad = (me.nivel_dominio / 5.0) * 40

                    sol_activas = db.query(func.count(SolicitudMentoria.id)).filter(
                        SolicitudMentoria.mentor_id == me.mentor_id,
                        SolicitudMentoria.estado_solicitud.in_(['pendiente', 'asignada', 'programada'])
                    ).scalar()
                    carga_factor = max(0, 5 - sol_activas)
                    score_carga = (carga_factor / 5.0) * 30

                    score_disponibilidad = 20
                    score_random = random.uniform(0, 10)

                    total_score = score_compatibilidad + score_carga + score_disponibilidad + score_random

                    if total_score > mejor_score:
                        mejor_score = total_score
                        mejor_mentor_id = me.mentor_id

                mentor_asignado_id = mejor_mentor_id

        # --- Si NO hay mentor disponible, RECHAZAR sin crear solicitud ---
        if not mentor_asignado_id:
            horarios = obtener_horarios_disponibles(item.materia_id)
            sugerencia = ""
            if horarios:
                sugerencia = " Horarios disponibles: " + ", ".join(sorted(horarios)[:8]) + "."
            raise HTTPException(
                status_code=400,
                detail=f"No hay mentores disponibles para esa materia el día {dias_nombre.get(dia_id_solicitado, '')} a las {fecha_deseada.hour:02d}:{fecha_deseada.minute:02d}. Por favor selecciona otro horario.{sugerencia}"
            )

        # --- SÍ hay mentor → Crear la solicitud y asignar ---
        nueva_solicitud = SolicitudMentoria(
            estudiante_id=item.estudiante_id,
            materia_id=item.materia_id,
            descripcion=item.descripcion,
            fecha_hora_deseada=item.fecha_hora_deseada,
            prioridad=item.prioridad,
            estado_solicitud="asignada",
            mentor_id=mentor_asignado_id
        )
        db.add(nueva_solicitud)
        db.commit()
        db.refresh(nueva_solicitud)

        # Notificar al mentor
        m_cuenta_id = get_cuenta_id_for_mentor(db, mentor_asignado_id)
        if m_cuenta_id:
            create_system_notification(
                db, m_cuenta_id,
                "Nueva Solicitud Asignada",
                "Se te ha asignado una nueva solicitud de mentoría para revisión.",
                solicitud_id=nueva_solicitud.id
            )
            db.commit()

        return {"message": "Solicitud creada y asignada exitosamente."}
    except HTTPException:
        raise
    except DatabaseError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=parse_oracle_error(e))

@router.put("/solicitudes-mentoria/{id}", response_model=SolicitudMentoriaResponse)
def update_solicitud_mentoria(id: int, item: SolicitudMentoriaUpdate, request: Request, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    set_audit_context(db, current_user.id, request)
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

    enlace_teams = update_data.pop('enlace_teams', None)

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
                        enlace_teams=enlace_teams or "https://teams.microsoft.com/l/meetup-join/..."
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

@router.get("/sesiones-mentoria/{id}", response_model=SesionMentoriaResponse)
def get_sesion_mentoria_by_id(id: int, db: Session = Depends(get_db)):
    db_item = db.query(SesionMentoria).filter(SesionMentoria.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Sesion no encontrada")
    return db_item

@router.post("/sesiones-mentoria/")
def create_sesion_mentoria(item: SesionMentoriaCreate, request: Request, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    set_audit_context(db, current_user.id, request)
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
def update_sesion_mentoria(id: int, item: SesionMentoriaUpdate, request: Request, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    set_audit_context(db, current_user.id, request)
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

# ==========================================
# Directorio Público de Mentores
# ==========================================
from app.schemas.processes import DirectorioMentorResponse
from app.models.academic import Materia

@router.get("/directorio/mentores", response_model=List[DirectorioMentorResponse])
def get_directorio_mentores(db: Session = Depends(get_db)):
    mentores = db.query(Mentor).filter(Mentor.estado_aprobacion == 'aprobado', Mentor.estado == 1).all()
    
    # Pre-cargar materias para las especialidades
    materias_dict = {m.id: m.nombre for m in db.query(Materia).all()}
    
    directorio = []
    for m in mentores:
        # Extraer nombre y apellidos
        nombre_completo = "Mentor"
        apellidos_completos = ""
        pa = db.query(PerfilAcademico).filter(PerfilAcademico.id == m.academico_id).first()
        if pa:
            perf = db.query(Perfil).filter(Perfil.id == pa.perfil_id).first()
            if perf:
                nombre_completo = perf.nombres
                apellidos_completos = perf.apellidos
        
        # Calcular promedio y total de sesiones calificadas
        calificaciones = db.query(Calificacion).join(SesionMentoria).join(SolicitudMentoria).filter(SolicitudMentoria.mentor_id == m.id, Calificacion.estado == 1).all()
        
        promedio = 0.0
        if calificaciones:
            promedio = sum((c.puntaje_total or 0) for c in calificaciones) / len(calificaciones)
            
        # Contar todas las sesiones completadas (tengan calificacion o no)
        total_sesiones = db.query(func.count(SesionMentoria.id)).join(SolicitudMentoria).filter(
            SolicitudMentoria.mentor_id == m.id,
            SesionMentoria.estado_sesion == 'completada'
        ).scalar()
        
        # Especialidades
        especialidades = []
        esp_db = db.query(MentorEspecialidad).filter(MentorEspecialidad.mentor_id == m.id, MentorEspecialidad.estado == 1).all()
        for e in esp_db:
            especialidades.append({
                "materia_id": e.materia_id,
                "materia_nombre": materias_dict.get(e.materia_id, "Desconocida"),
                "nivel_dominio": e.nivel_dominio
            })
            
        directorio.append({
            "id": m.id,
            "nombres": nombre_completo,
            "apellidos": apellidos_completos,
            "biografia": m.biografia,
            "experiencia": m.experiencia,
            "promedio_calificacion": round(promedio, 2),
            "total_sesiones": total_sesiones,
            "especialidades": especialidades
        })
        
    return directorio

# ==========================================
# Postulaciones de Mentores
# ==========================================

@router.post("/postular-mentor", response_model=PostulacionMentorResponse)
def postular_mentor(
    postulacion: PostulacionMentorCreate,
    cuenta_id: int, 
    db: Session = Depends(get_db)
):
    estudiante_id = get_estudiante_id_from_cuenta(db, cuenta_id)
    if not estudiante_id:
        raise HTTPException(status_code=404, detail="No eres estudiante en el sistema.")

    # Check if already applied and pending/approved
    existente = db.query(PostulacionMentor).filter(
        PostulacionMentor.estudiante_id == estudiante_id,
        PostulacionMentor.estado.in_(['pendiente', 'aprobada'])
    ).first()
    if existente:
        raise HTTPException(status_code=400, detail="Ya tienes una postulación pendiente o aprobada.")

    nueva = PostulacionMentor(
        estudiante_id=estudiante_id,
        motivo=postulacion.motivo
    )
    db.add(nueva)
    try:
        db.commit()
        db.refresh(nueva)
        
        # Notificar a los administradores
        est_perf = db.query(Perfil).filter(Perfil.cuenta_id == cuenta_id).first()
        nombre_est = f"{est_perf.nombres} {est_perf.apellidos}" if est_perf else "Un estudiante"
        
        admins = db.query(CuentaRol).filter(CuentaRol.rol_id == 3).all()
        for admin in admins:
            create_system_notification(
                db=db,
                cuenta_id=admin.cuenta_id,
                titulo="Nueva postulación a mentor",
                mensaje=f"{nombre_est} ha enviado una solicitud para ser mentor. Revisa la postulación en el panel de administración."
            )
        db.commit()
    except Exception as e:
        print("ERROR EN POSTULAR MENTOR:", e)
        db.rollback()
        raise HTTPException(status_code=400, detail=parse_oracle_error(e))
    return nueva

@router.get("/postulaciones/me", response_model=Optional[PostulacionMentorResponse])
def mis_postulaciones(cuenta_id: int, db: Session = Depends(get_db)):
    estudiante_id = get_estudiante_id_from_cuenta(db, cuenta_id)
    if not estudiante_id:
        return None
    return db.query(PostulacionMentor).filter(PostulacionMentor.estudiante_id == estudiante_id).order_by(PostulacionMentor.fecha_solicitud.desc()).first()

@router.get("/postulaciones", response_model=List[PostulacionMentorResponse])
def listar_postulaciones(db: Session = Depends(get_db)):
    postulaciones = db.query(PostulacionMentor).filter(PostulacionMentor.estado == 'pendiente').order_by(PostulacionMentor.fecha_solicitud.desc()).all()
    for p in postulaciones:
        est = db.query(Estudiante).filter(Estudiante.id == p.estudiante_id).first()
        if est:
            p.semestre = est.semestre
            pa = db.query(PerfilAcademico).filter(PerfilAcademico.id == est.academico_id).first()
            if pa:
                carrera = db.query(Carrera).filter(Carrera.id == pa.carrera_id).first()
                if carrera:
                    p.carrera_nombre = carrera.nombre
                perf = db.query(Perfil).filter(Perfil.id == pa.perfil_id).first()
                if perf:
                    p.estudiante_nombre = f"{perf.nombres} {perf.apellidos}"
    return postulaciones

class ResolucionPostulacion(BaseModel):
    accion: str
    motivo_rechazo: Optional[str] = None

@router.put("/postulaciones/{id}/resolver")
def resolver_postulacion(
    id: int,
    resolucion: ResolucionPostulacion,
    request: Request,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    set_audit_context(db, current_user.id, request)
    postulacion = db.query(PostulacionMentor).filter(PostulacionMentor.id == id).first()
    if not postulacion:
        raise HTTPException(status_code=404, detail="Postulación no encontrada")
    if postulacion.estado != 'pendiente':
        raise HTTPException(status_code=400, detail="La postulación ya fue resuelta")

    est = db.query(Estudiante).filter(Estudiante.id == postulacion.estudiante_id).first()
    if not est:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")
        
    pa = db.query(PerfilAcademico).filter(PerfilAcademico.id == est.academico_id).first()
    perf = db.query(Perfil).filter(Perfil.id == pa.perfil_id).first()
    cuenta = db.query(Cuenta).filter(Cuenta.id == perf.cuenta_id).first()

    if resolucion.accion == 'aprobar':
        postulacion.estado = 'aprobada'
        mentor_existente = db.query(Mentor).filter(Mentor.academico_id == pa.id).first()
        if not mentor_existente:
            nuevo_mentor = Mentor(
                academico_id=pa.id,
                biografia="Nuevo mentor en el sistema."
            )
            db.add(nuevo_mentor)
        
        cuenta_rol_existente = db.query(CuentaRol).filter(CuentaRol.cuenta_id == cuenta.id, CuentaRol.rol_id == 2).first()
        if not cuenta_rol_existente:
            nuevo_cr = CuentaRol(cuenta_id=cuenta.id, rol_id=2)
            db.add(nuevo_cr)
            
        try:
            send_email(
                subject="¡Felicidades! Eres un nuevo Mentor",
                email_to=cuenta.correo,
                body=f"Hola {perf.nombres},<br><br>Tu postulación para ser Mentor ha sido <b>aprobada</b>. Cierra sesión y vuelve a ingresar para ver tus nuevas herramientas de mentor.<br><br>Atentamente,<br>Equipo SMA-UTMACH"
            )
        except Exception:
            pass 

    elif resolucion.accion == 'rechazar':
        if not resolucion.motivo_rechazo:
            raise HTTPException(status_code=400, detail="Debe proveer un motivo de rechazo")
        postulacion.estado = 'rechazada'
        postulacion.motivo_rechazo = resolucion.motivo_rechazo
        
        try:
            send_email(
                subject="Actualización de tu postulación a Mentor",
                email_to=cuenta.correo,
                body=f"Hola {perf.nombres},<br><br>Lamentamos informarte que tu postulación para ser Mentor no ha sido aprobada en esta ocasión.<br><br><b>Motivo:</b> {resolucion.motivo_rechazo}<br><br>Te invitamos a prepararte y volver a postular en el futuro.<br><br>Atentamente,<br>Equipo SMA-UTMACH"
            )
        except Exception:
            pass

    postulacion.fecha_resolucion = datetime.utcnow()
    try:
        db.commit()
        
        # Enviar notificación al estudiante
        titulo_notif = "Postulación Aprobada" if resolucion.accion == 'aprobar' else "Postulación Rechazada"
        mensaje_notif = "¡Felicidades! Tu postulación para ser mentor ha sido aprobada." if resolucion.accion == 'aprobar' else f"Tu postulación no fue aprobada: {resolucion.motivo_rechazo}"
        create_system_notification(
            db=db,
            cuenta_id=cuenta.id,
            titulo=titulo_notif,
            mensaje=mensaje_notif
        )
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Error al guardar la resolución")

@router.get("/auditoria")
def obtener_auditoria(
    skip: int = 0, 
    limit: int = 20, 
    fecha_inicio: Optional[str] = None, 
    fecha_fin: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(
        HistorialCambio, TablasSistema.nombre.label("tabla_nombre")
    ).outerjoin(
        TablasSistema, HistorialCambio.tabla_id == TablasSistema.id
    )

    if fecha_inicio:
        query = query.filter(HistorialCambio.fecha_creacion >= datetime.fromisoformat(fecha_inicio))
    if fecha_fin:
        # Añadir 23:59:59 si solo es fecha (manejo simple, asume YYYY-MM-DD o formato ISO)
        query = query.filter(HistorialCambio.fecha_creacion <= datetime.fromisoformat(fecha_fin))

    total = query.count()
    resultados = query.order_by(HistorialCambio.fecha_creacion.desc()).offset(skip).limit(limit).all()

    auditoria_list = []
    # Cache perfiles para evitar consultas repetitivas N+1
    perfiles_cache = {}

    for hist, tabla_nombre in resultados:
        usuario_nombre = "Sistema"
        if hist.cuenta_id:
            if hist.cuenta_id in perfiles_cache:
                usuario_nombre = perfiles_cache[hist.cuenta_id]
            else:
                perf = db.query(Perfil).filter(Perfil.cuenta_id == hist.cuenta_id).first()
                if perf:
                    usuario_nombre = f"{perf.nombres} {perf.apellidos}"
                else:
                    usuario_nombre = f"Cuenta ID: {hist.cuenta_id}"
                perfiles_cache[hist.cuenta_id] = usuario_nombre
        
        auditoria_list.append({
            "id": hist.id,
            "fecha": hist.fecha_creacion,
            "usuario": usuario_nombre,
            "ip": hist.ip_origen,
            "tabla": tabla_nombre or f"Tabla ID: {hist.tabla_id}",
            "accion": hist.accion,
            "descripcion": hist.descripcion,
            "datos_anteriores": hist.datos_anteriores,
            "datos_nuevos": hist.datos_nuevos,
            "detalles_json": hist.detalles_json
        })
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "data": auditoria_list
    }

# ==========================================
# Sala de Sesión (Chat, Recursos, Reportes)
# ==========================================

@ws_router.websocket("/ws/chat/{sesion_id}/{cuenta_id}")
async def websocket_chat(websocket: WebSocket, sesion_id: int, cuenta_id: int, db: Session = Depends(get_db)):
    # 1. Connect
    await manager.connect(websocket, sesion_id, cuenta_id)
    try:
        while True:
            # 2. Wait for messages from this client
            data = await websocket.receive_text()
            
            # 3. Save message to DB
            nuevo_mensaje = MensajeSesion(
                sesion_id=sesion_id,
                remitente_id=cuenta_id,
                mensaje=data
            )
            db.add(nuevo_mensaje)
            db.commit()
            db.refresh(nuevo_mensaje)
            
            # 4. Obtener datos de la sesión para notificar al otro usuario
            sesion = db.query(SesionMentoria).filter(SesionMentoria.id == sesion_id).first()
            if sesion:
                solicitud = db.query(SolicitudMentoria).filter(SolicitudMentoria.id == sesion.solicitud_id).first()
                if solicitud:
                    # Determinar cuenta_id del otro participante
                    otro_cuenta_id = None
                    if cuenta_id == get_cuenta_id_for_estudiante(db, solicitud.estudiante_id):
                        otro_cuenta_id = get_cuenta_id_for_mentor(db, solicitud.mentor_id)
                    else:
                        otro_cuenta_id = get_cuenta_id_for_estudiante(db, solicitud.estudiante_id)
                    
                    # 5. Notificar si el otro usuario NO está conectado a la sala
                    if otro_cuenta_id and not manager.is_user_connected(sesion_id, otro_cuenta_id):
                        notif = Notificacion(
                            cuenta_id=otro_cuenta_id,
                            tipo="sistema",
                            titulo=f"Nuevo mensaje en Sesión #{sesion_id}",
                            mensaje=f"Tienes un nuevo mensaje en la sala virtual. Mensaje: {data[:50]}...",
                            sesion_id=sesion_id
                        )
                        db.add(notif)
                        db.commit()

            # 6. Broadcast to everyone in the room
            import json
            perfil = db.query(Perfil).filter(Perfil.cuenta_id == cuenta_id).first()
            nombre = f"{perfil.nombres} {perfil.apellidos}" if perfil else f"User {cuenta_id}"
            
            payload = {
                "id": nuevo_mensaje.id,
                "remitente_id": cuenta_id,
                "remitente_nombre": nombre,
                "mensaje": data,
                "fecha_envio": nuevo_mensaje.fecha_envio.isoformat()
            }
            await manager.broadcast(json.dumps(payload), sesion_id)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, sesion_id)

@router.get("/sesiones/{sesion_id}/mensajes", response_model=List[MensajeSesionResponse])
def get_mensajes_sesion(sesion_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    mensajes = db.query(MensajeSesion).filter(MensajeSesion.sesion_id == sesion_id).order_by(MensajeSesion.fecha_envio.asc()).all()
    for m in mensajes:
        perf = db.query(Perfil).filter(Perfil.cuenta_id == m.remitente_id).first()
        m.remitente_nombre = f"{perf.nombres} {perf.apellidos}" if perf else "Desconocido"
    return mensajes

@router.get("/sesiones/{sesion_id}/recursos", response_model=List[RecursoSesionResponse])
def get_recursos_sesion(sesion_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    recursos = db.query(RecursoSesion).filter(RecursoSesion.sesion_id == sesion_id).order_by(RecursoSesion.fecha_subida.desc()).all()
    for r in recursos:
        perf = db.query(Perfil).filter(Perfil.cuenta_id == r.subido_por).first()
        r.subido_por_nombre = f"{perf.nombres} {perf.apellidos}" if perf else "Desconocido"
    return recursos

@router.post("/sesiones/{sesion_id}/recursos", response_model=RecursoSesionResponse)
def crear_recurso_sesion(sesion_id: int, recurso: RecursoSesionCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    set_audit_context(db, current_user["id"])
    nuevo_recurso = RecursoSesion(
        sesion_id=sesion_id,
        subido_por=current_user["id"],
        nombre_archivo=recurso.nombre_archivo,
        url_archivo=recurso.url_archivo
    )
    db.add(nuevo_recurso)
    db.commit()
    db.refresh(nuevo_recurso)
    return nuevo_recurso

@router.post("/sesiones/{sesion_id}/reportes", response_model=ReporteSesionResponse)
def crear_reporte_sesion(sesion_id: int, reporte: ReporteSesionCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    set_audit_context(db, current_user["id"])
    nuevo_reporte = ReporteSesion(
        sesion_id=sesion_id,
        reportador_id=current_user["id"],
        descripcion=reporte.descripcion,
        estado="pendiente"
    )
    db.add(nuevo_reporte)
    db.commit()
    db.refresh(nuevo_reporte)
    
    # Notificar a administradores
    admins = db.query(CuentaRol).join(Rol).filter(Rol.nombre == 'administrador').all()
    for admin in admins:
        notif = Notificacion(
            cuenta_id=admin.cuenta_id,
            tipo="reporte",
            titulo="Nuevo Reporte de Sesión",
            mensaje=f"Se ha reportado una incidencia en la sesión #{sesion_id}.",
            referencia_id=sesion_id
        )
        db.add(notif)
    db.commit()
    
    return nuevo_reporte

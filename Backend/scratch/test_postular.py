from app.database import engine, SessionLocal
from app.models.processes import PostulacionMentor, Notificacion
from app.models.users import Perfil, CuentaRol
from app.models import actors, academic, catalogs

db = SessionLocal()
cuenta_id = 43

try:
    print("Testing insertion logic...")
    nueva = PostulacionMentor(
        estudiante_id=1, # Assume 1 exists
        motivo="Test motive"
    )
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    print("Postulacion inserted. ID:", nueva.id)

    # Notificar a los administradores
    est_perf = db.query(Perfil).filter(Perfil.cuenta_id == cuenta_id).first()
    nombre_est = f"{est_perf.nombres} {est_perf.apellidos}" if est_perf else "Un estudiante"
    
    admins = db.query(CuentaRol).filter(CuentaRol.rol_id == 3).all()
    for admin in admins:
        notif = Notificacion(
            cuenta_id=admin.cuenta_id,
            tipo='sistema',
            titulo="Nueva postulación a mentor",
            mensaje=f"{nombre_est} ha enviado una solicitud para ser mentor."
        )
        db.add(notif)
    db.commit()
    print("Notifications inserted.")
except Exception as e:
    print("ERROR:", e)
    db.rollback()
finally:
    db.close()

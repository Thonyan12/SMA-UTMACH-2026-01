import re

with open(r'c:\Users\antho\Proyecto_SMA\Backend\app\routers\processes.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Add get_current_user import if not there
if "from app.core.dependencies import get_current_user" not in content:
    content = content.replace("from app.database import get_db", "from app.database import get_db\nfrom app.core.dependencies import get_current_user")

# 1. Update resolver_postulacion
# Def: def resolver_postulacion(id: int, resolucion: ResolucionPostulacion, db: Session = Depends(get_db)):
old_resolver = """def resolver_postulacion(
    id: int,
    resolucion: ResolucionPostulacion,
    db: Session = Depends(get_db)
):"""
new_resolver = """def resolver_postulacion(
    id: int,
    resolucion: ResolucionPostulacion,
    request: Request,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    set_audit_context(db, current_user.id, request)"""
content = content.replace(old_resolver, new_resolver)

# 2. Update create_solicitud_mentoria
old_create_sol = """def create_solicitud_mentoria(item: SolicitudMentoriaCreate, db: Session = Depends(get_db)):"""
new_create_sol = """def create_solicitud_mentoria(item: SolicitudMentoriaCreate, request: Request, db: Session = Depends(get_db)):
    c_id = get_cuenta_id_for_estudiante(db, item.estudiante_id)
    set_audit_context(db, c_id, request)"""
content = content.replace(old_create_sol, new_create_sol)

# 3. Update update_solicitud_mentoria
old_update_sol = """def update_solicitud_mentoria(id: int, item: SolicitudMentoriaUpdate, db: Session = Depends(get_db)):"""
new_update_sol = """def update_solicitud_mentoria(id: int, item: SolicitudMentoriaUpdate, request: Request, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    set_audit_context(db, current_user.id, request)"""
content = content.replace(old_update_sol, new_update_sol)

# 4. Update create_sesion_mentoria
old_create_ses = """def create_sesion_mentoria(item: SesionMentoriaCreate, db: Session = Depends(get_db)):"""
new_create_ses = """def create_sesion_mentoria(item: SesionMentoriaCreate, request: Request, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    set_audit_context(db, current_user.id, request)"""
content = content.replace(old_create_ses, new_create_ses)

# 5. Update update_sesion_mentoria
old_update_ses = """def update_sesion_mentoria(id: int, item: SesionMentoriaUpdate, db: Session = Depends(get_db)):"""
new_update_ses = """def update_sesion_mentoria(id: int, item: SesionMentoriaUpdate, request: Request, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    set_audit_context(db, current_user.id, request)"""
content = content.replace(old_update_ses, new_update_ses)

with open(r'c:\Users\antho\Proyecto_SMA\Backend\app\routers\processes.py', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated processes.py")

from app.database import SessionLocal
from app.models.users import Cuenta, Perfil, CuentaRol
from app.models.academic import PerfilAcademico, Carrera
from app.core.security import get_password_hash

db = SessionLocal()

correo = 'alima3@utmachala.edu.ec'
if not db.query(Cuenta).filter(Cuenta.correo == correo).first():
    nueva_cuenta = Cuenta(
        correo=correo,
        password_hash=get_password_hash('Admin123'),
        estado=1
    )
    db.add(nueva_cuenta)
    db.commit()
    db.refresh(nueva_cuenta)
    
    nuevo_perfil = Perfil(
        cuenta_id=nueva_cuenta.id,
        codigo_institucional='0705432101',
        nombres='Anthony Mauricio',
        apellidos='Lima Calderon',
        estado=1
    )
    db.add(nuevo_perfil)
    
    nuevo_rol = CuentaRol(
        cuenta_id=nueva_cuenta.id,
        rol_id=3  # Administrador
    )
    db.add(nuevo_rol)
    
    # get TI carrera
    carrera = db.query(Carrera).filter(Carrera.nombre.ilike('%tecnologias%')).first()
    if carrera:
        nuevo_academico = PerfilAcademico(
            perfil_id=nuevo_perfil.id,
            carrera_id=carrera.id,
            semestre=8
        )
        db.add(nuevo_academico)
        db.commit()
        # No actualizamos a la tabla `estudiantes` porque la UI de administradores
        # no asocia esto a `estudiantes` a menos que tengan el rol estudiante.
        
    print('Usuario insertado exitosamente')
else:
    print('El usuario ya existe')

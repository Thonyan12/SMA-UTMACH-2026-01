from datetime import timedelta, datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.users import Cuenta, CuentaRol, Rol, Perfil
from app.models.actors import Estudiante, Mentor
from app.models.academic import PerfilAcademico
from app.schemas.auth import Token, UserRegister, AuthMeResponse, ForgotPasswordRequest, ResetPasswordRequest, Verify2FARequest
from app.schemas.users import CuentaResponse
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.dependencies import get_current_user
from app.models.security import CodigoVerificacion
from app.services.email_service import send_email
import random
import string
from fastapi import Header

router = APIRouter()


@router.post("/login", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), x_device_id: str = Header(default=None), db: Session = Depends(get_db)):
    user = db.query(Cuenta).filter(Cuenta.correo == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contrasena incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if user.estado != 1:
        raise HTTPException(status_code=400, detail="Usuario inactivo")
        
    # LOGICA 2FA:
    # Si no hay x_device_id, consideramos que es un dispositivo nuevo
    if not x_device_id:
        # Generar código 2FA
        codigo = ''.join(random.choices(string.digits, k=6))
        expiracion = datetime.utcnow() + timedelta(minutes=15)
        
        nuevo_codigo = CodigoVerificacion(
            cuenta_id=user.id,
            codigo=codigo,
            tipo='2fa',
            fecha_expiracion=expiracion
        )
        db.add(nuevo_codigo)
        db.commit()
        
        # Enviar correo
        html = f"""
        <html>
            <body style="font-family: Arial, sans-serif; color: #333;">
                <h2 style="color: #0056b3;">Sistema de Mentorías SMA</h2>
                <p>Hola,</p>
                <p>Hemos detectado un intento de inicio de sesión desde un nuevo dispositivo. Utiliza el siguiente código temporal de 6 dígitos para verificar tu identidad y acceder al sistema:</p>
                <div style="margin: 20px 0; padding: 15px; background-color: #f4f4f4; border-radius: 8px; text-align: center;">
                    <h1 style="margin: 0; font-size: 32px; letter-spacing: 5px;">{codigo}</h1>
                </div>
                <p>Este código expirará en 15 minutos.</p>
                <p>Si no fuiste tú, por favor ignora este mensaje.</p>
                <br/>
                <p>Atentamente,<br/>Equipo de Soporte SMA</p>
            </body>
        </html>
        """
        send_email(user.correo, "Código de Verificación 2FA - SMA", html)
        
        return {"access_token": None, "token_type": None, "requires_2fa": True, "cuenta_id": user.id, "message": "Código enviado al correo"}
        
    user.ultimo_acceso = datetime.utcnow()
    db.commit()
        
    access_token = create_access_token(data={"sub": user.correo})
    return {"access_token": access_token, "token_type": "bearer", "requires_2fa": False}

@router.post("/verify-2fa", response_model=Token)
def verify_2fa(req: Verify2FARequest, db: Session = Depends(get_db)):
    user = db.query(Cuenta).filter(Cuenta.id == req.cuenta_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    cod = db.query(CodigoVerificacion).filter(
        CodigoVerificacion.cuenta_id == req.cuenta_id,
        CodigoVerificacion.codigo == req.codigo,
        CodigoVerificacion.tipo == '2fa',
        CodigoVerificacion.fecha_expiracion > datetime.utcnow()
    ).first()
    
    if not cod:
        raise HTTPException(status_code=400, detail="Código inválido o expirado")
        
    db.delete(cod)
    
    user.ultimo_acceso = datetime.utcnow()
    db.commit()
    
    access_token = create_access_token(data={"sub": user.correo})
    return {"access_token": access_token, "token_type": "bearer", "requires_2fa": False}

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(Cuenta).filter(Cuenta.correo == req.correo).first()
    if not user:
        # Por seguridad no indicamos si el correo existe o no
        return {"message": "Si el correo está registrado, recibirás un código."}
        
    codigo = ''.join(random.choices(string.digits, k=6))
    expiracion = datetime.utcnow() + timedelta(minutes=15)
    
    nuevo_codigo = CodigoVerificacion(
        cuenta_id=user.id,
        codigo=codigo,
        tipo='recovery',
        fecha_expiracion=expiracion
    )
    db.add(nuevo_codigo)
    db.commit()
    
    html = f"""
    <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #0056b3;">Sistema de Mentorías SMA</h2>
            <p>Hola,</p>
            <p>Has solicitado restablecer tu contraseña. Utiliza el siguiente código temporal de 6 dígitos para cambiar tu contraseña de acceso:</p>
            <div style="margin: 20px 0; padding: 15px; background-color: #f4f4f4; border-radius: 8px; text-align: center;">
                <h1 style="margin: 0; font-size: 32px; letter-spacing: 5px;">{codigo}</h1>
            </div>
            <p>Este código expirará en 15 minutos.</p>
            <p>Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
            <br/>
            <p>Atentamente,<br/>Equipo de Soporte SMA</p>
        </body>
    </html>
    """
    send_email(user.correo, "Recuperación de Contraseña - SMA", html)
    
    return {"message": "Si el correo está registrado, recibirás un código."}

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(Cuenta).filter(Cuenta.correo == req.correo).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    cod = db.query(CodigoVerificacion).filter(
        CodigoVerificacion.cuenta_id == user.id,
        CodigoVerificacion.codigo == req.codigo,
        CodigoVerificacion.tipo == 'recovery',
        CodigoVerificacion.fecha_expiracion > datetime.utcnow()
    ).first()
    
    if not cod:
        raise HTTPException(status_code=400, detail="Código inválido o expirado")
        
    user.password_hash = get_password_hash(req.nueva_password)
    db.delete(cod)
    db.commit()
    
    return {"message": "Contraseña actualizada correctamente"}

@router.post("/register", response_model=CuentaResponse)
def register_user(user_in: UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(Cuenta).filter(Cuenta.correo == user_in.correo).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="El correo ya esta registrado")
        
    hashed_password = get_password_hash(user_in.password)
    new_user = Cuenta(
        correo=user_in.correo,
        password_hash=hashed_password,
        estado=1
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get("/me", response_model=AuthMeResponse)
def read_users_me(current_user: Cuenta = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(Cuenta).options(joinedload(Cuenta.roles).joinedload(CuentaRol.rol)).filter(Cuenta.id == current_user.id).first()
    
    roles = [cr.rol.nombre for cr in user.roles] if user.roles else []
    
    perfil = db.query(Perfil).filter(Perfil.cuenta_id == user.id).first()
    perfil_id = perfil.id if perfil else None
    
    estudiante_id = None
    mentor_id = None
    carrera_nombre = None
    semestre = None
    
    if perfil_id:
        # Avoid circular import or do local import if needed, but Carrera is imported or available?
        from app.models.academic import PerfilAcademico, Carrera
        pa = db.query(PerfilAcademico).filter(PerfilAcademico.perfil_id == perfil_id).first()
        if pa:
            carrera = db.query(Carrera).filter(Carrera.id == pa.carrera_id).first()
            if carrera:
                carrera_nombre = carrera.nombre

            est = db.query(Estudiante).filter(Estudiante.academico_id == pa.id).first()
            if est:
                estudiante_id = est.id
                semestre = est.semestre
            
            men = db.query(Mentor).filter(Mentor.academico_id == pa.id).first()
            if men:
                mentor_id = men.id
                
    response_data = {
        "id": user.id,
        "uuid": user.uuid,
        "correo": user.correo,
        "estado": user.estado,
        "ultimo_acceso": user.ultimo_acceso,
        "fecha_creacion": user.fecha_creacion,
        "fecha_actualizacion": user.fecha_actualizacion,
        "roles": roles,
        "perfil_id": perfil_id,
        "nombres": perfil.nombres if perfil else None,
        "apellidos": perfil.apellidos if perfil else None,
        "estudiante_id": estudiante_id,
        "mentor_id": mentor_id,
        "carrera_nombre": carrera_nombre,
        "semestre": semestre
    }
    
    return response_data

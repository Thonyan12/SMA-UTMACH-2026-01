from datetime import timedelta, datetime
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response, Cookie
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.users import Cuenta, CuentaRol, Rol, Perfil
from app.models.actors import Estudiante, Mentor
from app.models.academic import PerfilAcademico, Carrera
from app.schemas.auth import Token, UserRegister, AuthMeResponse, ForgotPasswordRequest, ResetPasswordRequest, Verify2FARequest, VerifyRegisterRequest
from app.schemas.users import CuentaResponse
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token
from app.core.dependencies import get_current_user
from app.core.limiter import limiter
from jose import jwt, JWTError
from app.core.config import settings
from app.models.security import CodigoVerificacion
from app.services.email_service import send_email
import random
import string
from fastapi import Header

router = APIRouter()


@router.post("/login", response_model=Token)
@limiter.limit("5/5minutes")
def login_for_access_token(
    request: Request,
    response: Response, 
    form_data: OAuth2PasswordRequestForm = Depends(), 
    x_device_id: str = Header(default=None), 
    db: Session = Depends(get_db)
):
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
    refresh_token = create_refresh_token(data={"sub": user.correo})
    
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        max_age=7 * 24 * 60 * 60
    )
    return {"access_token": access_token, "token_type": "bearer", "requires_2fa": False}

@router.post("/verify-2fa", response_model=Token)
def verify_2fa(req: Verify2FARequest, response: Response, db: Session = Depends(get_db)):
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
    refresh_token = create_refresh_token(data={"sub": user.correo})
    
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        max_age=7 * 24 * 60 * 60
    )
    return {"access_token": access_token, "token_type": "bearer", "requires_2fa": False}

@router.post("/refresh", response_model=Token)
def refresh_token(response: Response, refresh_token: str = Cookie(None), db: Session = Depends(get_db)):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token no encontrado")
        
    try:
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        correo: str = payload.get("sub")
        token_type: str = payload.get("type")
        if correo is None or token_type != "refresh":
            raise HTTPException(status_code=401, detail="Refresh token inválido")
    except JWTError:
        raise HTTPException(status_code=401, detail="Refresh token inválido o expirado")
        
    user = db.query(Cuenta).filter(Cuenta.correo == correo).first()
    if not user or user.estado != 1:
        raise HTTPException(status_code=401, detail="Usuario inactivo o no existe")
        
    new_access_token = create_access_token(data={"sub": user.correo})
    return {"access_token": new_access_token, "token_type": "bearer", "requires_2fa": False}

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("refresh_token")
    return {"message": "Sesión cerrada correctamente"}

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

@router.get("/carreras")
def get_carreras(db: Session = Depends(get_db)):
    carreras = db.query(Carrera).filter(Carrera.estado == 1).all()
    return [{"id": c.id, "nombre": c.nombre} for c in carreras]

@router.post("/register")
def register_user(user_in: UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(Cuenta).filter(Cuenta.correo == user_in.correo).first()
    
    # Check if exists and active
    if existing_user:
        if existing_user.estado == 1:
            raise HTTPException(status_code=400, detail="El correo ya esta registrado y activo.")
        else:
            # Overwrite pending user data
            user = existing_user
            user.password_hash = get_password_hash(user_in.password)
            db.commit()
    else:
        # Create new pending user
        hashed_password = get_password_hash(user_in.password)
        user = Cuenta(
            correo=user_in.correo,
            password_hash=hashed_password,
            estado=0
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
    # Check perfil
    perfil = db.query(Perfil).filter(Perfil.cuenta_id == user.id).first()
    if not perfil:
        perfil = Perfil(
            cuenta_id=user.id,
            codigo_institucional=user_in.cedula,
            nombres=user_in.nombres,
            apellidos=user_in.apellidos,
            estado=0
        )
        db.add(perfil)
        db.commit()
        db.refresh(perfil)
    else:
        perfil.codigo_institucional = user_in.cedula
        perfil.nombres = user_in.nombres
        perfil.apellidos = user_in.apellidos
        perfil.estado = 0
        db.commit()
        
    # Check roles (Estudiante = 1)
    rol = db.query(CuentaRol).filter(CuentaRol.cuenta_id == user.id, CuentaRol.rol_id == 1).first()
    if not rol:
        db.add(CuentaRol(cuenta_id=user.id, rol_id=1))
        db.commit()

    # Check PerfilAcademico
    pa = db.query(PerfilAcademico).filter(PerfilAcademico.perfil_id == perfil.id).first()
    if not pa:
        pa = PerfilAcademico(perfil_id=perfil.id, carrera_id=user_in.carrera_id)
        db.add(pa)
        db.commit()
        db.refresh(pa)
    else:
        pa.carrera_id = user_in.carrera_id
        db.commit()

    # Check Estudiante
    est = db.query(Estudiante).filter(Estudiante.academico_id == pa.id).first()
    if not est:
        est = Estudiante(academico_id=pa.id, semestre=user_in.semestre, estado=0)
        db.add(est)
        db.commit()
    else:
        est.semestre = user_in.semestre
        est.estado = 0
        db.commit()
        
    # Limpiar códigos anteriores de register
    db.query(CodigoVerificacion).filter(
        CodigoVerificacion.cuenta_id == user.id,
        CodigoVerificacion.tipo == 'register'
    ).delete()
    db.commit()

    # Generar código 2FA
    codigo = ''.join(random.choices(string.digits, k=6))
    expiracion = datetime.utcnow() + timedelta(minutes=15)
    
    nuevo_codigo = CodigoVerificacion(
        cuenta_id=user.id,
        codigo=codigo,
        tipo='register',
        fecha_expiracion=expiracion
    )
    db.add(nuevo_codigo)
    db.commit()

    html = f"""
    <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #0056b3;">Sistema de Mentorías SMA</h2>
            <p>Hola {user_in.nombres},</p>
            <p>Estás a un paso de crear tu cuenta. Utiliza el siguiente código temporal de 6 dígitos para verificar tu correo institucional:</p>
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
    send_email(user.correo, "Verificación de Cuenta - SMA", html)

    return {"message": "Código de verificación enviado", "requires_verification": True, "cuenta_id": user.id}

@router.post("/verify-register")
def verify_register(req: VerifyRegisterRequest, db: Session = Depends(get_db)):
    user = db.query(Cuenta).filter(Cuenta.correo == req.correo).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    cod = db.query(CodigoVerificacion).filter(
        CodigoVerificacion.cuenta_id == user.id,
        CodigoVerificacion.codigo == req.codigo,
        CodigoVerificacion.tipo == 'register',
        CodigoVerificacion.fecha_expiracion > datetime.utcnow()
    ).first()
    
    if not cod:
        raise HTTPException(status_code=400, detail="Código inválido o expirado")
        
    # Activar la cuenta
    user.estado = 1
    perfil = db.query(Perfil).filter(Perfil.cuenta_id == user.id).first()
    if perfil:
        perfil.estado = 1
        pa = db.query(PerfilAcademico).filter(PerfilAcademico.perfil_id == perfil.id).first()
        if pa:
            est = db.query(Estudiante).filter(Estudiante.academico_id == pa.id).first()
            if est:
                est.estado = 1
    
    db.delete(cod)
    db.commit()
    
    return {"message": "Cuenta verificada y activada exitosamente"}

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

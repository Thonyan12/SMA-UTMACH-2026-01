

trg_mentores = """
CREATE OR REPLACE TRIGGER trg_audit_mentores
AFTER INSERT OR UPDATE OR DELETE ON mentores
FOR EACH ROW
DECLARE
    v_accion VARCHAR2(10);
    v_cuenta_id NUMBER := NULL;
BEGIN
    IF INSERTING THEN v_accion := 'crear';
    ELSIF UPDATING THEN v_accion := 'actualizar';
    ELSE v_accion := 'eliminar';
    END IF;
    
    BEGIN
        v_cuenta_id := TO_NUMBER(SYS_CONTEXT('USERENV', 'CLIENT_IDENTIFIER'));
    EXCEPTION WHEN OTHERS THEN
        v_cuenta_id := NULL;
    END;

    INSERT INTO historial_cambios (tabla_id, registro_id, accion, descripcion, detalles_json, cuenta_id, ip_origen)
    VALUES (
        (SELECT id FROM tablas_sistema WHERE nombre = 'mentores'),
        NVL(:NEW.id, :OLD.id),
        v_accion,
        'Auditoría automática de mentor',
        JSON_OBJECT(
            'old_estado' VALUE NVL(:OLD.estado_aprobacion, 'N/A'),
            'new_estado' VALUE NVL(:NEW.estado_aprobacion, 'N/A')
        ),
        v_cuenta_id,
        SYS_CONTEXT('USERENV', 'CLIENT_INFO')
    );
END;
"""

trg_solicitudes = """
CREATE OR REPLACE TRIGGER trg_audit_solicitudes
AFTER INSERT OR UPDATE OR DELETE ON solicitudes_mentoria
FOR EACH ROW
DECLARE
    v_accion VARCHAR2(10);
    v_cuenta_id NUMBER := NULL;
BEGIN
    IF INSERTING THEN v_accion := 'crear';
    ELSIF UPDATING THEN v_accion := 'actualizar';
    ELSE v_accion := 'eliminar';
    END IF;
    
    BEGIN
        v_cuenta_id := TO_NUMBER(SYS_CONTEXT('USERENV', 'CLIENT_IDENTIFIER'));
    EXCEPTION WHEN OTHERS THEN
        v_cuenta_id := NULL;
    END;

    INSERT INTO historial_cambios (tabla_id, registro_id, accion, descripcion, detalles_json, cuenta_id, ip_origen)
    VALUES (
        (SELECT id FROM tablas_sistema WHERE nombre = 'solicitudes_mentoria'),
        NVL(:NEW.id, :OLD.id),
        v_accion,
        'Auditoría automática de solicitud',
        JSON_OBJECT(
            'old_estado' VALUE NVL(:OLD.estado_solicitud, 'N/A'),
            'new_estado' VALUE NVL(:NEW.estado_solicitud, 'N/A')
        ),
        v_cuenta_id,
        SYS_CONTEXT('USERENV', 'CLIENT_INFO')
    );
END;
"""

trg_sesiones = """
CREATE OR REPLACE TRIGGER trg_audit_sesiones
AFTER INSERT OR UPDATE OR DELETE ON sesiones_mentoria
FOR EACH ROW
DECLARE
    v_accion VARCHAR2(10);
    v_cuenta_id NUMBER := NULL;
BEGIN
    IF INSERTING THEN v_accion := 'crear';
    ELSIF UPDATING THEN v_accion := 'actualizar';
    ELSE v_accion := 'eliminar';
    END IF;
    
    BEGIN
        v_cuenta_id := TO_NUMBER(SYS_CONTEXT('USERENV', 'CLIENT_IDENTIFIER'));
    EXCEPTION WHEN OTHERS THEN
        v_cuenta_id := NULL;
    END;

    INSERT INTO historial_cambios (tabla_id, registro_id, accion, descripcion, detalles_json, cuenta_id, ip_origen)
    VALUES (
        (SELECT id FROM tablas_sistema WHERE nombre = 'sesiones_mentoria'),
        NVL(:NEW.id, :OLD.id),
        v_accion,
        'Auditoría automática de sesión',
        JSON_OBJECT(
            'old_estado' VALUE NVL(:OLD.estado_sesion, 'N/A'),
            'new_estado' VALUE NVL(:NEW.estado_sesion, 'N/A')
        ),
        v_cuenta_id,
        SYS_CONTEXT('USERENV', 'CLIENT_INFO')
    );
END;
"""

from app.database import engine

try:
    connection = engine.raw_connection()
    cursor = connection.cursor()
    
    print("Updating trg_audit_mentores...")
    cursor.execute(trg_mentores)
    print("Updating trg_audit_solicitudes...")
    cursor.execute(trg_solicitudes)
    print("Updating trg_audit_sesiones...")
    cursor.execute(trg_sesiones)
    
    connection.commit()
    print("Triggers updated successfully using pure oracledb!")
except Exception as e:
    print(f"Error: {e}")
finally:
    if 'cursor' in locals():
        cursor.close()
    if 'connection' in locals():
        connection.close()

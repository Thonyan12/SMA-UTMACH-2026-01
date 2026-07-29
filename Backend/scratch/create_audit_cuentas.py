import oracledb
import os
from dotenv import load_dotenv

load_dotenv()

def update_cuentas_trigger():
    print("Connecting to Oracle database...")
    connection = oracledb.connect(
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        dsn=f"{os.getenv('DB_HOST')}:{os.getenv('DB_PORT', '1521')}/{os.getenv('DB_SERVICE_NAME')}"
    )
    cursor = connection.cursor()

    trigger_sql = """
    CREATE OR REPLACE TRIGGER trg_audit_cuentas
    AFTER INSERT OR UPDATE OR DELETE ON cuentas
    FOR EACH ROW
    DECLARE
        v_accion VARCHAR2(10);
        v_cuenta_id NUMBER := NULL;
        v_descripcion VARCHAR2(4000);
        v_json CLOB;
    BEGIN
        -- Determinar la acción
        IF INSERTING THEN
            v_accion := 'crear';
            v_cuenta_id := :NEW.id;
            v_descripcion := 'Creación de cuenta de usuario';
            v_json := JSON_OBJECT('correo' VALUE :NEW.correo, 'estado' VALUE :NEW.estado);
            
            INSERT INTO historial_cambios (tabla_id, registro_id, accion, descripcion, detalles_json, cuenta_id, ip_origen)
            VALUES (
                (SELECT id FROM tablas_sistema WHERE nombre = 'cuentas'),
                :NEW.id,
                v_accion,
                v_descripcion,
                v_json,
                v_cuenta_id,
                SYS_CONTEXT('USERENV', 'CLIENT_INFO')
            );
            
        ELSIF DELETING THEN
            v_accion := 'eliminar';
            v_cuenta_id := :OLD.id;
            v_descripcion := 'Eliminación de cuenta de usuario';
            v_json := JSON_OBJECT('correo' VALUE :OLD.correo);
            
            INSERT INTO historial_cambios (tabla_id, registro_id, accion, descripcion, detalles_json, cuenta_id, ip_origen)
            VALUES (
                (SELECT id FROM tablas_sistema WHERE nombre = 'cuentas'),
                :OLD.id,
                v_accion,
                v_descripcion,
                v_json,
                v_cuenta_id,
                SYS_CONTEXT('USERENV', 'CLIENT_INFO')
            );
            
        ELSIF UPDATING THEN
            v_accion := 'actualizar';
            v_cuenta_id := :NEW.id;
            
            -- Auditoría específica de Inicios de Sesión
            IF UPDATING('ultimo_acceso') AND (
                :OLD.ultimo_acceso IS NULL OR :NEW.ultimo_acceso != :OLD.ultimo_acceso
            ) THEN
                v_descripcion := 'Inicio de sesión exitoso';
                v_json := JSON_OBJECT(
                    'evento' VALUE 'login',
                    'nuevo_acceso' VALUE TO_CHAR(:NEW.ultimo_acceso, 'YYYY-MM-DD HH24:MI:SS')
                );
                
                INSERT INTO historial_cambios (tabla_id, registro_id, accion, descripcion, detalles_json, cuenta_id, ip_origen)
                VALUES (
                    (SELECT id FROM tablas_sistema WHERE nombre = 'cuentas'),
                    :NEW.id,
                    v_accion,
                    v_descripcion,
                    v_json,
                    v_cuenta_id,
                    SYS_CONTEXT('USERENV', 'CLIENT_INFO')
                );
            END IF;
            
            -- Auditoría específica de Cambio de Contraseña
            IF UPDATING('password_hash') AND (
                :OLD.password_hash IS NULL OR :NEW.password_hash != :OLD.password_hash
            ) THEN
                v_descripcion := 'Cambio de contraseña de usuario';
                v_json := JSON_OBJECT(
                    'evento' VALUE 'cambio_password',
                    'aviso' VALUE 'Contraseña actualizada (valor omitido por seguridad)'
                );
                
                INSERT INTO historial_cambios (tabla_id, registro_id, accion, descripcion, detalles_json, cuenta_id, ip_origen)
                VALUES (
                    (SELECT id FROM tablas_sistema WHERE nombre = 'cuentas'),
                    :NEW.id,
                    v_accion,
                    v_descripcion,
                    v_json,
                    v_cuenta_id,
                    SYS_CONTEXT('USERENV', 'CLIENT_INFO')
                );
            END IF;
            
            -- Auditoría de otros cambios genéricos de la cuenta (ej. estado)
            IF UPDATING('estado') OR UPDATING('correo') THEN
                v_descripcion := 'Actualización de datos de cuenta';
                v_json := JSON_OBJECT(
                    'old_correo' VALUE :OLD.correo,
                    'new_correo' VALUE :NEW.correo,
                    'old_estado' VALUE :OLD.estado,
                    'new_estado' VALUE :NEW.estado
                );
                
                INSERT INTO historial_cambios (tabla_id, registro_id, accion, descripcion, detalles_json, cuenta_id, ip_origen)
                VALUES (
                    (SELECT id FROM tablas_sistema WHERE nombre = 'cuentas'),
                    :NEW.id,
                    v_accion,
                    v_descripcion,
                    v_json,
                    v_cuenta_id,
                    SYS_CONTEXT('USERENV', 'CLIENT_INFO')
                );
            END IF;
            
        END IF;
    END;
    """

    print("Executing trg_audit_cuentas creation...")
    cursor.execute(trigger_sql)
    connection.commit()
    print("Trigger created successfully.")

    print("Checking for errors...")
    cursor.execute("SELECT line, position, text FROM user_errors WHERE name = 'TRG_AUDIT_CUENTAS'")
    errors = cursor.fetchall()
    if errors:
        print("ERRORS FOUND:")
        for err in errors:
            print(err)
    else:
        print("No errors. Trigger compiled successfully.")
    
    cursor.close()
    connection.close()

if __name__ == "__main__":
    update_cuentas_trigger()

import traceback
from app.database import SessionLocal
from app.models.users import Cuenta
import oracledb

try:
    db = SessionLocal()
    print("Conectado. Haciendo query a Cuenta...")
    cuentas = db.query(Cuenta).all()
    print(f"Se encontraron {len(cuentas)} cuentas.")
    for c in cuentas:
        print(f"Cuenta ID: {c.id}, Correo: {c.correo}, UUID type: {type(c.uuid)}")
except Exception as e:
    print("Ocurrió un error:")
    traceback.print_exc()
finally:
    db.close()

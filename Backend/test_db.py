import os
from dotenv import load_dotenv
import oracledb

load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT", "1521")
DB_SERVICE_NAME = os.getenv("DB_SERVICE_NAME")

print("Probando conexión con oracledb (Thin mode)...")
try:
    connection = oracledb.connect(
        user=DB_USER,
        password=DB_PASSWORD,
        dsn=f"{DB_HOST}:{DB_PORT}/{DB_SERVICE_NAME}"
    )
    print("¡Conexión exitosa a Oracle DB usando oracledb directamente!")
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1 FROM DUAL")
        for row in cursor:
            print("Resultado de SELECT 1 FROM DUAL:", row[0])
    connection.close()
except Exception as e:
    print("Fallo al conectar:", e)

from app.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    print("ERRORS:")
    res = conn.execute(text("SELECT name, type, line, position, text FROM user_errors WHERE name IN ('TRG_AUDIT_MENTORES', 'TRG_AUDIT_SOLICITUDES', 'TRG_AUDIT_SESIONES')"))
    for row in res:
        print(row)

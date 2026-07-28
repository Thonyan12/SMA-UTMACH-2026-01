from app.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    print("HISTORIAL:")
    res = conn.execute(text("SELECT id, cuenta_id, db_user FROM historial_cambios ORDER BY id DESC FETCH FIRST 10 ROWS ONLY"))
    for row in res:
        print(row)

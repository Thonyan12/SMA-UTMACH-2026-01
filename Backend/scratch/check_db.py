from app.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    print("NOTIFICACIONES:")
    res = conn.execute(text("SELECT column_name, data_default, nullable FROM all_tab_columns WHERE table_name = 'NOTIFICACIONES'"))
    for row in res:
        print(row)

from app.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    print("CONSTRAINTS:")
    res = conn.execute(text("SELECT constraint_name, constraint_type FROM all_constraints WHERE table_name = 'POSTULACIONES_MENTOR'"))
    for row in res:
        print(row)

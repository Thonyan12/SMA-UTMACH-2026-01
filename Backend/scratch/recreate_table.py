from app.database import engine, Base
from app.models import processes, actors, academic, users, catalogs
from sqlalchemy import text

print("Dropping and recreating PostulacionMentor table...")
with engine.connect() as conn:
    try:
        conn.execute(text("DROP TABLE postulaciones_mentor CASCADE CONSTRAINTS"))
        conn.commit()
        print("Table dropped.")
    except Exception as e:
        print("Table might not exist:", e)

Base.metadata.create_all(bind=engine, tables=[processes.PostulacionMentor.__table__])
print("Table created.")

with engine.connect() as conn:
    print("Columns now:")
    res = conn.execute(text("SELECT column_name, data_default FROM all_tab_columns WHERE table_name = 'POSTULACIONES_MENTOR'"))
    for row in res:
        print(row)

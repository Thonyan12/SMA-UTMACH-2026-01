from app.database import engine, Base
from app.models import users, actors, academic, processes, catalogs

print("Creating PostulacionMentor table if it doesn't exist...")
Base.metadata.create_all(bind=engine, tables=[processes.PostulacionMentor.__table__])
print("Done!")

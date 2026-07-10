from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.paths import DATABASE_PATH

# 1. Create the database file
SQLALCHEMY_DATABASE_URL = f"sqlite:///{str(DATABASE_PATH)}"

# 2. Engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# 3. Temporary connection for reading/writing
SessionLocal = sessionmaker(autoflush=False, bind=engine)

# 4. For tables
Base = declarative_base()

# 5. Dependency 
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
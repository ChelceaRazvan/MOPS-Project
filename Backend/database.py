from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from urllib.parse import quote_plus
import pyodbc

# ---------- SERVER & DATABASE ----------
HOST = r"(localdb)\MSSQLLocalDB"  # or your server name
DBNAME = "erp"

# ---------- DRIVER ----------
driver = quote_plus("ODBC Driver 18 for SQL Server")

# ---------- SQLALCHEMY DATABASE URL (Windows Auth) ----------
DATABASE_URL = (
    f"mssql+pyodbc://@{HOST}/{DBNAME}"
    f"?driver={driver}"
    "&trusted_connection=yes"
    "&Encrypt=yes"
    "&TrustServerCertificate=yes"
)

# ---------- ENGINE & SESSION ----------
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    fast_executemany=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ---------- DEPENDENCY ----------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


CONNECTION_STRING = (
    "DRIVER={ODBC Driver 18 for SQL Server};"
    f"SERVER={HOST};"
    f"DATABASE={DBNAME};"
    "Trusted_Connection=yes;"
    "Encrypt=yes;"
    "TrustServerCertificate=yes;"
)
def get_db_connection():
    return pyodbc.connect(CONNECTION_STRING)
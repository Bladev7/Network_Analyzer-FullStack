from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# =========================
# DATABASE CONFIG
# =========================
DATABASE_URL = "mysql+pymysql://root:@localhost/network_analyzer"

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,     # checks dead connections automatically
    pool_recycle=3600,      # avoids MySQL timeout issues
    pool_size=10,           # 🔥 base connections
    max_overflow=20,        # 🔥 extra burst connections
    echo=False              # True only for debugging SQL
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()
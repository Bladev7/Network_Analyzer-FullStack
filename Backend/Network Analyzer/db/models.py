from sqlalchemy import Column, Integer, Float, DateTime, String
from datetime import datetime, timezone
from db.database import Base

class SpeedTestResult(Base):
    __tablename__ = "speed_tests"

    session_id = Column(String(36), primary_key=True, index=True)


    user_id = Column(Integer, nullable=False)
    isp_id = Column(Integer, nullable=False)

    download = Column(Float, nullable=False)
    upload = Column(Float, nullable=True)
    ping = Column(Float, nullable=False)
    jitter = Column(Float, nullable=False)
    packet_loss = Column(Float, nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
from db.database import SessionLocal
from db.models import SpeedTestResult
from datetime import datetime, timezone

def save_speed_test(session_id, user_id, isp_id, download, upload, ping, jitter, packet_loss):
    db = SessionLocal()

    try:
        result = SpeedTestResult(
            session_id=session_id,
            user_id=user_id,
            isp_id=isp_id,
            download=download,
            upload=upload,
            ping=ping,
            jitter=jitter,
            packet_loss=packet_loss,
            created_at=datetime.now(timezone.utc)
        )

        db.add(result)
        db.commit()
        db.refresh(result)
        print("Data saved successfully to DB!")
        return result

    except Exception as e:
        db.rollback()
        print(f"Database insertion error: {e}")
        return None

    finally:
        db.close()
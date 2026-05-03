from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import time
import random
import uuid
from contextlib import asynccontextmanager
from typing import Optional

from Core.speed_test import SpeedTester
from db.repository import save_speed_test

tester: Optional[SpeedTester] = None
sessions = {}


def get_tester():
    global tester
    if tester is None:
        raise RuntimeError("SpeedTester not initialized yet")
    return tester


def save_result(session_id, download_data=None, upload_data=None):
    try:
        user_id = random.randint(1, 3)
        isp_id = random.randint(1, 3)

        save_speed_test(
            session_id=session_id,
            user_id=user_id,
            isp_id=isp_id,
            download=download_data.get("download") if download_data else 0,
            ping=download_data.get("ping") if download_data else 0,
            jitter=download_data.get("jitter") if download_data else 0,
            packet_loss=download_data.get("packet_loss") if download_data else 0,
            upload=upload_data.get("upload") if upload_data else 0,
        )
    except Exception as e:
        print(f"Database insertion error: {e}")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    global tester
    print("Initializing SpeedTester...")

    tester = SpeedTester(tests=1)

    for i in range(3):
        try:
            tester.find_server()
            print("Server connection established.")
            break
        except Exception as e:
            print(f"Connection attempt {i + 1} failed: {e}")
            time.sleep(2)

    yield
    print("Shutting down API...")


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/test/download")
def run_download():
    base = get_tester()
    base.downloads = []
    base.pings = []

    session_id = str(uuid.uuid4())
    base.run_download_test()

    results = base.get_download_results()
    quality = base.measure_quality()

    download_data = {
        "download": results["download"] if results else 0,
        "ping": results["ping"] if results else 0,
        "jitter": quality["jitter"],
        "packet_loss": quality["packet_loss"]
    }

    sessions[session_id] = download_data

    return {
        "session_id": session_id,
        **download_data
    }


@app.get("/test/upload")
def run_upload(session_id: str):
    base = get_tester()
    base.uploads = []

    base.run_upload_test()
    results = base.get_upload_results()

    upload_data = {
        "upload": results["upload"] if results else 0
    }

    download_data = sessions.get(session_id)

    save_result(
        session_id=session_id,
        download_data=download_data,
        upload_data=upload_data
    )

    if session_id in sessions:
        del sessions[session_id]

    return {
        "session_id": session_id,
        **upload_data
    }


@app.get("/health")
def health():
    return {"status": "ok"}
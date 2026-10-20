"""Small same-origin enquiry API. Run: uvicorn backend.main:app --host 0.0.0.0 --port 8000"""
import logging
from contextlib import closing
import os
import smtplib
import sqlite3
import ssl
import time
from email.message import EmailMessage
from pathlib import Path
from typing import Literal

from fastapi import BackgroundTasks, FastAPI, HTTPException, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, ConfigDict, EmailStr, Field

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DB_PATH = Path(os.getenv("ENQUIRIES_DB", str(PROJECT_ROOT / "backend" / "enquiries.db"))).resolve()
SERVICES = (
    "EHS Management Consulting",
    "Environment & Sustainability Solutions",
    "ESG Strategy & Implementation",
    "EPR Compliance & Advisory",
    "Training & Capacity Building",
    "Audits | Assessments | Legal Compliance",
)
Service = Literal[
    "EHS Management Consulting", "Environment & Sustainability Solutions",
    "ESG Strategy & Implementation", "EPR Compliance & Advisory",
    "Training & Capacity Building", "Audits | Assessments | Legal Compliance",
]
logger = logging.getLogger("keerthana.enquiries")


class Enquiry(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    name: str = Field(min_length=1, max_length=100)
    company: str = Field(min_length=1, max_length=150)
    phone: str = Field(pattern=r"^[+0-9() .-]{10,20}$", min_length=10, max_length=20)
    email: EmailStr = Field(max_length=254)
    service: Service
    message: str = Field(min_length=1, max_length=3000)
    website: str = ""  # Honeypot: intentionally not length-limited so bots get silent success.


def connect_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DB_PATH, timeout=10)
    connection.execute("PRAGMA busy_timeout=10000")
    return connection


def init_db():
    with closing(connect_db()) as db, db:
        db.execute("""CREATE TABLE IF NOT EXISTS enquiries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at INTEGER NOT NULL,
            name TEXT NOT NULL, company TEXT NOT NULL, phone TEXT NOT NULL,
            email TEXT NOT NULL, service TEXT NOT NULL, message TEXT NOT NULL
        )""")
        db.execute("""CREATE TABLE IF NOT EXISTS rate_attempts (
            id INTEGER PRIMARY KEY AUTOINCREMENT, ip TEXT NOT NULL, created_at INTEGER NOT NULL
        )""")
        db.execute("CREATE INDEX IF NOT EXISTS idx_attempts_ip_time ON rate_attempts(ip, created_at)")


def notify_owner(enquiry: Enquiry):
    settings = {key: os.getenv(key) for key in ("SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD", "NOTIFY_TO")}
    if not all(settings.values()):
        logger.warning("Email notification skipped: SMTP settings incomplete; enquiry remains stored")
        return
    try:
        email = EmailMessage()
        email["From"] = settings["SMTP_USER"]
        email["To"] = settings["NOTIFY_TO"]
        email["Reply-To"] = enquiry.email
        email["Subject"] = "New Keerthana Associates enquiry"
        email.set_content("\n".join((
            f"Name: {enquiry.name}", f"Company: {enquiry.company}",
            f"Phone: {enquiry.phone}", f"Email: {enquiry.email}",
            f"Service: {enquiry.service}", "", "Message:", enquiry.message,
        )))
        with smtplib.SMTP(settings["SMTP_HOST"], int(settings["SMTP_PORT"]), timeout=15) as smtp:
            smtp.starttls(context=ssl.create_default_context())
            smtp.login(settings["SMTP_USER"], settings["SMTP_PASSWORD"])
            smtp.send_message(email)
    except Exception:
        logger.exception("SMTP notification failed; enquiry remains safely stored")


app = FastAPI(title="Keerthana Associates enquiry API", docs_url=None, redoc_url=None, openapi_url=None)
init_db()
# Do not mount PROJECT_ROOT: it contains backend data, secrets and documentation.
app.mount("/assets", StaticFiles(directory=PROJECT_ROOT / "assets"), name="assets")


@app.get("/", include_in_schema=False)
def homepage():
    return FileResponse(PROJECT_ROOT / "index.html")


@app.post("/api/enquiries")
def create_enquiry(enquiry: Enquiry, request: Request, background_tasks: BackgroundTasks):
    if enquiry.website.strip():
        return {"ok": True}  # Deliberately do not store, notify or rate-limit bots.
    ip = request.client.host if request.client else "unknown"
    now = int(time.time())
    try:
        with closing(connect_db()) as db, db:
            # SQLite writer lock makes check + insert atomic across concurrent requests/workers.
            db.execute("BEGIN IMMEDIATE")
            db.execute("DELETE FROM rate_attempts WHERE created_at <= ?", (now - 600,))
            count = db.execute("SELECT COUNT(*) FROM rate_attempts WHERE ip=? AND created_at>?", (ip, now - 600)).fetchone()[0]
            if count >= 5:
                raise HTTPException(status_code=429, detail="Too many enquiries. Please try again later.")
            db.execute("INSERT INTO rate_attempts(ip, created_at) VALUES (?, ?)", (ip, now))
            db.execute("""INSERT INTO enquiries(created_at, name, company, phone, email, service, message)
                VALUES (?, ?, ?, ?, ?, ?, ?)""", (now, enquiry.name, enquiry.company, enquiry.phone,
                                                   str(enquiry.email), enquiry.service, enquiry.message))
    except sqlite3.Error:
        logger.exception("Enquiry could not be stored")
        raise HTTPException(status_code=503, detail="Enquiry could not be saved. Please try again.") from None
    background_tasks.add_task(notify_owner, enquiry)
    return {"ok": True}

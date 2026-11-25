"""Patient Admission Management API (FastAPI + SQLAlchemy).
Uses SQLite locally; set DATABASE_URL to use PostgreSQL in production."""
import os
import re
from datetime import date
from typing import Optional

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from sqlalchemy import Column, Date, Integer, String, create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

load_dotenv()

# ---------- Database setup ----------
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./patients.db")
# Some hosts (Heroku/Render) give "postgres://", SQLAlchemy needs "postgresql://"
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


class Patient(Base):
    """patients table: all 8 required fields."""
    __tablename__ = "patients"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    ward = Column(String, nullable=False)
    department = Column(String, nullable=False)
    doctor = Column(String, nullable=False)
    admission_date = Column(Date, nullable=False)
    status = Column(String, nullable=False, default="Admitted")


Base.metadata.create_all(bind=engine)

# ---------- Allowed dropdown values ----------
GENDERS = ["Male", "Female", "Other"]
WARDS = ["General Ward", "ICU", "Emergency", "Maternity", "Pediatrics", "Surgical"]
DEPARTMENTS = ["Cardiology", "Neurology", "Orthopedics", "General Medicine", "Pediatrics", "Oncology"]
DOCTORS = ["Dr. Aarav Sharma", "Dr. Priya Nair", "Dr. Rohan Kulkarni", "Dr. Sneha Rao", "Dr. Vikram Desai"]
STATUSES = ["Admitted", "Discharged"]


def must_be_one_of(value, allowed, label):
    if value not in allowed:
        raise ValueError(f"{label} must be one of: {', '.join(allowed)}")
    return value


# ---------- Pydantic schemas (validation) ----------
class PatientIn(BaseModel):
    name: str
    age: int
    gender: str
    ward: str
    department: str
    doctor: str
    admission_date: date
    status: str = "Admitted"

    @field_validator("name")
    @classmethod
    def check_name(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("Name is required")
        if not re.fullmatch(r"[A-Za-z\s]+", v):
            raise ValueError("Name can contain only letters and spaces")
        return v

    @field_validator("age")
    @classmethod
    def check_age(cls, v):
        if v < 0 or v > 120:
            raise ValueError("Age must be a whole number between 0 and 120")
        return v

    @field_validator("gender")
    @classmethod
    def check_gender(cls, v):
        return must_be_one_of(v, GENDERS, "Gender")

    @field_validator("ward")
    @classmethod
    def check_ward(cls, v):
        return must_be_one_of(v, WARDS, "Ward")

    @field_validator("department")
    @classmethod
    def check_department(cls, v):
        return must_be_one_of(v, DEPARTMENTS, "Department")

    @field_validator("doctor")
    @classmethod
    def check_doctor(cls, v):
        return must_be_one_of(v, DOCTORS, "Doctor")

    @field_validator("admission_date")
    @classmethod
    def check_date(cls, v):
        if v > date.today():
            raise ValueError("Admission date cannot be in the future")
        return v

    @field_validator("status")
    @classmethod
    def check_status(cls, v):
        return must_be_one_of(v, STATUSES, "Status")


class PatientOut(PatientIn):
    id: int
    model_config = {"from_attributes": True}


# ---------- App ----------
app = FastAPI(title="Patient Admission Management API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten to your frontend URL in production
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    """Return HTTP 400 with one readable `detail` string instead of FastAPI's default 422 list."""
    messages = []
    for err in exc.errors():
        msg = err.get("msg", "Invalid input")
        if err.get("type") == "value_error":
            # Our own validators already write a full sentence ("Name is required")
            messages.append(msg.replace("Value error, ", ""))
        else:
            # Built-in errors (missing field, wrong type): prefix with the field name
            field = str(err["loc"][-1]).replace("_", " ").capitalize() if err.get("loc") else "Input"
            messages.append(f"{field}: {msg}")
    return JSONResponse(status_code=400, content={"detail": ". ".join(messages)})


@app.get("/")
def health_check():
    return {"status": "ok"}


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_or_404(db: Session, patient_id: int) -> Patient:
    patient = db.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@app.get("/patients", response_model=list[PatientOut])
def list_patients(db: Session = Depends(get_db)):
    return db.query(Patient).order_by(Patient.id.desc()).all()


@app.post("/patients", response_model=PatientOut, status_code=201)
def create_patient(data: PatientIn, db: Session = Depends(get_db)):
    patient = Patient(**data.model_dump())
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


@app.put("/patients/{patient_id}", response_model=PatientOut)
def update_patient(patient_id: int, data: PatientIn, db: Session = Depends(get_db)):
    patient = get_or_404(db, patient_id)
    for key, value in data.model_dump().items():
        setattr(patient, key, value)
    db.commit()
    db.refresh(patient)
    return patient


@app.patch("/patients/{patient_id}/discharge", response_model=PatientOut)
def discharge_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = get_or_404(db, patient_id)
    patient.status = "Discharged"
    db.commit()
    db.refresh(patient)
    return patient


@app.delete("/patients/{patient_id}")
def delete_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = get_or_404(db, patient_id)
    db.delete(patient)
    db.commit()
    return {"message": "Patient deleted"}

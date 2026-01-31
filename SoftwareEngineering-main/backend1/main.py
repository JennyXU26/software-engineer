from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime
import hashlib
import uuid

from ledger_client import (
    create_prescription as ledger_create,
    verify_prescription as ledger_verify,
    dispense_prescription as ledger_dispense
)

app = FastAPI(title="Prescription Backend (Backend1)")

# =========================
# 数据模型
# =========================

class CreatePrescriptionRequest(BaseModel):
    payload: str

class Prescription(BaseModel):
    id: str
    payload: str
    hash: str
    status: str
    createdAt: datetime


# =========================
# 内存数据库（Demo 用）
# =========================

db: dict[str, Prescription] = {}


# =========================
# Health Check
# =========================

@app.get("/ping")
def ping():
    return {"msg": "ok"}


# =========================
# Create Prescription
# =========================

@app.post("/prescriptions/create")
def create_prescription(req: CreatePrescriptionRequest):
    prescription_id = str(uuid.uuid4())
    payload_hash = hashlib.sha256(req.payload.encode()).hexdigest()

    # 1️⃣ 先写链（链是权威）
    try:
        ledger_create(prescription_id, payload_hash)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ledger create failed: {e}")

    # 2️⃣ 再写本地状态
    prescription = Prescription(
        id=prescription_id,
        payload=req.payload,
        hash=payload_hash,
        status="CREATED",
        createdAt=datetime.now()
    )

    db[prescription_id] = prescription

    return {
        "id": prescription_id,
        "hash": payload_hash,
        "status": "CREATED"
    }


# =========================
# Verify Prescription
# =========================

@app.post("/prescriptions/verify")
def verify_prescription(prescription_id: str):
    if prescription_id not in db:
        raise HTTPException(status_code=404, detail="Prescription not found")

    prescription = db[prescription_id]

    if prescription.status != "CREATED":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot verify prescription in status {prescription.status}"
        )

    # 1️⃣ 写链
    try:
        ledger_verify(prescription_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Ledger verify failed: {e}")

    # 2️⃣ 更新本地状态
    prescription.status = "VERIFIED"

    return {
        "id": prescription_id,
        "status": "VERIFIED"
    }


# =========================
# Dispense Prescription
# =========================

@app.post("/prescriptions/dispense")
def dispense_prescription(prescription_id: str):
    if prescription_id not in db:
        raise HTTPException(status_code=404, detail="Prescription not found")

    prescription = db[prescription_id]

    if prescription.status != "VERIFIED":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot dispense prescription in status {prescription.status}"
        )

    # 1️⃣ 写链（防重放最终由链兜底）
    try:
        ledger_dispense(prescription_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Ledger dispense failed: {e}")

    # 2️⃣ 更新本地状态
    prescription.status = "DISPENSED"

    return {
        "id": prescription_id,
        "status": "DISPENSED"
    }


# =========================
# Get Prescription
# =========================

@app.get("/prescriptions/{prescription_id}")
def get_prescription(prescription_id: str):
    if prescription_id not in db:
        raise HTTPException(status_code=404, detail="Prescription not found")
    return db[prescription_id]

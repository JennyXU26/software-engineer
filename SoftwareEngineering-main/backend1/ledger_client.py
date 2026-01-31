import requests

LEDGER_BASE = "http://localhost:4000"

def create_prescription(prescription_id, hash):
    r = requests.post(
        f"{LEDGER_BASE}/create",  # 去掉 /ledger
        json={
            "prescriptionId": prescription_id,
            "hash": hash
        }
    )
    if r.status_code != 200:
        raise Exception("Ledger create failed")
    return r.json()

def verify_prescription(prescription_id):
    r = requests.post(
        f"{LEDGER_BASE}/verify",  # 去掉 /ledger
        json={"prescriptionId": prescription_id}
    )
    if r.status_code != 200:
        raise Exception("Ledger verify failed")
    return r.json()

def dispense_prescription(prescription_id):
    r = requests.post(
        f"{LEDGER_BASE}/dispense",  # 去掉 /ledger
        json={"prescriptionId": prescription_id}
    )
    if r.status_code != 200:
        raise Exception("Ledger dispense failed")
    return r.json()

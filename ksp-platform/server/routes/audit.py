import csv
import os
from fastapi import APIRouter, Depends, HTTPException, status
from auth.dependencies import get_current_user

router = APIRouter()

AUDIT_LOG_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "audit_log.csv")

@router.get("/logs")
def get_audit_logs(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )

    if not os.path.exists(AUDIT_LOG_PATH):
        return {"logs": []}

    with open(AUDIT_LOG_PATH, newline="", encoding="utf-8") as csvfile:
        reader = csv.DictReader(csvfile)
        rows = list(reader)

    logs = rows[-100:]
    logs.reverse()
    return {"logs": logs}

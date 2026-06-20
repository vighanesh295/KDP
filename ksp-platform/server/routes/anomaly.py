from fastapi import APIRouter, Depends
from ai.anomaly_detector import detect_anomalies
from auth.dependencies import get_current_user

router = APIRouter()

@router.get("/")
def get_anomalies(current_user: dict = Depends(get_current_user)):
    alerts = detect_anomalies()
    return {
        "alerts": alerts
    }

from fastapi import APIRouter
from ai.anomaly_detector import detect_anomalies

router = APIRouter()

@router.get("/")
def get_anomalies():
    alerts = detect_anomalies()
    return {
        "alerts": alerts
    }

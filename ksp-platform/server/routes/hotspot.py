from fastapi import APIRouter, Depends
from ai.predictor import predict_hotspots
from auth.dependencies import get_current_user

router = APIRouter()

@router.get("/")
def get_hotspots(current_user: dict = Depends(get_current_user)):
    predictions = predict_hotspots()
    return {
        "predictions": predictions
    }

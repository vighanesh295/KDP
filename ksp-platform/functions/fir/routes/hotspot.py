from fastapi import APIRouter
from ai.predictor import predict_hotspots

router = APIRouter()

@router.get("/")
def get_hotspots():
    predictions = predict_hotspots()
    return {
        "predictions": predictions
    }

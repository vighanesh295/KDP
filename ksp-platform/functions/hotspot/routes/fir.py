from fastapi import APIRouter
from pydantic import BaseModel
from ai.classifier import classify_fir as ai_classify_fir

router = APIRouter()

class ClassifyRequest(BaseModel):
    text: str

@router.post("/classify")
def classify_fir(request: ClassifyRequest):
    result = ai_classify_fir(request.text)
    return result

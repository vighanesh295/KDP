from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from ai.classifier import classify_fir as ai_classify_fir
from auth.dependencies import get_current_user
from data.audit_log import log_query

router = APIRouter()

class ClassifyRequest(BaseModel):
    text: str

@router.post("/classify")
def classify_fir(request: ClassifyRequest, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ["officer", "commander", "admin"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    result = ai_classify_fir(request.text)
    summary = f"crime_type={result.get('crime_type', 'unknown')}, ipc_section={result.get('ipc_section', 'unknown')}"
    log_query(
        current_user,
        "/fir/classify",
        request.text,
        summary,
        datetime.utcnow().isoformat(),
    )
    return result

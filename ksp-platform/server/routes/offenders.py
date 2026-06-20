from fastapi import APIRouter
from data.loader import get_repeat_offenders

router = APIRouter()

@router.get("/repeat")
def get_repeat_offenders_route():
    offenders = get_repeat_offenders()
    return offenders[:50]

from fastapi import APIRouter
from data.loader import (
    get_total_counts,
    get_monthly_trend,
    get_crime_breakdown,
    get_district_counts,
    get_crime_details,
    get_socioeconomic_correlation,
    get_socioeconomic_feature_data
)

router = APIRouter()

@router.get("/")
def get_analytics():
    counts = get_total_counts()
    
    # Format district counts to match the expected 'name' key from previous mock data
    districts = get_district_counts()
    districts_formatted = [
        {"name": d["district"], "count": d["count"], "lat": d["lat"], "lng": d["lng"]} 
        for d in districts
    ]
    
    return {
        "total_firs": counts.get("total_firs", 0),
        "open_cases": counts.get("open_cases", 0),
        "solved_cases": counts.get("solved_cases", 0),
        "districts": districts_formatted,
        "monthly_trend": get_monthly_trend(),
        "crime_breakdown": get_crime_breakdown(),
        "correlations": get_socioeconomic_correlation(),
        "socioeconomic_data": get_socioeconomic_feature_data()
    }

@router.get("/crime/{crime_type}")
def get_crime_category(crime_type: str):
    normalized_crime = crime_type.replace("-", " ")
    return get_crime_details(normalized_crime)

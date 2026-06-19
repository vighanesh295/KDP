import logging
import json
from flask import Request, make_response, jsonify
from data.loader import get_total_counts, get_monthly_trend, get_crime_breakdown, get_district_counts

def handler(request: Request):
    if request.method == "OPTIONS":
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "*")
        response.headers.add("Access-Control-Allow-Methods", "*")
        return response

    if request.path == "/":
        counts = get_total_counts()
        districts = get_district_counts()
        districts_formatted = [
            {"name": d["district"], "count": d["count"], "lat": d["lat"], "lng": d["lng"]} 
            for d in districts
        ]
        
        response_data = {
            "total_firs": counts.get("total_firs", 0),
            "open_cases": counts.get("open_cases", 0),
            "solved_cases": counts.get("solved_cases", 0),
            "districts": districts_formatted,
            "monthly_trend": get_monthly_trend(),
            "crime_breakdown": get_crime_breakdown()
        }
        
        response = make_response(jsonify(response_data), 200)
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response
        
    response = make_response('Unknown path', 404)
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response

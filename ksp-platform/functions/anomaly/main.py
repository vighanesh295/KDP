import logging
from flask import Request, make_response, jsonify
from ai.anomaly_detector import detect_anomalies

def handler(request: Request):
    if request.method == "OPTIONS":
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "*")
        response.headers.add("Access-Control-Allow-Methods", "*")
        return response

    if request.path == "/":
        alerts = detect_anomalies()
        response = make_response(jsonify({"alerts": alerts}), 200)
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response
        
    response = make_response('Unknown path', 404)
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response

import logging
import json
from flask import Request, make_response, jsonify
from ai.classifier import classify_fir as ai_classify_fir

def handler(request: Request):
    if request.method == "OPTIONS":
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "*")
        response.headers.add("Access-Control-Allow-Methods", "*")
        return response

    if request.method == "POST" and request.path == "/classify":
        try:
            req_data = request.get_json(silent=True) or {}
            text = req_data.get("text", "")
            
            result = ai_classify_fir(text)
            
            response = make_response(jsonify(result), 200)
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response
        except Exception as e:
            response = make_response(jsonify({"error": str(e)}), 500)
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response
            
    response = make_response('Unknown path', 404)
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response

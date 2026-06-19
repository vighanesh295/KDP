import logging
import json
import asyncio
from flask import Request, make_response, jsonify
from ai.gemini import ask_gemini

def handler(request: Request):
    if request.method == "OPTIONS":
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "*")
        response.headers.add("Access-Control-Allow-Methods", "*")
        return response

    if request.method == "POST" and request.path == "/":
        try:
            req_data = request.get_json(silent=True) or {}
            query = req_data.get("query", "")
            
            response_text = asyncio.run(ask_gemini(query))
            
            response = make_response(jsonify({
                "response": response_text,
                "source": "gemini"
            }), 200)
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response
        except Exception as e:
            response = make_response(jsonify({"error": "Failed to process AI request", "details": str(e)}), 500)
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response
            
    response = make_response('Unknown path', 404)
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response

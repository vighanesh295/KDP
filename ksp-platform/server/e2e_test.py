import threading
import time
import requests
import uvicorn
from main import app

def run_server():
    uvicorn.run(app, host="127.0.0.1", port=8000)

def main():
    print("Starting server in background thread...")
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    
    print("Waiting 15 seconds for server to start...")
    time.sleep(15)
    
    print("Sending POST request to /chat/")
    try:
        response = requests.post(
            "http://127.0.0.1:8000/chat/", 
            json={"query": "What IPC section applies to online fraud?"},
            timeout=30
        )
        print("Response Code:", response.status_code)
        print("Response JSON:", response.json())
    except Exception as e:
        print("Error during request:", e)

if __name__ == "__main__":
    main()

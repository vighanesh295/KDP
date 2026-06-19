import subprocess
import sys
import os

if __name__ == '__main__':
    print("Starting backend and frontend servers...")
    backend = subprocess.Popen([r".venv\Scripts\uvicorn", "main:app", "--reload"], cwd="server", shell=True)
    frontend = subprocess.Popen(["npm", "run", "dev"], cwd="client", shell=True)
    
    try:
        backend.wait()
        frontend.wait()
    except KeyboardInterrupt:
        backend.terminate()
        frontend.terminate()

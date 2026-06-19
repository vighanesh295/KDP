from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="KSP Intelligence Platform")

# Configure CORS (allow all origins for now)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routers
from routes import chat, analytics, fir, hotspot, anomaly

# Register routers
app.include_router(chat.router, prefix="/chat", tags=["Chat"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
app.include_router(fir.router, prefix="/fir", tags=["FIR"])
app.include_router(hotspot.router, prefix="/hotspot", tags=["Hotspots"])
app.include_router(anomaly.router, prefix="/anomaly", tags=["Anomaly Detection"])

@app.get("/")
def read_root():
    return {"status": "KSP Intelligence Platform running"}

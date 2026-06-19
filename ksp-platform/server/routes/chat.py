from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from ai.gemini import ask_gemini

router = APIRouter()

class ChatRequest(BaseModel):
    query: str

@router.post("/")
async def chat_endpoint(request: ChatRequest):
    try:
        response_text = await ask_gemini(request.query)
        return {
            "response": response_text,
            "source": "gemini"
        }
    except Exception as e:
        print(f"Chat error: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to process AI request: {str(e)}"}
        )

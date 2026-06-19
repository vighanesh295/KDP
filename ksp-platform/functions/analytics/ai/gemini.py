import os
import google.generativeai as genai
from dotenv import load_dotenv

# Ensure environment variables are loaded
load_dotenv()

API_KEY = os.environ.get("GEMINI_API_KEY")
print("API KEY LOADED:", bool(API_KEY))
if API_KEY:
    genai.configure(api_key=API_KEY)

SYSTEM_CONTEXT = """You are KSP Intelligence Assistant, an AI for Karnataka State Police officers. 
Respond concisely (2-4 sentences) with a highly operational, police-oriented tone. 
When asked about online fraud, always explicitly cite 66C IT Act, 66D IT Act, and 420 IPC. 
Focus strictly on crime data, IPC sections, and practical investigation guidance."""

async def ask_gemini(prompt: str) -> str:
    if not API_KEY:
        raise Exception("GEMINI_API_KEY is missing from environment variables.")
        
    try:
        # Initialise the generative model
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Combine system context and user prompt
        full_prompt = f"{SYSTEM_CONTEXT}\n\nUser Question:\n{prompt}"
        
        # Call the Gemini API asynchronously
        response = await model.generate_content_async(full_prompt)
        
        if not response.text:
            raise Exception("Gemini returned an empty response.")
            
        return response.text
        
    except Exception as e:
        raise Exception(f"Failed to get response from Gemini API: {str(e)}")

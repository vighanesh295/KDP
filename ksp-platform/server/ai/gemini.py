import os
try:
    import importlib
    genai = importlib.import_module("google.generativeai")
except Exception:
    # Lightweight shim for environments without the package (linting/runtime).
    class _GenAIShim:
        def configure(self, *args, **kwargs):
            raise RuntimeError(
                "google.generativeai is not installed. Install the official package to use Gemini integration."
            )

        class GenerativeModel:
            def __init__(self, *args, **kwargs):
                raise RuntimeError(
                    "google.generativeai is not installed. Install the official package to use Gemini integration."
                )

    genai = _GenAIShim()

# Attempt to import load_dotenv from python-dotenv. If the package is not
# available in the environment (linter or runtime), provide a lightweight
# fallback that loads simple KEY=VALUE pairs from a .env file.
try:
    from dotenv import load_dotenv  # type: ignore
except Exception:
    def load_dotenv(path: str = ".env"):
        try:
            with open(path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#"):
                        continue
                    if "=" in line:
                        key, val = line.split("=", 1)
                        key = key.strip()
                        val = val.strip().strip('"').strip("'")
                        os.environ.setdefault(key, val)
        except FileNotFoundError:
            # No .env file present; silently continue
            pass

# Load environment variables
load_dotenv()

# Read API key
API_KEY = os.getenv("GEMINI_API_KEY")

print("API KEY LOADED:", bool(API_KEY))

if API_KEY:
    genai.configure(api_key=API_KEY)

SYSTEM_CONTEXT = """
You are KSP Intelligence Assistant for Karnataka State Police.

Rules:
- Respond in a concise operational police tone.
- Keep answers between 2 and 4 sentences.
- Focus on crime investigation, IPC sections, cybercrime, and law enforcement guidance.
- When discussing online fraud, explicitly mention:
  • Section 66C IT Act
  • Section 66D IT Act
  • Section 420 IPC
- Provide practical investigation recommendations where relevant.
"""

async def ask_gemini(prompt: str) -> str:
    """
    Send a prompt to Gemini and return the response.
    """

    if not API_KEY:
        raise Exception("GEMINI_API_KEY is missing from environment variables.")

    try:
        # Gemini model
        model = genai.GenerativeModel("gemini-2.5-flash")

        # Combine system context with user prompt
        full_prompt = f"{SYSTEM_CONTEXT}\n\nUser Question:\n{prompt}"

        # Generate response
        response = await model.generate_content_async(full_prompt)

        # Validate response
        if not hasattr(response, "text") or not response.text:
            raise Exception("Gemini returned an empty response.")

        return response.text.strip()

    except Exception as e:
        raise Exception(f"Failed to get response from Gemini API: {str(e)}")
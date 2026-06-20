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

async def ask_gemini(prompt: str, language: str = "en") -> dict:
    """
    Send a prompt to Gemini and return a structured response dict:
    { answer: str, reasoning: str }
    """

    if not API_KEY:
        raise Exception("GEMINI_API_KEY is missing from environment variables.")

    try:
        # Gemini model
        model = genai.GenerativeModel("gemini-2.5-flash")

        # If Kannada is requested, prepend special instruction to ensure Kannada response
        language_instruction = ""
        if language and language.lower() == "kn":
            language_instruction = (
                "The officer is asking in Kannada or wants a Kannada response."
                " Detect the input language. Respond in Kannada (ಕನ್ನಡ) using Kannada script."
                " If the question is in English but language is set to Kannada, still respond in Kannada."
            )

        # Ask for a structured response: short answer then a REASONING: line
        # ENFORCE reasoning to always be included, even for simple queries
        structured_instruction = (
            "Answer the officer's question in 2-4 sentences. "
            "ALWAYS end with a new line starting with 'REASONING:' followed by an explanation of your answer. "
            "If you based your answer on specific data (e.g., case counts, districts, crime types), mention it. "
            "If you provided general police knowledge or a greeting, write: "
            "'REASONING: General conversational response based on police operational knowledge.' "
            "Do NOT skip the REASONING section under any circumstances."
        )

        # Combine language instruction (if any), system context, instruction, and user prompt
        segments = [language_instruction, SYSTEM_CONTEXT, structured_instruction]
        full_prompt = "\n\n".join([s for s in segments if s]) + f"\n\nUser Question:\n{prompt}"

        # Generate response
        response = await model.generate_content_async(full_prompt)

        # Extract text
        text = None
        if hasattr(response, "text") and response.text:
            text = response.text
        elif hasattr(response, "result") and getattr(response.result, "candidates", None):
            # Some SDK versions present candidates
            text = response.result.candidates[0].get("content", {}).get("text")

        if not text:
            raise Exception("Gemini returned an empty response.")

        text = text.strip()

        # LOG RAW RESPONSE FOR DEBUGGING
        print(f"\n[GEMINI RAW RESPONSE]\n{text}\n[END RAW RESPONSE]\n")

        # Parse structured response. Look for 'REASONING:' (case-insensitive)
        import re
        parts = re.split(r"REASONING:\s*", text, flags=re.IGNORECASE, maxsplit=1)
        if len(parts) == 2:
            answer = parts[0].strip()
            reasoning = parts[1].strip()
        else:
            # Fallback: no explicit reasoning section found; provide a default
            answer = text
            reasoning = "REASONING: Response generated without explicit data reference."
            print(f"[WARNING] No REASONING section found in response; using default fallback.")

        return {"answer": answer, "reasoning": reasoning}

    except Exception as e:
        raise Exception(f"Failed to get response from Gemini API: {str(e)}")
import asyncio
from ai.gemini import ask_gemini

async def main():
    try:
        res = await ask_gemini("What IPC section applies to online fraud?")
        print("--- GEMINI RESPONSE ---")
        print(res)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())

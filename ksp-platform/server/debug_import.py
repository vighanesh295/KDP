import sys
print("starting import test", flush=True)
try:
    import os
    print("imported os", flush=True)
    from dotenv import load_dotenv
    print("imported dotenv", flush=True)
    import google.generativeai as genai
    print("imported genai", flush=True)
    print("all done", flush=True)
except Exception as e:
    print("Error:", e, flush=True)

import os, sys
sys.path.insert(0, ".")
from app.config import get_settings
settings = get_settings()
key = settings.GOOGLE_API_KEY
api_key = key.get_secret_value() if hasattr(key, "get_secret_value") else str(key)
os.environ["GOOGLE_API_KEY"] = api_key

import google.generativeai as genai
genai.configure(api_key=api_key)

candidates = [
    "gemini-3.1-flash-lite",
    "gemini-3.1-flash-lite-preview",
    "gemini-3-flash-preview",
    "gemini-3.1-pro-preview",
    "gemini-flash-latest",
    "gemini-flash-lite-latest",
    "gemini-pro-latest",
]

for model_id in candidates:
    try:
        m = genai.GenerativeModel(model_id)
        resp = m.generate_content("Say hello in one word.")
        print(f"OK  {model_id}: {resp.text.strip()[:40]}")
    except Exception as e:
        first_line = str(e).split('\n')[0]
        print(f"ERR {model_id}: {first_line}")

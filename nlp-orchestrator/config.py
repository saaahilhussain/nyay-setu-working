"""
Configuration module — loads environment variables from .env

All API keys and secrets MUST be provided via environment variables or a .env file.
Never hardcode secrets in source code — use .env.example as a template.
"""

import os
import sys
from dotenv import load_dotenv

load_dotenv()

# API Keys — loaded from environment variables only
GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
GEMINI_API_KEY: str = os.getenv("GOOGLE_GEMINI_API_KEY", "")

# Model names
GROQ_MODEL_FAST: str = "llama-3.3-70b-versatile"   # Current recommended model
GEMINI_MODEL: str = "gemini-1.5-flash"             # Fast + deep reasoning
TROCR_MODEL_NAME: str = os.getenv("TROCR_MODEL_NAME", "Piyush3142/trocr-sanskrit-ocr")
TROCR_DEVICE: str = os.getenv("TROCR_DEVICE", "")
HF_TOKEN: str = os.getenv("HF_TOKEN", "")

# Indian Kanoon API
INDIAN_KANOON_TOKEN: str = os.getenv("INDIAN_KANOON_TOKEN", "")
INDIAN_KANOON_API_URL: str = os.getenv("INDIAN_KANOON_API_URL", "https://api.indiankanoon.org")

# CORS
FRONTEND_ORIGIN: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

# Validate required keys
if not GROQ_API_KEY:
    print("[Config] ERROR: GROQ_API_KEY is not set. Please add it to .env (see .env.example)", file=sys.stderr)
    sys.exit(1)
if not GEMINI_API_KEY:
    print("[Config] WARNING: GOOGLE_GEMINI_API_KEY not set. Gemini calls will fall back to Groq.")

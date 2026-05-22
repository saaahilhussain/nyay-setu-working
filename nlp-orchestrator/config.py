"""
Configuration module — loads environment variables from .env

Merged: viru's OCR/cache settings + RAG retrieval settings from this PR.
All new variables have safe defaults; existing .env files keep working unchanged.
"""

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

# ─── API keys ─────────────────────────────────────────────────────────────────
GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
GEMINI_API_KEY: str = os.getenv("GOOGLE_GEMINI_API_KEY", "")

# ─── Model names ──────────────────────────────────────────────────────────────
GROQ_MODEL_FAST: str = "llama-3.3-70b-versatile"
GEMINI_MODEL: str = "gemini-1.5-flash"

# ─── OCR (viru's additions) ───────────────────────────────────────────────────
TROCR_MODEL_NAME: str = os.getenv("TROCR_MODEL_NAME", "Piyush3142/trocr-sanskrit-ocr")
TROCR_DEVICE: str = os.getenv("TROCR_DEVICE", "")
HF_TOKEN: str = os.getenv("HF_TOKEN", "")

# ─── Indian Kanoon API ────────────────────────────────────────────────────────
INDIAN_KANOON_TOKEN: str = os.getenv("INDIAN_KANOON_TOKEN", "")
INDIAN_KANOON_API_URL: str = os.getenv(
    "INDIAN_KANOON_API_URL", "https://api.indiankanoon.org"
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
FRONTEND_ORIGIN: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

# ─── Retrieval / RAG settings (new in this PR) ────────────────────────────────
EMBEDDING_MODEL: str = os.getenv(
    "EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2"
)
RERANKER_MODEL: str = os.getenv("RERANKER_MODEL", "BAAI/bge-reranker-base")
CHROMA_PATH: str = os.getenv(
    "CHROMA_PATH", str(Path(__file__).parent / "data" / "chroma")
)
RETRIEVAL_FETCH_K: int = int(os.getenv("RETRIEVAL_FETCH_K", "20"))
RETRIEVAL_TOP_K: int = int(os.getenv("RETRIEVAL_TOP_K", "5"))


def _bool(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


RETRIEVAL_ENABLED: bool = _bool("RETRIEVAL_ENABLED", True)
RERANKER_ENABLED: bool = _bool("RERANKER_ENABLED", True)
GROUND_RESEARCH: bool = _bool("GROUND_RESEARCH", True)

# ─── Validate ─────────────────────────────────────────────────────────────────
if not GROQ_API_KEY:
    raise EnvironmentError("GROQ_API_KEY is not set. Please add it to .env")
if not GEMINI_API_KEY:
    print("[Config] WARNING: GOOGLE_GEMINI_API_KEY not set. Gemini calls will fall back to Groq.")
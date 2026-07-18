import logging
import os
from pathlib import Path
from dotenv import load_dotenv

# Always resolve .env relative to this config file (backend/.env)
# so it is found regardless of the CWD used to launch Uvicorn.
_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=_env_path)

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./stadiumos.db")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
FIREBASE_CREDENTIALS_PATH = os.getenv("FIREBASE_CREDENTIALS_PATH", "")
FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "")

# Fallback mode indicator
USE_SIMULATOR = not GEMINI_API_KEY or GEMINI_API_KEY == "YOUR_GEMINI_API_KEY_HERE"

HOST = os.getenv("HOST", "127.0.0.1")
PORT = int(os.getenv("PORT", "8000"))

# Log a startup warning if credentials are missing
if USE_SIMULATOR:
    _logger = logging.getLogger("stadiumos.config")
    _logger.warning(
        "GEMINI_API_KEY is absent or set to placeholder — all agents will run in "
        "simulator (fallback) mode. Set GEMINI_API_KEY in backend/.env for live GenAI."
    )

# FIFA World Cup 2026 Stadium Metadata
STADIUM_NAME = "Azteca / MetLife Stadium (StadiumOS Hub)"

# Supported Languages for quick-help translation
SUPPORTED_LANGUAGES = {
    "Spanish": "es",
    "French": "fr",
    "German": "de",
    "Portuguese": "pt",
    "Japanese": "ja",
    "Arabic": "ar",
    "Italian": "it",
    "Mandarin": "zh"
}

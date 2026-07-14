import os
from dotenv import load_dotenv

load_dotenv()

def _require_env(name):
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value

class Config:
    SECRET_KEY = _require_env("SECRET_KEY")
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "postgresql://localhost/devtracker")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = _require_env("JWT_SECRET_KEY")

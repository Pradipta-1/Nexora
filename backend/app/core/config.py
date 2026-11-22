import os
from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Nexora"
    PROJECT_TAGLINE: str = "Discover Beyond the Obvious"
    API_V1_STR: str = "/api"
    
    # Base directories
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    REPORTS_DIR: Path = BASE_DIR / "reports"
    SAMPLE_DATA_DIR: Path = BASE_DIR / "sample_data"
    
    # Database
    DATABASE_URL: str = f"sqlite:///{BASE_DIR}/nexora.db"
    
    # File limits
    MAX_UPLOAD_SIZE_MB: int = 50
    ALLOWED_EXTENSIONS: list[str] = [".csv", ".xlsx", ".xls"]
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000"
    ]

    class Config:
        case_sensitive = True

settings = Settings()

# Ensure directories exist
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
settings.REPORTS_DIR.mkdir(parents=True, exist_ok=True)
settings.SAMPLE_DATA_DIR.mkdir(parents=True, exist_ok=True)

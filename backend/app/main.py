from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db
from app.api.router import api_router

# Initialize database schema
init_db()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Powered Hidden Pattern Discovery Platform API",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "tagline": settings.PROJECT_TAGLINE
    }

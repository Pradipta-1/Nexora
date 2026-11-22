from fastapi import APIRouter
from app.api.endpoints import datasets, analysis, reports

api_router = APIRouter()
api_router.include_router(datasets.router)
api_router.include_router(analysis.router)
api_router.include_router(reports.router)

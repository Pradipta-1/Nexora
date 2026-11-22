@echo off
echo Starting Nexora FastAPI Backend Server...
cd /d "%~dp0backend"
set PYTHONPATH=.
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause

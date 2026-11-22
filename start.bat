@echo off
echo ===================================================
echo   NEXORA - Discover Beyond the Obvious
echo   AI-Powered Hidden Pattern Discovery Platform
echo ===================================================
echo Starting Backend API and Frontend Dev Server...

start "Nexora Backend API" cmd /k "run_backend.bat"
start "Nexora Frontend UI" cmd /k "run_frontend.bat"

echo.
echo Both servers are launching:
echo   - Backend API: http://127.0.0.1:8000 (Docs: http://127.0.0.1:8000/docs)
echo   - Frontend UI:  http://localhost:5173
echo.
pause

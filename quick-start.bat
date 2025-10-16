@echo off
echo ========================================
echo BGE ELECTRIQUE Chatbot - Quick Start
echo ========================================
echo.
echo This will:
echo 1. Setup and start the backend server
echo 2. Open the chatbot in your browser
echo.

echo Starting backend server...
start "BGE Backend" cmd /k "start-backend.bat"

echo Waiting for server to start...
timeout /t 3 /nobreak >nul

echo Opening chatbot in browser...
start http://localhost:8000/index.html

echo.
echo Starting local web server...
echo Frontend will run at: http://localhost:8000
echo.
echo Press Ctrl+C to stop the web server
echo.

python -m http.server 8000

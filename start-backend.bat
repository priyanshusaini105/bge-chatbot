@echo off
echo ========================================
echo Starting BGE ELECTRIQUE Backend Server
echo ========================================
echo.

cd backend

echo Checking .env configuration...
if not exist .env (
    echo ERROR: .env file not found!
    echo Please run setup-backend.bat first
    pause
    exit /b 1
)

findstr /C:"your_gemini_api_key_here" .env >nul
if not errorlevel 1 (
    echo ERROR: GEMINI_API_KEY not configured!
    echo Please edit backend\.env and add your API key
    echo Get your API key from: https://makersuite.google.com/app/apikey
    start notepad .env
    pause
    exit /b 1
)

echo Starting server...
echo Server will run at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

call npm start

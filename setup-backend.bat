@echo off
echo ========================================
echo BGE ELECTRIQUE Chatbot Backend Setup
echo ========================================
echo.

cd backend

echo [1/3] Checking if Node.js is installed...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js is installed: 
node --version
echo.

echo [2/3] Installing dependencies...
if not exist node_modules (
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
    echo Dependencies installed successfully!
) else (
    echo Dependencies already installed.
)
echo.

echo [3/3] Checking .env file...
if not exist .env (
    echo WARNING: .env file not found!
    echo Creating .env from .env.example...
    copy .env.example .env >nul
    echo.
    echo IMPORTANT: Please edit backend\.env and add your GEMINI_API_KEY!
    echo Get your API key from: https://makersuite.google.com/app/apikey
    echo.
    echo Opening .env file...
    start notepad .env
    echo.
    echo After adding your API key, run: start-backend.bat
    pause
    exit /b 0
)
echo .env file found.
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Starting the backend server...
echo Server will run at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

call npm start

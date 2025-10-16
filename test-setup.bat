@echo off
echo ========================================
echo BGE ELECTRIQUE Chatbot - System Test
echo ========================================
echo.

echo [1/5] Testing Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo [FAIL] Node.js is not installed
    echo       Download from: https://nodejs.org/
    set /a errors+=1
) else (
    echo [PASS] Node.js installed: 
    node --version
)
echo.

echo [2/5] Testing Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo [WARN] Python not found - optional for frontend server
    echo       You can use npx http-server instead
) else (
    echo [PASS] Python installed:
    python --version
)
echo.

echo [3/5] Checking backend setup...
if not exist backend\node_modules (
    echo [FAIL] Backend dependencies not installed
    echo       Run: setup-backend.bat
    set /a errors+=1
) else (
    echo [PASS] Backend dependencies installed
)
echo.

echo [4/5] Checking .env configuration...
if not exist backend\.env (
    echo [FAIL] .env file not found
    echo       Run: setup-backend.bat
    set /a errors+=1
) else (
    findstr /C:"your_gemini_api_key_here" backend\.env >nul
    if not errorlevel 1 (
        echo [FAIL] GEMINI_API_KEY not configured
        echo       Edit backend\.env and add your API key
        echo       Get key from: https://makersuite.google.com/app/apikey
        set /a errors+=1
    ) else (
        echo [PASS] GEMINI_API_KEY configured
    )
)
echo.

echo [5/5] Testing backend connectivity...
echo       Starting backend server for test...
cd backend
start /B cmd /c "npm start >nul 2>&1"
timeout /t 5 /nobreak >nul

curl -s http://localhost:3000/api/health >nul 2>&1
if errorlevel 1 (
    echo [FAIL] Cannot connect to backend
    echo       Make sure port 3000 is available
    set /a errors+=1
) else (
    echo [PASS] Backend is responding
)

taskkill /F /FI "WINDOWTITLE eq BGE Backend*" >nul 2>&1
cd ..
echo.

echo ========================================
echo Test Summary
echo ========================================
if defined errors (
    echo Some tests failed. Please fix the issues above.
    echo Then run this test again.
) else (
    echo All tests passed! Your setup is ready.
    echo.
    echo Next steps:
    echo 1. Run quick-start.bat to start the application
    echo 2. Click "UPLOAD PDF" to add your document
    echo 3. Start chatting!
)
echo.
pause

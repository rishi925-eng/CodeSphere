@echo off
echo ====================================
echo   CodeSphere - Starting Application
echo ====================================
echo.

REM Check if MongoDB is running
echo [1/4] Checking MongoDB...
netstat -ano | findstr :27017 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ MongoDB is running
) else (
    echo ✗ MongoDB is not running!
    echo Please start MongoDB before running this script
    echo Run: net start MongoDB
    pause
    exit /b 1
)

echo.
echo [2/4] Starting Backend Server...
start "CodeSphere Backend" cmd /k "cd /d %~dp0backend && npm run dev"
timeout /t 3 >nul

echo.
echo [3/4] Starting Frontend Server...
start "CodeSphere Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 3 >nul

echo.
echo [4/4] Opening Browser...
timeout /t 5 >nul
start http://localhost:5173

echo.
echo ====================================
echo   CodeSphere is now running!
echo ====================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to view logs or close this window
pause >nul

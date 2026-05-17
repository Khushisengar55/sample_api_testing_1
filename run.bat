@echo off
echo ==========================================
echo Starting Bajaj Finserv Challenge API test...
echo ==========================================

:: Check and try running 'python'
where python >nul 2>nul
if %errorlevel% equ 0 (
    python app.py
    goto end
)

:: Check and try running 'py'
where py >nul 2>nul
if %errorlevel% equ 0 (
    py app.py
    goto end
)

:: Check and try running 'python3'
where python3 >nul 2>nul
if %errorlevel% equ 0 (
    python3 app.py
    goto end
)

echo [-] ERROR: Python is not configured in your Windows Environment Path!
echo ------------------------------------------
echo Pehle check karein ki kya Python installed hai.
echo Agar installed hai, toh configure karne ke liye:
echo 1. Windows Search me "Environment Variables" search karein.
echo 2. "Path" variable me apne Python installation ka path add karein.
echo.

:end
echo ==========================================
echo Verification finished! Press any key to close.
echo ==========================================
pause

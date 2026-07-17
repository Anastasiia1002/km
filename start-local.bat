@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js not found. Install from https://nodejs.org and run this file again.
  pause
  exit /b 1
)

echo Installing dependencies...
call npm install
if errorlevel 1 (
  echo npm install failed.
  pause
  exit /b 1
)

echo.
echo Starting local server...
echo Open in browser: http://localhost:5173/km/
echo Press Ctrl+C to stop.
echo.
call npm run dev

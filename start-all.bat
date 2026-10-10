@echo off
title Tester's Home - Master Launcher
echo =======================================================
echo   Launching Tester's Home Platform
echo   1. Backend API: http://localhost:5000
echo   2. Frontend UI: http://localhost:5173
echo   3. MongoDB Compass: mongodb://127.0.0.1:27017/testers_home
echo =======================================================
start "Tester's Home - Backend" cmd /c "%~dp0start-backend.bat"
timeout /t 2 /nobreak >nul
start "Tester's Home - Frontend" cmd /c "%~dp0start-frontend.bat"
echo Servers started in separate windows.
echo Opening browser at http://localhost:5173 ...
timeout /t 2 /nobreak >nul
start http://localhost:5173


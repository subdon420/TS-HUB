@echo off
title Tester's Home - Frontend UI Server
echo =======================================================
echo   Launching Tester's Home Frontend UI (Port 5173)
echo =======================================================
cd /d "%~dp0frontend"
set PATH=C:\Program Files\nodejs;%PATH%
call npm run dev
pause


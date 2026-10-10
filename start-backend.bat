@echo off
title Tester's Home - Backend API Server
echo =======================================================
echo   Launching Tester's Home Backend API (Port 5000)
echo   Database: mongodb://127.0.0.1:27017/testers_home
echo =======================================================
cd /d "%~dp0backend"
set PATH=C:\Program Files\nodejs;%PATH%
node src/server.js
pause


@echo off
chcp 65001 > nul
title Haven Kids Cafe - Dev Server
echo ================================================================
echo       HAVEN KIDS CAFE - STARTING DEVELOPMENT SERVERS
echo ================================================================
echo.
echo Starting Public Website (http://localhost:5173) ...
echo Starting Admin Dashboard (http://localhost:5174) ...
echo.
echo Press Ctrl+C anytime to stop.
echo.
start "Public Website" cmd /c "npm run dev:public"
start "Admin Dashboard" cmd /c "npm run dev:admin"

echo.
echo Both servers are starting in separate windows!
echo Press any key to exit this launcher (the servers will keep running in their windows).
echo.
pause

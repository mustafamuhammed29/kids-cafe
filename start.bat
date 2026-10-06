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
npm run dev
pause

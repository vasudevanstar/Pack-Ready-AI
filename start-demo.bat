@echo off
echo =======================================================
echo  Starting PackReady AI
echo =======================================================

start "PackReady AI - Backend" cmd /k "cd backend && npm run dev"
timeout /t 2 /nobreak >nul
start "PackReady AI - Frontend" cmd /k "cd frontend && npm run dev"

echo Backend running on http://localhost:5000
echo Frontend running on http://localhost:3000
echo =======================================================

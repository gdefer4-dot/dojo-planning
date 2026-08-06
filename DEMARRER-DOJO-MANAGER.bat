@echo off
title Dojo Manager V42.0
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js n'est pas installe.
  echo Installe Node.js puis relance ce fichier.
  pause
  exit /b 1
)
start "" http://127.0.0.1:4172/planning-affiche.html
node publish-server.js
pause

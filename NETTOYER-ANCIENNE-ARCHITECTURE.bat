@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo Nettoyage de l'ancienne architecture...
echo.

if exist "mobile" rmdir /s /q "mobile"

for %%F in (
"A-LIRE-V42.0-FINALE.txt"
"A-LIRE-V43.0.txt"
"A-LIRE-V43.1.txt"
"A-LIRE-V43.2.txt"
"A-LIRE-V44.0.txt"
"A-LIRE-V44.1.txt"
"A-LIRE-V44.2.txt"
"A-LIRE-V44.3.txt"
"A-LIRE.txt"
"LISEZ-MOI-PWA.txt"
"LISEZ-MOI-V32.txt"
"LISEZ-MOI-V40.1-PC-ET-MOBILE.txt"
"LISEZ-MOI-V41.1.txt"
"LISEZ-MOI-V41.txt"
"LISEZ-MOI-V42.0.txt"
"LISEZ-MOI.txt"
) do (
  if exist "%%~F" del /q "%%~F"
)

echo.
echo Nettoyage termine.
echo Le dossier .git a ete conserve.
echo.
pause

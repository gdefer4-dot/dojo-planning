@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo Nettoyage des doublons et anciens guides...
if exist "mobile" rmdir /s /q "mobile"

del /q "A-LIRE-V42.0-FINALE.txt" 2>nul
del /q "A-LIRE-V43.0.txt" 2>nul
del /q "A-LIRE-V43.1.txt" 2>nul
del /q "A-LIRE-V43.2.txt" 2>nul
del /q "A-LIRE-V44.0.txt" 2>nul
del /q "A-LIRE-V44.1.txt" 2>nul
del /q "A-LIRE-V44.2.txt" 2>nul
del /q "A-LIRE.txt" 2>nul
del /q "LISEZ-MOI-PWA.txt" 2>nul
del /q "LISEZ-MOI-V32.txt" 2>nul
del /q "LISEZ-MOI-V40.1-PC-ET-MOBILE.txt" 2>nul
del /q "LISEZ-MOI-V41.1.txt" 2>nul
del /q "LISEZ-MOI-V41.txt" 2>nul
del /q "LISEZ-MOI-V42.0.txt" 2>nul
del /q "LISEZ-MOI.txt" 2>nul

echo.
echo Nettoyage termine. Le dossier .git a ete conserve.
pause

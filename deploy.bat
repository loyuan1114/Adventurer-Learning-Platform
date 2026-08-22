@echo off
chcp 65001 >nul 2>&1
title ADV9 一鍵部署
echo.
echo ========================================
echo   ADV9 全領域冒險者養成系統 - 一鍵部署
echo ========================================
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0deploy.ps1"
pause

@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 正在启动本地服务器（由 Python 自动打开浏览器）...
echo 按 Ctrl+C 停止
echo.
py -3 start-server.py
pause

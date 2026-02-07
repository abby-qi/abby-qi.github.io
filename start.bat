@echo off
chcp 65001 >nul
echo ====================================
echo 日语单词学习 - 统一平台
echo ====================================
echo.
echo 正在启动服务器...
echo.

REM 检查是否安装了 Python
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo 使用 Python HTTP 服务器
    echo.
    echo 访问地址: http://localhost:8000/index.html
    echo.
    echo 按 Ctrl+C 停止服务器
    echo.
    cd /d "%~dp0"
    python -m http.server 8000
    goto :end
)

REM 检查是否安装了 Node.js
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo 使用 npx serve
    echo.
    echo 访问地址: http://localhost:3000/index.html
    echo.
    echo 按 Ctrl+C 停止服务器
    echo.
    cd /d "%~dp0"
    npx serve
    goto :end
)

echo 未找到 Python 或 Node.js
echo.
echo 请先安装以下工具之一：
echo 1. Python: https://www.python.org/downloads/
echo 2. Node.js: https://nodejs.org/
echo.
pause

:end

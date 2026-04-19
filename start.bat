@echo off
chcp 65001 >nul
echo ========================================
echo   为你好心语 - 启动服务
echo ========================================
echo.

cd /d "%~dp0"

REM 检查node_modules
if not exist "node_modules" (
    echo 正在安装依赖...
    npm install
    echo.
)

REM 设置环境变量（请在此填入你的SiliconFlow API密钥）
REM set SILICONFLOW_KEY=你的API密钥

echo 启动服务器...
echo 服务地址: http://localhost:3000
echo.
echo 按 Ctrl+C 停止服务
echo ========================================
echo.

node server.js

@echo off
chcp 65001 >nul
title 为你好心语 - 自动保活服务
cd /d "C:\Users\Administrator\.qclaw\workspace\healing-ai-app"

echo ==========================================
echo    为你好心语 - 自动保活服务
echo ==========================================
echo.

:: 检查 cloudflared
where cloudflared >nul 2>nul
if %errorlevel% neq 0 (
    echo [警告] 未找到 cloudflared，尝试使用备用路径...
    set "CLOUDFLARED=C:\Program Files (x86)\cloudflared\cloudflared.exe"
) else (
    set "CLOUDFLARED=cloudflared"
)

:: 检查 node
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未找到 Node.js
    pause
    exit /b 1
)

echo [1/4] 正在停止旧进程...
taskkill /f /im node.exe >nul 2>nul
taskkill /f /im cloudflared.exe >nul 2>nul
timeout /t 2 /nobreak >nul

echo [2/4] 启动后端服务...
start /min "心语服务器" cmd /c "node server.js > server.log 2>&1"
timeout /t 3 /nobreak >nul

echo [3/4] 检查服务状态...
curl -s http://localhost:3000/api/status >nul 2>nul
if %errorlevel% equ 0 (
    echo [✓] 后端服务运行正常
) else (
    echo [!] 后端服务启动中，等待...
    timeout /t 3 /nobreak >nul
)

echo [4/4] 启动 Cloudflare 隧道...
echo.
echo ==========================================
echo    隧道启动中，请等待...
echo    稳定后 URL 会显示在下方
echo ==========================================
echo.

:: 启动隧道并捕获URL
start /min "Cloudflare隧道" cmd /c "\"%CLOUDFLARED%\" tunnel --url http://localhost:3000 --protocol http2 > tunnel.log 2>&1"

:: 等待隧道建立
timeout /t 8 /nobreak >nul

:: 尝试读取隧道URL
for /f "tokens=*" %%a in ('findstr /i "trycloudflare" tunnel.log 2^>nul') do (
    echo [✓] 公网地址: %%a
    echo %%a > current_url.txt
    goto :found
)

:found
echo.
echo ==========================================
echo    服务启动完成！
echo ==========================================
echo.
echo 本地地址: http://localhost:3000
echo 管理后台: http://localhost:3000/admin.html
echo.
echo [提示] 本窗口请勿关闭
:echo [提示] 如需停止，直接关闭此窗口
echo.

:: 保活循环
:loop
timeout /t 30 /nobreak >nul

:: 检查后端
curl -s http://localhost:3000/api/status >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] %date% %time% - 后端异常，正在重启...
    taskkill /f /im node.exe >nul 2>nul
    start /min "心语服务器" cmd /c "node server.js > server.log 2>&1"
    timeout /t 3 /nobreak >nul
)

goto :loop

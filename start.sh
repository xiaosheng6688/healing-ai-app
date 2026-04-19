#!/bin/bash
echo "========================================"
echo "  为好心语 - 启动服务"
echo "========================================"

cd "$(dirname "$0")"

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "正在安装依赖..."
    npm install
fi

# 设置环境变量（请在此填入你的SiliconFlow API密钥）
# export SILICONFLOW_KEY="你的API密钥"

echo "启动服务器..."
echo "服务地址: http://localhost:3000"
echo "按 Ctrl+C 停止服务"
echo "========================================"

node server.js

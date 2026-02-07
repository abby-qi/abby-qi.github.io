#!/bin/bash

echo "===================================="
echo "日语单词学习 - 统一平台"
echo "===================================="
echo ""
echo "正在启动服务器..."
echo ""

# 检查 Python
if command -v python3 &> /dev/null; then
    echo "使用 Python HTTP 服务器"
    echo "访问地址: http://localhost:8000/index.html"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo ""
    cd "$(dirname "$0")"
    python3 -m http.server 8000
    exit 0
fi

# 检查 Python 2
if command -v python &> /dev/null; then
    echo "使用 Python HTTP 服务器"
    echo "访问地址: http://localhost:8000/index.html"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo ""
    cd "$(dirname "$0")"
    python -m http.server 8000
    exit 0
fi

# 检查 Node.js
if command -v npx &> /dev/null; then
    echo "使用 npx serve"
    echo "访问地址: http://localhost:3000/index.html"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo ""
    cd "$(dirname "$0")"
    npx serve
    exit 0
fi

echo "未找到 Python 或 Node.js"
echo ""
echo "请先安装以下工具之一："
echo "1. Python 3: https://www.python.org/downloads/"
echo "2. Node.js: https://nodejs.org/"
echo ""

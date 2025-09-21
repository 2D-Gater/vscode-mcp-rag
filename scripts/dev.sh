#!/bin/bash

# MCP Dummy Server 开发模式启动脚本

echo "正在启动 MCP Dummy Server (开发模式)..."

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "安装依赖..."
    npm install
fi

# 启动开发服务器
echo "启动 MCP Dummy Server (开发模式)..."
npm run dev


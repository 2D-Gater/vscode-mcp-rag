#!/bin/bash

# MCP Dummy Server 启动脚本

echo "正在启动 MCP Dummy Server..."

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "安装依赖..."
    npm install
fi

# 构建项目
echo "构建项目..."
npm run build

# 启动服务器
echo "启动 MCP Dummy Server..."
npm start


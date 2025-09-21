@echo off
REM MCP Dummy Server 开发模式启动脚本 (Windows)

echo 正在启动 MCP Dummy Server (开发模式)...

REM 检查是否已安装依赖
if not exist "node_modules" (
    echo 安装依赖...
    npm install
)

REM 启动开发服务器
echo 启动 MCP Dummy Server (开发模式)...
npm run dev


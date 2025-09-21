@echo off
REM MCP Dummy Server 启动脚本 (Windows)

echo 正在启动 MCP Dummy Server...

REM 检查是否已安装依赖
if not exist "node_modules" (
    echo 安装依赖...
    npm install
)

REM 构建项目
echo 构建项目...
npm run build

REM 启动服务器
echo 启动 MCP Dummy Server...
npm start


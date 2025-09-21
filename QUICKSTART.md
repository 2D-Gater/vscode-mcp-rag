# 快速启动指南

## 1. 安装依赖

```bash
npm install
```

## 2. 构建项目

```bash
npm run build
```

## 3. 启动服务器

### 方式一：直接启动
```bash
npm start
```

### 方式二：使用脚本启动
```bash
# Windows
scripts\start.bat

# Linux/macOS
./scripts/start.sh
```

## 4. 测试服务器

```bash
node scripts/test-mcp.js
```

## 5. 在 VSCode 中配置 MCP

1. 打开 VSCode 设置
2. 搜索 "MCP"
3. 添加以下配置：

```json
{
  "mcp.servers": {
    "vsc-mcp-dummy": {
      "command": "node",
      "args": ["C:\\Users\\Hoxis\\repos\\dev\\vsc-mcp\\dist\\index.js"],
      "cwd": "C:\\Users\\Hoxis\\repos\\dev\\vsc-mcp"
    }
  }
}
```

**注意：** 请将路径替换为您的实际项目路径。

## 6. 验证集成

1. 重启 VSCode
2. 打开一个代码文件
3. 使用 Copilot 时，它应该能够调用您的 MCP 工具

## 可用的 MCP 工具

- `search_code` - 搜索代码片段
- `get_file_content` - 获取文件内容
- `get_repository_info` - 获取仓库信息
- `list_repositories` - 列出所有仓库

## 故障排除

如果遇到问题，请检查：

1. 服务器是否正在运行
2. MCP 配置路径是否正确
3. 查看服务器控制台输出
4. 检查 VSCode 开发者工具中的错误信息


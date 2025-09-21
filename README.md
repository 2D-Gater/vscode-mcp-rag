# vscode-mcp-rag

# VSC MCP Dummy Server

这是一个用于测试 Github Copilot Remote Indexing 替代方案的 MCP (Model Context Protocol) dummy 服务器。

## 项目概述

本项目旨在创建一个 MCP 服务器，为 VSCode 的 Github Copilot 提供代码索引服务，作为 Github Copilot Remote Indexing 的替代方案。该方案特别适用于：

- 代码库托管在 Gitlab 上的团队
- 需要集中化代码索引的部门
- 包含多个模块和配置库的大型项目

## 功能特性

### 已实现的 MCP 工具

1. **search_code** - 在代码库中搜索代码片段
   - 支持按查询字符串搜索
   - 支持按仓库名称过滤
   - 支持按文件类型过滤
   - 可配置返回结果数量

2. **get_file_content** - 获取指定文件的内容
   - 支持指定文件路径
   - 支持指定仓库名称

3. **get_repository_info** - 获取仓库信息
   - 返回仓库的基本信息（名称、描述、语言、文件数量等）

4. **list_repositories** - 列出所有可用的仓库
   - 支持限制返回结果数量

## 安装和运行

### 前置要求

- Node.js 18+ 
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 构建项目

```bash
npm run build
```

### 运行服务器

#### 生产模式
```bash
npm start
```

#### 开发模式
```bash
npm run dev
```

#### 使用脚本启动

**Linux/macOS:**
```bash
# 生产模式
./scripts/start.sh

# 开发模式
./scripts/dev.sh
```

**Windows:**
```cmd
REM 生产模式
scripts\start.bat

REM 开发模式
scripts\dev.bat
```

## 配置

### MCP 配置

在 VSCode 中配置 MCP 服务器，将以下配置添加到您的 MCP 配置文件中：

```json
{
  "mcpServers": {
    "vsc-mcp-dummy": {
      "command": "node",
      "args": ["path/to/your/project/dist/index.js"],
      "cwd": "path/to/your/project"
    }
  }
}
```

## 测试

运行测试：

```bash
npm test
```

## 项目结构

```
vsc-mcp/
├── src/
│   ├── index.ts              # 主服务器文件
│   └── __tests__/
│       └── server.test.ts    # 测试文件
├── scripts/
│   ├── start.sh              # Linux/macOS 启动脚本
│   ├── start.bat             # Windows 启动脚本
│   ├── dev.sh                # Linux/macOS 开发脚本
│   └── dev.bat               # Windows 开发脚本
├── dist/                     # 构建输出目录
├── package.json              # 项目配置
├── tsconfig.json             # TypeScript 配置
├── mcp-config.json           # MCP 配置示例
└── README.md                 # 项目文档
```

## 开发说明

### 模拟数据

当前服务器使用模拟数据进行测试，包括：

- 3个示例仓库（frontend-app, backend-api, data-processing）
- 多个代码片段示例
- 模拟的文件内容

### 扩展功能

要添加新的 MCP 工具：

1. 在 `src/index.ts` 中的 `setupToolHandlers()` 方法中添加工具定义
2. 在 `ListToolsRequestSchema` 处理器中注册新工具
3. 在 `CallToolRequestSchema` 处理器中添加工具处理逻辑
4. 创建相应的参数验证模式

### 集成真实数据源

要集成真实的代码索引数据：

1. 替换 `mockCodeIndex` 对象
2. 实现与 Gitlab API 的集成
3. 添加代码索引和搜索功能
4. 实现缓存机制以提高性能

## 与 Github Copilot 集成

1. 确保 MCP 服务器正在运行
2. 在 VSCode 中配置 MCP 服务器
3. 重启 VSCode 或重新加载窗口
4. 在 Copilot 中使用时，它将能够调用您的 MCP 工具来获取代码上下文

## 故障排除

### 常见问题

1. **服务器无法启动**
   - 检查 Node.js 版本是否满足要求
   - 确保所有依赖已正确安装
   - 检查端口是否被占用

2. **MCP 连接失败**
   - 验证 MCP 配置文件格式
   - 检查服务器路径是否正确
   - 查看服务器日志输出

3. **工具调用失败**
   - 检查参数格式是否正确
   - 查看服务器错误日志
   - 验证工具名称和参数模式

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目。

## 许可证

MIT License


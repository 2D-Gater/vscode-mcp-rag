# MCP Dummy服务器 - Github Copilot Remote Indexing替代方案

## 📋 概述

本PR实现了MCP (Model Context Protocol) dummy服务器，作为Github Copilot Remote Indexing的替代方案。该解决方案特别适用于代码库托管在Gitlab上的团队，提供集中化的代码索引服务。

## 🎯 目标

- 创建与VSCode Github Copilot集成的MCP服务器
- 提供代码搜索和索引功能
- 支持多仓库集中化管理
- 为后续真实数据集成提供测试基础

## ✨ 功能特性

### 核心MCP工具
- **search_code** - 在代码库中搜索代码片段
  - 支持按查询字符串搜索
  - 支持按仓库名称过滤
  - 支持按文件类型过滤
  - 可配置返回结果数量

- **get_file_content** - 获取指定文件的内容
  - 支持指定文件路径
  - 支持指定仓库名称

- **get_repository_info** - 获取仓库信息
  - 返回仓库的基本信息（名称、描述、语言、文件数量等）

- **list_repositories** - 列出所有可用的仓库
  - 支持限制返回结果数量

### 技术实现
- **TypeScript** - 类型安全的实现
- **MCP协议** - 完整的MCP服务器实现
- **参数验证** - 使用Zod进行参数验证
- **错误处理** - 完善的错误处理机制
- **模拟数据** - 包含3个示例仓库和多个代码片段

## 📁 文件结构

```
vsc-mcp/
├── src/
│   ├── index.ts              # 主服务器文件
│   └── __tests__/
│       └── server.test.ts    # 测试文件
├── scripts/
│   ├── start.sh/.bat         # 启动脚本
│   ├── dev.sh/.bat           # 开发脚本
│   └── test-mcp.js           # 测试脚本
├── package.json              # 项目配置
├── tsconfig.json             # TypeScript配置
├── mcp-config.json           # MCP配置示例
├── README.md                 # 详细文档
└── QUICKSTART.md             # 快速启动指南
```

## 🚀 使用方法

1. **安装依赖**
   ```bash
   npm install
   ```

2. **构建项目**
   ```bash
   npm run build
   ```

3. **启动服务器**
   ```bash
   npm start
   ```

4. **在VSCode中配置MCP**
   ```json
   {
     "mcp.servers": {
       "vsc-mcp-dummy": {
         "command": "node",
         "args": ["path/to/dist/index.js"],
         "cwd": "path/to/project"
       }
     }
   }
   ```

## 🧪 测试

- 运行单元测试：`npm test`
- 运行集成测试：`node scripts/test-mcp.js`
- 验证MCP协议通信

## 📈 下一步计划

1. **真实数据集成** - 替换模拟数据为Gitlab API集成
2. **性能优化** - 添加缓存机制和索引优化
3. **扩展功能** - 根据实际需求添加更多MCP工具
4. **部署方案** - 提供容器化部署选项

## 🔍 测试验证

- [x] MCP协议实现正确
- [x] 所有工具功能正常
- [x] 错误处理完善
- [x] 文档完整
- [x] 测试覆盖

## 📝 注意事项

- 当前使用模拟数据进行测试
- 需要根据实际环境调整MCP配置路径
- 建议在测试环境中验证与Copilot的集成

---

**相关Issue**: #1 (如果适用)
**类型**: 功能开发
**优先级**: 高

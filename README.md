# vscode-mcp-rag

本仓库提供一个最小可用的 **Model Context Protocol (MCP)** 响应式 Dummy 服务器，用于在不依赖 GitHub 托管仓库的前提下验证 VS Code GitHub Copilot 的 MCP 集成。服务器会返回可预测的索引数据，帮助你在投入真实基础设施之前完成协议通信链路的打通。

## 核心特性

- 通过 stdio 使用 JSON-RPC 实现 MCP `initialize`、`tools/*` 与 `resources/*` 方法。
- 暴露名为 `fetchRepositoryContext` 的工具，返回组织内虚构仓库的精选文档片段。
- 发布多个只读资源，模拟分布在不同 GitLab 项目的代码与配置仓库。
- 通过 MCP `notifications/logMessage` 日志通知输出详细的调用轨迹，方便在 VS Code 的 MCP Inspector 中观察 Dummy 服务被真正调用的全过程。

## 快速开始

### 环境准备

- Node.js 18 或更新版本。
- 支持 MCP Provider 的 VS Code GitHub Copilot 扩展版本。

### 安装依赖

Dummy 服务器不需要第三方库，但仍建议执行安装以便将可执行脚本写入 `PATH`：

```bash
npm install
```

### 手动运行服务器

若想在命令行中查看 JSON-RPC 请求/响应，可直接启动脚本：

```bash
node src/server.js
```

服务器使用 stdio 作为通信信道，因此通常由 Copilot 自动拉起。当你手动运行时，它会在标准输入上阻塞等待请求。

## 在 VS Code 中验证集成

1. 打开 VS Code，按下 `Ctrl/⌘ + Shift + P` 调出命令面板，执行 **“GitHub Copilot: Add MCP Server”**。
2. 在弹出的表单中填写以下信息：
   - **Name**：`self-managed-index`
   - **Command**：Node 可执行文件的绝对路径（例如 `/usr/local/bin/node`）。
   - **Args**：包含 Dummy 服务器入口的绝对路径，例如 `/absolute/path/to/vscode-mcp-rag/src/server.js`。
   - **Env (可选)**：例如 `{ "NODE_ENV": "production" }`。
3. 完成后 VS Code 会更新 Copilot 设置并提示重载窗口，确认后等待 Copilot 再次启动。
4. 打开左侧 **Copilot** 视图或命令面板中的 **GitHub Copilot Chat**，输入任意问题（如“请介绍 service-a 的架构”）。
5. 在 **输出 (Output)** 面板选择 **GitHub Copilot**，或打开 **MCP Inspector**，观察日志中是否出现以下提示：
   - `Dummy MCP server is ready.`（服务器完成初始化）
   - `fetchRepositoryContext 调用` 或 `resources/get 调用`（Dummy MCP Server 正在返回上下文）
6. 当 Copilot 的回答中包含 `Service A`、`Service B` 或 `Platform Infrastructure` 的描述时，即表示 Copilot 已成功从 Dummy MCP Server 获取上下文数据。

> 提示：若未看到日志，可确认 `GitHub Copilot: Open Logs` 输出窗口或在 MCP Inspector 中启用所选服务器的日志级别。

## 自定义 Dummy 数据

- 可在 `src/server.js` 顶部的 `RESOURCES` 数组中编辑虚构仓库的信息（URI、描述、Markdown 内容等）。
- 若需扩展工具能力，可在 `handleToolsList` 中追加新的工具定义，并在 `handleToolsCall` 中实现对应逻辑。返回值应遵循 MCP 内容 Schema（通常为带有 `text` 字段的内容对象数组）。

## 协议说明

- 消息遵循 [Language Server Protocol](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#headerPart) 的报文格式（`Content-Length` 头部后接 JSON 体）。
- 请求在 Node.js 事件循环上顺序处理。若需支持并发或持久化，可在此基础上扩展。
- 未实现的方法会返回 `-32601` JSON-RPC 错误码，便于排查集成问题。

## 下一步

当 Dummy 集成验证通过后，可以逐步替换示例资源与工具逻辑，使其对接部门内部集中化的索引后端，最终提供给 GitHub Copilot 真实的 GitLab 代码上下文。

# vscode-mcp-rag（中文使用文档）

一个最小可用的 Python MCP（Model Context Protocol）HTTP 测试服务器，用于验证 VS Code GitHub Copilot 与 MCP 的通信是否正常。服务器暴露一个名为 `dummy_rag_query` 的工具，返回固定的示例“知识库”片段，便于联通性测试。

## 环境要求

- Python 3.10 及以上
- 建议使用 Poetry 管理依赖

## 安装与运行

使用 Poetry（推荐）：

```bash
pipx install poetry  # 若未安装
cd /Users/xisi4/repos/vscode-mcp-rag
poetry install
```

启动服务器：

```bash
poetry run mcp-http-server
```

默认监听：`http://127.0.0.1:8765`，HTTP 路径：`/mcp`。

## 在 VS Code Copilot 中配置（HTTP）

1. 打开命令面板（Ctrl/⌘ + Shift + P）→ 输入并选择 “MCP: Add Server”。
2. 选择“HTTP”。
3. Server URL：`http://127.0.0.1:8765/mcp`
4. Server ID：`python-mcp-http-test`
5. 保存到当前工作区或用户设置。

## 如何测试

- 让 Copilot 列出工具：例如输入“list available tools”。
- 调用工具：例如输入“call dummy_rag_query with query='hello world'”。

预期行为：

- 能看到工具 `dummy_rag_query`。
- 调用后返回两条占位“知识片段”，包含 `title/snippet/source`，并在 `result.content` 中有简短文本总结。

## 常见问题

- 无法导入依赖（编辑器警告）：先执行 `poetry install`，再通过 `poetry run mcp-http-server` 启动。
- 端口被占用：修改 `server/mcp_server.py` 中 `uvicorn.run` 的端口为未占用的端口，并在 VS Code 配置中同步更新 URL。

## 端点与方法（参考）

- `POST /mcp`：接收 MCP 风格方法调用。
  - `get_server_info`：返回最小的服务器信息（名称、版本、能力）。
  - `list_tools`：返回可用工具（此处为 `dummy_rag_query`）。
  - `call_tool`：调用指定工具。

## 自定义与扩展

- 新增/修改工具：在 `server/mcp_server.py` 的 `list_tools` 与 `call_tool` 分支中添加定义与实现。
- 如需切换为官方 Python MCP SDK 或 stdio 传输，请告知，我可以将本示例迁移为官方实现模板。

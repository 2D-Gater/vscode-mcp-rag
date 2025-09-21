# vscode-mcp-rag

This repository contains a minimal **Model Context Protocol (MCP)** server that can be used to validate the VS Code GitHub Copilot MCP integration without depending on GitHub hosted repositories. The dummy server returns deterministic indexing metadata so you can focus on verifying the transport and protocol wiring before connecting to real infrastructure.

## Features

- Responds to the standard MCP `initialize`, `tools/*`, and `resources/*` methods using JSON-RPC over stdio.
- Exposes a single `fetchRepositoryContext` tool that returns curated documentation snippets for mock repositories.
- Publishes several read-only resources that simulate repositories distributed across multiple GitLab projects.
- Emits MCP log notifications so you can inspect activity in the VS Code MCP Inspector.

## Getting started

### Prerequisites

- Node.js 18 or newer
- VS Code with the GitHub Copilot extension that supports MCP providers

### Install dependencies

The dummy server does not rely on external packages, but you should still install the project so that the executable is available on your `PATH`:

```bash
npm install
```

### Run the server manually

You can start the server directly to inspect JSON-RPC traffic using a terminal multiplexer or utilities like `jq`:

```bash
node src/server.js
```

The server communicates over stdio, so it is typically launched and managed by the Copilot agent. When run manually it will wait for JSON-RPC requests on stdin.

## Integrating with GitHub Copilot MCP

1. Open VS Code and go to **Settings** → **Extensions** → **GitHub Copilot** → **Experimental**.
2. Locate the **Model Context Protocol** section and edit the `modelContextProtocol.experimental.allow` configuration (or update the `settings.json` directly).
3. Add an entry similar to the following:

   ```json
   {
     "name": "self-managed-index",
     "command": "/absolute/path/to/your/node",
     "args": ["/absolute/path/to/vscode-mcp-rag/src/server.js"],
     "env": {
       "NODE_ENV": "production"
     }
   }
   ```

4. Reload VS Code. GitHub Copilot should now launch the dummy MCP server when activated.
5. Open the **Copilot** output or the **MCP Inspector** view (if available) to verify that the `vscode-mcp-rag-dummy` server reports `Dummy MCP server is ready.`
6. Trigger a Copilot request (for example, “explain the authentication service architecture”) and observe that Copilot can call the `fetchRepositoryContext` tool or read the published resources.

## Customizing the dummy data

The mock repositories are defined near the top of `src/server.js`. Each entry specifies the resource URI, metadata, and markdown payload returned by the MCP server. Update the array to reflect the repositories or services that matter to your integration tests.

You can also extend the `tools/list` handler to advertise additional tools. Each tool should return responses following the MCP content schema (an array of content objects, typically with a `text` entry).

## Protocol notes

- Messages follow the [Language Server Protocol](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#headerPart) framing (`Content-Length` header followed by a JSON body).
- Requests are processed sequentially on the Node.js event loop. For more complex scenarios you may want to add concurrency control or persistence.
- The server currently implements the minimal set of methods Copilot needs for handshake and tooling. Unrecognized methods return a JSON-RPC `-32601` error, which helps during debugging.

## Next steps

Once you are satisfied with the dummy server integration, replace the mock resources and tool implementation with logic that talks to your centralized indexing backend. This repo is intentionally lightweight so you can evolve it into a full-featured MCP provider for GitLab-hosted code bases.

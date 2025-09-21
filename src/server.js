#!/usr/bin/env node

const CAPABILITIES = {
  tools: {
    listChanged: true,
  },
  resources: {
    listChanged: true,
    get: true,
  },
  logging: {
    listChanged: false,
  },
};

const SERVER_INFO = {
  name: "vscode-mcp-rag-dummy",
  version: "0.1.0",
};

const RESOURCES = [
  {
    uri: "dummy://repo/service-a",
    name: "Service A overview",
    description: "High level overview of the Service A code base used for integration tests.",
    mimeType: "text/markdown",
    content: `# Service A\n\nThis is a mock service description used to verify MCP connectivity.\n\n- Language: TypeScript\n- Purpose: Handles user authentication\n- Important modules: \`auth/controller.ts\`, \`auth/service.ts\`\n` ,
  },
  {
    uri: "dummy://repo/service-b",
    name: "Service B overview",
    description: "Containerized service B overview used for MCP dummy server testing.",
    mimeType: "text/markdown",
    content: `# Service B\n\nAnother mock service.\n\n- Language: Go\n- Purpose: Serves internal APIs\n- Deployment: Helm chart located at \`deploy/helm/service-b\`\n`,
  },
  {
    uri: "dummy://repo/platform-infra",
    name: "Platform infrastructure",
    description: "Summary of infrastructure as code repository.",
    mimeType: "text/markdown",
    content: `# Platform Infrastructure\n\nContains Terraform and Helm charts for the wider platform.\n\n- Terraform root modules in \`terraform/\`\n- Helm charts for shared components in \`charts/\`\n- CI pipeline definitions in \`.gitlab-ci.yml\`\n`,
  },
];

function log(message, level = "info") {
  const payload = {
    jsonrpc: "2.0",
    method: "notifications/logMessage",
    params: {
      level,
      message,
    },
  };
  send(payload);
}

function send(message) {
  const body = JSON.stringify(message);
  const payload = `Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`;
  process.stdout.write(payload);
}

function sendResponse(id, result) {
  send({ jsonrpc: "2.0", id, result });
}

function sendError(id, code, message, data) {
  const error = { code, message };
  if (data !== undefined) {
    error.data = data;
  }
  send({ jsonrpc: "2.0", id, error });
}

function handleInitialize(message) {
  sendResponse(message.id, {
    protocolVersion: "0.1.0",
    capabilities: CAPABILITIES,
    serverInfo: SERVER_INFO,
  });
  send({
    jsonrpc: "2.0",
    method: "notifications/ready",
    params: {},
  });
  log("Dummy MCP server is ready.");
}

function handleToolsList(message) {
  log("tools/list called.");
  sendResponse(message.id, {
    tools: [
      {
        name: "fetchRepositoryContext",
        description: "Return curated documentation snippets for a repository in the organization.",
        inputSchema: {
          type: "object",
          properties: {
            repository: {
              type: "string",
              description: "Identifier of the repository (e.g. service-a).",
            },
            topic: {
              type: "string",
              description: "Optional topic to narrow the requested context (module, feature, etc).",
            },
          },
          required: ["repository"],
        },
      },
    ],
  });
}

function handleToolsCall(message) {
  const { name, arguments: args = {} } = message.params || {};
  if (name !== "fetchRepositoryContext") {
    sendError(message.id, -32601, `Unknown tool: ${name}`);
    return;
  }

  const repoId = String(args.repository || "").toLowerCase();
  const topic = args.topic ? String(args.topic) : null;

  log(
    `fetchRepositoryContext 调用: repository=${args.repository ?? ""}${
      topic ? `, topic=${topic}` : ""
    }`
  );

  const resource = RESOURCES.find((item) => item.uri.endsWith(repoId));

  let text;
  if (resource) {
    text = resource.content;
    if (topic) {
      text += `\n## Requested topic\n\nThe caller asked about: ${topic}.\n`;
    }
  } else {
    text = `No repository named "${args.repository}" is registered in the dummy index. Available repositories: ${RESOURCES.map((item) => item.uri.split("/").pop()).join(", ")}.`;
  }

  sendResponse(message.id, {
    content: [
      {
        type: "text",
        text,
      },
    ],
  });
}

function handleResourcesList(message) {
  log("resources/list called.");
  sendResponse(message.id, {
    resources: RESOURCES.map(({ uri, name, description, mimeType }) => ({
      uri,
      name,
      description,
      mimeType,
    })),
    nextCursor: null,
  });
}

function handleResourceGet(message) {
  const { uri } = message.params || {};
  log(`resources/get call: uri=${uri ?? ""}`);
  const resource = RESOURCES.find((item) => item.uri === uri);
  if (!resource) {
    sendError(message.id, -32602, `Unknown resource: ${uri}`);
    return;
  }

  sendResponse(message.id, {
    contents: [
      {
        uri: resource.uri,
        mimeType: resource.mimeType,
        text: resource.content,
      },
    ],
  });
}

function handlePing(message) {
  sendResponse(message.id, { pong: true });
}

function handleShutdown(message) {
  sendResponse(message.id, null);
  process.exit(0);
}

function handleRequest(message) {
  switch (message.method) {
    case "initialize":
      handleInitialize(message);
      break;
    case "tools/list":
      handleToolsList(message);
      break;
    case "tools/call":
      handleToolsCall(message);
      break;
    case "resources/list":
      handleResourcesList(message);
      break;
    case "resources/get":
      handleResourceGet(message);
      break;
    case "server/ping":
      handlePing(message);
      break;
    case "shutdown":
      handleShutdown(message);
      break;
    case "notifications/cancel":
      break;
    default:
      sendError(message.id, -32601, `Unhandled method: ${message.method}`);
  }
}

function handleMessage(message) {
  if (message.id === undefined) {
    // Notification from client – currently nothing to process.
    return;
  }

  if (message.method) {
    handleRequest(message);
  } else {
    // Ignore responses from client.
  }
}

let buffer = Buffer.alloc(0);

process.stdin.on("data", (chunk) => {
  buffer = Buffer.concat([buffer, chunk]);
  processBuffer();
});

function processBuffer() {
  while (true) {
    const headerEnd = buffer.indexOf("\r\n\r\n");
    if (headerEnd === -1) {
      return;
    }

    const header = buffer.slice(0, headerEnd).toString("utf8");
    const lengthMatch = header.match(/Content-Length: (\d+)/i);
    if (!lengthMatch) {
      log("Received payload without Content-Length header", "error");
      buffer = buffer.slice(headerEnd + 4);
      continue;
    }

    const contentLength = Number.parseInt(lengthMatch[1], 10);
    const totalLength = headerEnd + 4 + contentLength;
    if (buffer.length < totalLength) {
      return;
    }

    const body = buffer.slice(headerEnd + 4, totalLength).toString("utf8");
    buffer = buffer.slice(totalLength);

    try {
      const message = JSON.parse(body);
      handleMessage(message);
    } catch (error) {
      log(`Failed to parse JSON payload: ${error}`, "error");
    }
  }
}

process.stdin.on("end", () => {
  log("Stdin stream ended. Shutting down.");
  process.exit(0);
});

log("Dummy MCP server started.");

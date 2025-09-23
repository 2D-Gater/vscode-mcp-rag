from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Any, Dict, List, Optional


class McpRequest(BaseModel):
    id: Optional[str] = None
    method: str
    params: Optional[Dict[str, Any]] = None


class McpResponse(BaseModel):
    id: Optional[str]
    result: Dict[str, Any]
    error: Optional[Dict[str, Any]] = None


app = FastAPI(title="Python MCP HTTP Test Server")


@app.post("/mcp")
async def mcp_handler(req: McpRequest):
    method = req.method
    params = req.params or {}

    if method == "list_tools":
        tools = [
            {
                "name": "dummy_rag_query",
                "description": "Return dummy knowledge base snippets for connectivity testing.",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string", "description": "User question to search the KB"}
                    },
                    "required": ["query"],
                },
            },
        ]
        return JSONResponse(
            McpResponse(id=req.id, result={"tools": tools}).model_dump()
        )

    if method == "call_tool":
        tool_name = params.get("name")
        arguments = params.get("arguments") or {}
        if tool_name == "dummy_rag_query":
            query = arguments.get("query", "")
            results: List[Dict[str, Any]] = [
                {
                    "title": "MCP RAG KB Entry A",
                    "snippet": "This is a dummy snippet for '%s'." % query,
                    "source": "kb://dummy/a",
                },
                {
                    "title": "MCP RAG KB Entry B",
                    "snippet": "Another placeholder snippet for '%s'." % query,
                    "source": "kb://dummy/b",
                },
            ]
            return JSONResponse(
                McpResponse(
                    id=req.id,
                    result={
                        "content": [
                            {
                                "type": "text",
                                "text": "Found %d dummy results" % len(results),
                            }
                        ],
                        "data": {"results": results},
                    },
                ).model_dump()
            )

        return JSONResponse(
            McpResponse(
                id=req.id,
                result={},
                error={"code": "tool_not_found", "message": f"Unknown tool: {tool_name}"},
            ).model_dump(),
            status_code=404,
        )

    # Minimal protocol identity
    if method == "get_server_info":
        return JSONResponse(
            McpResponse(
                id=req.id,
                result={
                    "name": "python-mcp-http-test",
                    "version": "0.1.0",
                    "protocol": "mcp/0.1",
                    "capabilities": {"tools": True},
                },
            ).model_dump()
        )

    return JSONResponse(
        McpResponse(
            id=req.id,
            result={},
            error={"code": "method_not_found", "message": f"Unknown method: {method}"},
        ).model_dump(),
        status_code=400,
    )


def main() -> None:
    import uvicorn

    uvicorn.run(
        "server.mcp_server:app",
        host="127.0.0.1",
        port=8765,
        reload=False,
        log_level="info",
    )



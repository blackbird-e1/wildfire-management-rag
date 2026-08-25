from mcp.server import MCPServer
import httpx2

mcp = MCPServer("Wildfire MCP Server")


@mcp.tool()
async def ask_wildfire(question: str) -> str:
    """Ask the Wildfire Management RAG system a question."""

    async with httpx2.AsyncClient() as client:
        response = await client.post(
            "http://localhost:3001/ask",
            json={"question": question},
            timeout=60.0,
        )

    response.raise_for_status()

    data = response.json()

    return data["answer"]


if __name__ == "__main__":
    mcp.run()
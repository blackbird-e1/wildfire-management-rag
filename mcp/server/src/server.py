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


@mcp.tool()
async def search_wildfire_knowledge(query: str) -> str:
    """Search the Wildfire Management knowledge base for relevant documents."""

    async with httpx2.AsyncClient() as client:
        response = await client.post(
            "http://localhost:3001/search",
            json={"query": query},
            timeout=60.0,
        )

    response.raise_for_status()

    data = response.json()

    results = data["results"]

    if not results:
        return "No relevant documents were found."

    formatted_results = []

    for index, document in enumerate(results, start=1):
        formatted_results.append(
            f"DOCUMENT {index}:\n{document['text']}"
        )

    return "\n\n".join(formatted_results)


if __name__ == "__main__":
    mcp.run()
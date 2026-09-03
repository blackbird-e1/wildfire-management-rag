import asyncio

from mcp import ClientSession
from mcp import StdioServerParameters
from mcp.client.stdio import stdio_client


server = StdioServerParameters(
    command="python",
    args=["src/server.py"],
)


async def main():
    async with stdio_client(server) as (read, write):
        async with ClientSession(read, write) as session:
            print("\n=== CONNECTED TO MCP SERVER ===")

            await session.initialize()

            result = await session.list_tools()

            print("\n=== AVAILABLE TOOLS ===")

            for tool in result.tools:
                print(f"- {tool.name}: {tool.description}")

            print("\n=== CALLING ask_wildfire ===")

            result = await session.call_tool(
                "ask_wildfire",
                {
                    "question": "What are common wildfire detection methods?"
                },
            )

            print("\n=== MCP RESPONSE ===")

            for content in result.content:
                print(content)

            print("\n=== CALLING search_wildfire_knowledge ===")

            result = await session.call_tool(
                "search_wildfire_knowledge",
                {
                    "query": "wildfire detection methods"
                },
            )

            print("\n=== SEARCH RESPONSE ===")

            for content in result.content:
                print(content)


if __name__ == "__main__":
    asyncio.run(main())
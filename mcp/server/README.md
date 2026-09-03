# Wildfire MCP Server

This directory contains the Model Context Protocol (MCP) integration for the Wildfire Management RAG system.

The MCP server exposes the existing wildfire backend as tools that can be discovered and called by MCP-compatible clients.

## Architecture

The MCP layer acts as an interface between external MCP clients and the existing Wildfire Management backend.

```text
MCP Client
    |
    v
Wildfire MCP Server
    |
    +-----------------------------+
    |                             |
    v                             v
ask_wildfire()        search_wildfire_knowledge()
    |                             |
    v                             v
POST /ask                 POST /search
    |                             |
    v                             v
LangGraph                    Embeddings
    |                             |
    v                             v
RAG Pipeline               Astra DB
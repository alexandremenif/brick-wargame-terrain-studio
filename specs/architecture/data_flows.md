# End-to-End Data Flows

This document details the sequence and boundaries of data flows across the system layers for user interactions and external AI agent tool execution.

---

## 1. Flow A: User Direct Interaction (Optimistic Canvas + HTTP JSON-RPC)

When the user draws on the interactive HTML5 2D canvas:

```mermaid
sequenceDiagram
  autonumber
  actor User as User in Web Studio
  participant Canvas as UI (<CanvasViewport>)
  participant Api as TerrainApiClient (fetch)
  participant Router as OpenRPC Router (@open-rpc/server-js)
  participant Domain as Domain Engine (Asset)
  participant Store as SQLite Storage (WAL Mode)

  User->>Canvas: Drags brush across studs
  Canvas->>Canvas: Instant local draw (Optimistic UI @ 60+ FPS)
  Canvas->>Api: paintArea({ assetId, boundingBox, colorId })
  Api->>Router: HTTP POST /rpc (JSON-RPC 2.0)
  Router->>Domain: Dispatch PaintAreaCommand
  Note over Domain: Clip to asset surface (lenient bounds)
  Domain->>Domain: Mutate in-memory cells
  Domain->>Store: Persist affected cells
  Store-->>Domain: Transaction committed
  Domain-->>Router: Command response (affectedCells)
  Router-->>Api: HTTP 200 {"result": {"affectedCells": 16}}
```

---

## 2. Flow B: External AI Mutation via MCP (Streamable HTTP)

When an external AI agent manipulates an asset via MCP tooling:

```mermaid
sequenceDiagram
  autonumber
  actor AI as External AI Agent
  participant MCP as MCP Server Adapter
  participant Domain as Domain Engine (Asset)
  participant Store as SQLite Storage (WAL Mode)

  AI->>MCP: callTool("paint_area", { boundingBox, colorId })
  MCP->>Domain: Execute PaintAreaCommand
  Domain->>Domain: Mutate in-memory cells
  Domain->>Store: Persist cells to SQLite
  Store-->>Domain: Transaction committed
  Domain-->>MCP: Tool execution result
  MCP-->>AI: HTTP Response (MCP tool response)
```

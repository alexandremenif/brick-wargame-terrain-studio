# System Architecture & Monorepo Layout

This document describes the technical architecture of **Brick Wargame Terrain Studio**, the monorepo package topology, communication flows, and system boundaries.

---

## 1. High-Level Architecture Overview

```mermaid
flowchart TD
  subgraph AIEnv["AI Environment (Antigravity 2.0 / Claude Desktop / Remote Agents)"]
    Agent["AI Agent (Multimodal LLM)"]
  end

  subgraph UserEnv["User Browser"]
    WebApp["UI (Vite + React 19 + Canvas Viewport)"]
  end

  subgraph SharedContracts["Pure Shared Contracts (Zero Node.js / Zero Native Deps)"]
    Api["packages/api (TypeScript Interfaces, DTOs, TerrainEngineService Contract)"]
  end

  subgraph HostSystem["Server System (Node.js)"]
    Server["packages/server (Unified: Streamable HTTP MCP + OpenRPC Router + Domain Engine)"]
    SQLite[("Local SQLite Database (terrain.db) - WAL Mode")]
  end

  Agent ---|"Streamable HTTP (JSON-RPC MCP)"| Server
  WebApp ---|"WebSockets (Live Sync) & JSON-RPC 2.0"| Server
  WebApp -.->|"Consumes Type Contracts"| Api
  Server -.->|"Implements OpenRPC Methods"| Api

  Server ---|"Internal Engine Calls"| SQLite
  Server -.->|"Real-time Events (assetChanged, bboxUpdated)"| WebApp
```

---

## 2. Monorepo Package Breakdown

* **`packages/api`**: Pure shared contract package containing domain DTOs and the `TerrainEngineService` interface compiled from JSON Schema.
* **`packages/server`**: Server hosting domain logic, SQLite WAL persistence, OpenRPC JSON-RPC 2.0 router with schema validation, and streamable HTTP MCP tools (ready for remote or local hosting).
* **`packages/ui`**: React 19 SPA frontend with high-performance HTML5 2D Canvas viewport, Minimap, Bounding Box controls, and official brick color pickers.
* **`packages/codegen`**: Build-time tooling compiling declarative schemas in `specs/` into typed TypeScript contracts and SQL migrations.

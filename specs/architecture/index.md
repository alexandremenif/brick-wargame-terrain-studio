# System Architecture & Monorepo Layout

This document describes the technical architecture of **LEGO Wargame Terrain Studio**, the monorepo package topology, communication flows, and system boundaries.

---

## 1. High-Level Architecture Overview

```mermaid
flowchart TD
  subgraph AIEnv["AI Environment (Antigravity 2.0 / Claude Desktop)"]
    Agent["AI Agent (Multimodal LLM)"]
  end

  subgraph UserEnv["User Browser"]
    WebApp["UI Studio (Vite + React 19 + Canvas)"]
  end

  subgraph SharedContracts["Pure Shared Contracts (Zero Node.js / Zero Native Deps)"]
    Api["packages/api (TypeScript Interfaces, DTOs, TerrainEngineService Contract)"]
  end

  subgraph HostSystem["Local System (Node.js)"]
    Server["packages/server (Unified: MCP stdio + OpenRPC Router + Domain Engine)"]
    SQLite[("Local SQLite Database (terrain.db) - WAL Mode")]
  end

  Agent ---|"stdio (JSON-RPC MCP)"| Server
  WebApp ---|"WebSockets (Live Sync) & JSON-RPC 2.0"| Server
  WebApp -.->|"Consumes Type Contracts"| Api
  Server -.->|"Implements OpenRPC Methods"| Api

  Server ---|"Internal Engine Calls"| SQLite
  Server -.->|"Real-time Events (cellsChanged, syncBBox)"| WebApp
```

---

## 2. Monorepo Package Breakdown

* **`packages/api`**: Pure shared contract package containing domain DTOs and the `TerrainEngineService` interface compiled from JSON Schema.
* **`packages/server`**: Unified local server hosting domain logic, SQLite WAL persistence, OpenRPC JSON-RPC 2.0 router with schema validation, and MCP tools over stdio.
* **`packages/ui`**: React 19 SPA frontend with high-performance Canvas viewport, Bounding Box selection overlay, and official LEGO color pickers.
* **`packages/codegen`**: Build-time tooling compiling declarative schemas in `specs/` into typed TypeScript contracts and SQL migrations.

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

  subgraph SharedContracts["Pure Shared Domain (Zero Node.js / Zero Native Deps)"]
    Domain["packages/domain (TypeScript Entities, DTOs, TerrainEngineService Contract, Math & 2D Canvas Engine)"]
  end

  subgraph HostSystem["Server System (Node.js)"]
    Server["packages/server (Unified: Streamable HTTP MCP + OpenRPC Router + Domain Engine)"]
    SQLite[("Local SQLite Database (terrain.db) - WAL Mode")]
  end

  Agent ---|"Streamable HTTP (JSON-RPC MCP)"| Server
  WebApp ---|"HTTP POST /rpc (JSON-RPC 2.0)"| Server
  WebApp -.->|"Consumes Domain Models & Renderer"| Domain
  Server -.->|"Implements OpenRPC Methods"| Domain

  Server ---|"Internal Engine Calls"| SQLite
```

---

## 2. Monorepo Package Breakdown

* **`packages/domain`**: Pure shared domain package containing domain entities, DTOs, the `TerrainEngineService` interface compiled from JSON Schema, pure bounding box math, and the shared 2D canvas rendering engine.
* **`packages/server`**: Server hosting domain logic, SQLite WAL persistence, OpenRPC JSON-RPC 2.0 router with schema validation, and streamable HTTP MCP tools (ready for remote or local hosting).
* **`packages/ui`**: React 19 SPA frontend with high-performance HTML5 2D Canvas viewport, Minimap, Bounding Box controls, and official brick color pickers.
* **`packages/codegen`**: Build-time tooling compiling declarative schemas in `specs/` into typed TypeScript contracts and SQL migrations.

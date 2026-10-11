# Server Architecture & Adapters Specification

The `specs/server/` directory defines technical inbound and outbound adapters bridging the domain engine with HTTP transports, AI tools, and relational persistence.

---

## 1. Server Ports & Adapters

```text
                        ┌─────────────────────────────────────┐
                        │             Domain Engine           │
                        └───────────────▲─────────────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           │                            │                            │
 ┌─────────┴─────────┐        ┌─────────┴─────────┐        ┌─────────┴─────────┐
 │   OpenRPC Router  │        │   MCP AI Adapter  │        │   SQLite Storage  │
 │ (HTTP POST /rpc)  │        │ (Streamable HTTP) │        │    (WAL Mode)     │
 └───────────────────┘        └───────────────────┘        └───────────────────┘
```

1. **Wire Protocol Adapter (Commands & Queries)**:
   * Defined in [`openrpc.yaml`](./openrpc.yaml).
   * Exposes standard JSON-RPC 2.0 endpoints over **HTTP POST (`/rpc`)**.
   * Clients send standard JSON-RPC requests via HTTP POST and receive synchronous JSON-RPC responses.
   * Enforces automatic schema validation of inbound parameters against domain schemas, returning error code `-32602` upon validation failure.

2. **AI Tooling Adapter**:
   * Defined in [`mcp.md`](./mcp.md).
   * Implements the Model Context Protocol (MCP) over Streamable HTTP allowing external AI agents to manipulate assets and inspect structured cell state with parity.

3. **Relational Storage Adapter (SQLite)**:
   * Defined in [`schema.dbml`](./schema.dbml).
   * Generates SQLite DDL migrations (`assets` and `cells` tables) with foreign key enforcement and Write-Ahead Logging (WAL) concurrency.

---

## 2. Server Color Management

* **Static In-Memory Catalog**:
  * Brick colors are static reference data defined authoritatively in [`specs/domain/colors.csv`](../domain/colors.csv).
  * **Not Stored in Database**: The server loads the colors list into memory from the static file (compiled at build time). There is no `brick_colors` table or seed migration in SQLite.
  * In SQLite, the `cells` table stores only the numeric `color_id INTEGER NOT NULL`.
  * The server exposes the static catalog via the `list_colors` endpoint (JSON-RPC and MCP tool), ensuring both the UI and AI agents query the exact same color definitions dynamically.

---

## 3. Server Infrastructure BDD Scenarios

Acceptance criteria for server infrastructure are located in `features/`:
* [`features/persistence.feature`](./features/persistence.feature): Verifies restart recovery and transaction durability.
* [`features/jsonrpc_protocol.feature`](./features/jsonrpc_protocol.feature): Verifies JSON-RPC 2.0 error codes (`-32602`, `-32601`) and request execution over HTTP.

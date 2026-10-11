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

## 2. Server Domain Services & Repositories

* **[`color_service.md`](./color_service.md)** (`ColorService`):
  * Responsible for loading and parsing the authoritative brick colors list from the static file ([`specs/domain/colors.csv`](../domain/colors.csv)) into memory at server startup.
  * Provides in-memory queries (`listColors`, `getColorById`, `isValidColorId`) for JSON-RPC handlers, MCP tools, and domain validation.
  * Keeps SQLite database completely free of static color tables.

* **[`asset_repository.md`](./asset_repository.md)** (`AssetRepository`):
  * Manages the persistence lifecycle and CRUD operations for the `Asset` aggregate root in SQLite.
  * Adheres strictly to Domain-Driven Design (DDD): external callers interact exclusively with the `Asset` aggregate (`create`, `findById`, `listAll`, `update`, `delete`), never directly mutating raw cells in isolation.
  * Handles transactional state mutations, cascading deletes, and cell synchronization within SQLite transactions.

---

## 3. Server Color Management

* **Static In-Memory Catalog**:
  * Brick colors are static reference data defined authoritatively in [`specs/domain/colors.csv`](../domain/colors.csv).
  * **Not Stored in Database**: Loaded into memory by `ColorService` at startup. There is no `brick_colors` table or seed migration in SQLite.
  * In SQLite, the `cells` table stores only the numeric `color_id INTEGER NOT NULL`.
  * The server exposes the static catalog via the `list_colors` endpoint (JSON-RPC and MCP tool), ensuring both the UI and AI agents query the exact same color definitions dynamically.

---

## 3. Server Infrastructure BDD Scenarios

Acceptance criteria for server infrastructure are located in `features/`:
* [`features/persistence.feature`](./features/persistence.feature): Verifies restart recovery and transaction durability.
* [`features/jsonrpc_protocol.feature`](./features/jsonrpc_protocol.feature): Verifies JSON-RPC 2.0 error codes (`-32602`, `-32601`) and request execution over HTTP.

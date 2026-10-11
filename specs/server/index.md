# Server Architecture & Adapters Specification

The `specs/server/` directory defines technical inbound and outbound adapters bridging the domain engine with network transports, AI tools, and relational persistence.

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
 │  (JSON-RPC 2.0)   │        │     (stdio)       │        │    (WAL Mode)     │
 └───────────────────┘        └───────────────────┘        └───────────────────┘
```

1. **Wire Protocol Adapter**:
   * Defined in [`openrpc.yaml`](./openrpc.yaml).
   * Exposes JSON-RPC 2.0 endpoints over WebSocket and IPC.
   * Enforces automatic schema validation of inbound parameters against domain schemas, returning error code `-32602` upon validation failure.

2. **AI Tooling Adapter**:
   * Defined in [`mcp.md`](./mcp.md).
   * Implements the Model Context Protocol (MCP) to allow external AI agents to manipulate maps and inspect coordinates.

3. **Relational Storage Adapter**:
   * Defined in [`schema.dbml`](./schema.dbml).
   * Generates SQLite DDL migrations with foreign key enforcement and Write-Ahead Logging (WAL) concurrency.

---

## 2. Server Infrastructure BDD Scenarios

Acceptance criteria for server infrastructure are located in `features/`:
* [`features/persistence.feature`](./features/persistence.feature): Verifies restart recovery and transaction durability.
* [`features/jsonrpc_protocol.feature`](./features/jsonrpc_protocol.feature): Verifies JSON-RPC 2.0 error codes (`-32602`, `-32601`) and batch request execution.

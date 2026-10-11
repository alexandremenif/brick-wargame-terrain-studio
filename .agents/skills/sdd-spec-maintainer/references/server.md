# Reference: Maintaining specs/server/ (Server Adapters & Ports)

## Purpose
The `specs/server/` directory defines technical adapters bridging the domain engine with network protocols (JSON-RPC 2.0 / OpenRPC), AI tooling (MCP), and relational persistence (SQLite WAL mode).

## Structure
* `index.md`: Server process topology, adapter architecture, and port boundaries.
* `openrpc.yaml`: OpenRPC 1.2+ specification defining JSON-RPC 2.0 remote methods, parameter schemas `$ref`-ing domain schemas, and standard error codes (`-32602`, `-32601`, `-32000`).
* `schema.dbml`: Relational database schema definition compiling to SQLite SQL migrations.
* `mcp.md`: Model Context Protocol tool inventory and AI agent integration.
* `features/persistence.feature`: BDD scenarios testing persistence restart recovery and transaction durability.
* `features/jsonrpc_protocol.feature`: BDD scenarios verifying wire parameter validation (`-32602`) and method execution.

## Golden Rules
* Any new remote method or wire error code must be declared in `openrpc.yaml` referencing domain schemas.
* Any database table, column, constraint, or index must be authored in `schema.dbml`.
* After modifying `openrpc.yaml` or `schema.dbml`, immediately run:
  ```bash
  npm run codegen
  ```
* NEVER manually edit generated files in `packages/server/src/generated/` or `packages/server/src/persistence/migrations/`.

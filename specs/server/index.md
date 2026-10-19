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

3. **Relational / Document Storage Adapter (SQLite)**:
   * Defined in [`schema.dbml`](./schema.dbml).
   * Generates SQLite DDL migrations (single `assets` table storing the `Asset` aggregate as `JSONB` with `STORED` derived summary columns) and Write-Ahead Logging (WAL) concurrency.

4. **HTTP Operational & Health Check Adapter**:
   * Defined in [`health_check.md`](./health_check.md).
   * Exposes `GET /health` and `HEAD /health` providing readiness probes for process orchestrators (`process-compose.yaml`).
   * Guarantees fast, non-cached JSON diagnostic responses (`200 OK`, `{"status": "ok"}`).

---

## 2. Server Domain Services & Repositories

* **[`color_service.md`](./color_service.md)** (`ColorService`):
  * Responsible for loading and parsing the authoritative brick colors list from the static file ([`specs/domain/colors.csv`](../domain/colors.csv)) into memory at server startup.
  * Provides in-memory queries (`listColors`, `getColorById`, `isValidColorId`) for JSON-RPC handlers, MCP tools, and domain validation.
  * Keeps SQLite database completely free of static color tables.

* **[`asset_service.md`](./asset_service.md)** (`AssetService`):
  * Application service orchestrating domain use-cases on the `Asset` aggregate root.
  * Mediates between inbound adapters (OpenRPC router, MCP adapter) and persistence (`AssetRepository`).
  * Enforces cross-cutting business rules (validates colors via `ColorService`), handles lenient painting logic on the aggregate, and coordinates persistence.

* **[`image_export_service.md`](./image_export_service.md)** (`ImageExportService`):
  * Application service orchestrating asset image exports for multimodal LLM vision and printing.
  * Enforces boundary validation, calculates adaptive scale (`computeAdaptivePixelsPerStud`), delegates rasterization to domain `renderAssetGrid`, and produces base64 PNG data.

* **[`asset_repository.md`](./asset_repository.md)** (`AssetRepository`):
  * Manages the persistence lifecycle and CRUD operations for the `Asset` aggregate root in SQLite.
  * Adheres strictly to Domain-Driven Design (DDD): external callers interact exclusively with the `Asset` aggregate (`create`, `findById`, `listAll`, `update`, `delete`), persisting the entire aggregate as a `JSONB` document with `STORED` derived summary columns.

---

## 3. Server Color Management

* **Static In-Memory Catalog**:
  * Brick colors are static reference data defined authoritatively in [`specs/domain/colors.csv`](../domain/colors.csv).
  * **Not Stored in Database**: Loaded into memory by `ColorService` at startup. There is no `brick_colors` table or seed migration in SQLite.
  * In the persisted `Asset` document, the 2D `cells` matrix stores only numeric color IDs (`0` for unpainted, `1..41` for official brick colors).
  * The server exposes the static catalog via the `list_colors` endpoint (JSON-RPC and MCP tool), ensuring both the UI and AI agents query the exact same color definitions dynamically.

---

## 4. Server Testing & Acceptance Criteria

* **Wire Protocol & Persistence BDD Scenarios**:
  * Located in [`features/jsonrpc_protocol.feature`](./features/jsonrpc_protocol.feature), [`features/persistence.feature`](./features/persistence.feature), [`features/health_check.feature`](./features/health_check.feature), and [`features/export_image.feature`](./features/export_image.feature).
  * Verifies JSON-RPC 2.0 error codes (`-32602`, `-32601`), HTTP transport behavior, SQLite restart durability through the APIs, readiness probe health responses, and end-to-end asset image export across protocols.


* **Component Unit & Integration Testing Strategy**:
  * Low-level component contracts are verified via targeted unit and integration test suites during implementation, mapped directly to their Test IDs:
    * `ColorService` (`specs/server/color_service.md`): Verified via Unit Tests (`TEST-SRV-COLOR-01` to `04`).
    * `AssetRepository` (`specs/server/asset_repository.md`): Verified via SQLite Integration Tests (`TEST-SRV-REPO-01` to `05`).
    * `AssetService` (`specs/server/asset_service.md`): Verified via Domain Application Unit Tests (`TEST-SRV-ASSET-01` to `06`).


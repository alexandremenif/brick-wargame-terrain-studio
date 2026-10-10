# SQL Store Specification (Relational Adapters)

This document specifies the relational persistence adapter implementing the abstract `PersistenceStore` contract defined in `specs/01_domain/services.proto`.

---

## 1. Relational Schema Source of Truth

* The target relational schema is declaratively defined in [`schema.dbml`](./schema.dbml).
* The automated pipeline compiles this definition into SQL DDL migrations placed inside `packages/core-engine/src/generated/migrations/`.
* While this specification provides the primary implementation for **SQLite**, the DBML model remains generic and portable to other relational databases (such as PostgreSQL) if server-side multi-user deployment is introduced in the future.

---

## 2. SQLite Store Characteristics

The default adapter for desktop and local web environments is **`SQLiteStore`**:

1. **WAL (Write-Ahead Logging) Mode**:
   Always enabled (`PRAGMA journal_mode = WAL;`) to support concurrent non-blocking reads and writes between MCP tools, background workers, and the Web UI.
2. **Referential Integrity**:
   Foreign key constraints enforced (`PRAGMA foreign_keys = ON;`).
3. **Spatial Indexing**:
   Composite B-Tree index on `(tilemap_id, x, y)` providing sub-millisecond Bounding Box queries over 26,550+ studs.
4. **Versioned Migrations**:
   The baseline migration `0001_initial_schema.sql` is generated directly from `schema.dbml` via `npm run codegen`.
5. **Zero Disk Polling**:
   All transactions are synchronous and thread-safe within the unified Node.js process runtime.

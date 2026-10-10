# Persistence Layer Specification

This section specifies the persistence abstraction, storage ports, and concrete adapter implementations for **LEGO Wargame Terrain Studio**.

---

## 1. Architectural Philosophy: Ports and Adapters (Hexagonal)

The core domain does not interact with physical databases directly. Instead, it relies on an abstract port contract:

```
[ Terrain Engine / Domain Core ]
                 │
                 ▼ (calls port)
     ┌───────────────────────┐
     │   PersistenceStore    │  (Abstract Service Port defined in specs/01_domain/services.proto)
     └───────────────────────┘
                 ▲
       ┌─────────┴─────────┐
       │                   │ (implements)
┌──────────────┐    ┌──────────────┐
│  SQLStore    │    │ MemoryStore  │
│ (SQLite WAL) │    │  (Unit Tests)│
└──────────────┘    └──────────────┘
```

The domain treats `PersistenceStore` as a pure black box ensuring atomic mutations, history append operations, and spatial bounding box queries.

---

## 2. Persistence Adapters

1. [**SQL Store Specification**](./sql_store.md):
   * Production-grade relational adapter.
   * Default implementation: **SQLite in WAL (Write-Ahead Logging) mode** with foreign key constraints.
   * Declarative relational schema defined in [`schema.dbml`](./schema.dbml), shared across SQL-compliant backends.
   * Composite B-Tree spatial indexing on `(tilemap_id, x, y)` for fast rectangular window retrieval.

2. [**In-Memory Store Specification**](./memory_store.md):
   * Ultra-fast, zero-IO storage adapter designed for automated unit tests, headless simulations, and sandboxed test environments.
   * Deterministic state snapshots and fast rollbacks without disk file management.

---

## 3. Declarative Schema Source of Truth

The relational database structure is maintained declaratively in [`schema.dbml`](./schema.dbml).
Executing `npm run codegen` automatically compiles this DBML schema into SQL baseline migrations under `packages/core-engine/src/generated/migrations/`.

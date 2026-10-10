# Reference: Maintaining specs/03_persistence/ (Persistence & Storage)

## Purpose
The `specs/03_persistence/` directory defines the persistence architecture, storage adapters, and declarative relational schemas.

## Structure
* `index.md`: Generic `PersistenceStore` port definition, Hexagonal architecture overview, and adapter inventory.
* `sql_store.md`: SQL-based adapter specifications (transactions, spatial indexing, SQLite WAL mode).
* `memory_store.md`: In-memory adapter specifications (zero-IO, deterministic unit tests, snapshot/rollback).
* `schema.dbml`: Portable relational database schema definition.

## Golden Rules
* Any new table, column, constraint, or index must be authored in `schema.dbml`.
* After modifying `schema.dbml`, immediately run:
  ```bash
  npm run codegen
  ```
  The compiler automatically generates the baseline SQLite DDL migration into `packages/core-engine/src/generated/migrations/0001_initial_schema.sql`.
* For subsequent schema versions (v2+), incremental migration scripts `0002_*.sql` should be authored.

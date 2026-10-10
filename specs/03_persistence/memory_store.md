# In-Memory Store Specification (Test & Simulation Adapter)

This document specifies the in-memory persistence adapter implementing the abstract `PersistenceStore` contract defined in `specs/01_domain/services.proto`.

---

## 1. Purpose & Motivation

* **Fast Deterministic Testing**:
  Running unit and integration tests against disk databases or SQLite temp files incurs I/O overhead and complex teardown logic. The `MemoryStore` provides sub-millisecond execution for test suites.
* **Ephemeral Sandboxing**:
  Provides an isolated store instance for ephemeral scenario simulations, benchmark testing, and headless CLI validations without touching `terrain.db`.

---

## 2. Technical Characteristics

1. **Pure In-Memory Collections**:
   * Uses JavaScript `Map<string, CellData>` and `Map<string, PresetInstance>` keyed by compound coordinate strings (e.g. `x:y`) for $O(1)$ lookups.
2. **Deterministic Bounding Box Range Scans**:
   * Simulates spatial range queries using spatial coordinates filtering on memory maps.
3. **Snapshot & Fast Reset**:
   * Supports instant state snapshotting and restoration to simplify test setups and assertion isolation.
4. **Zero External Dependencies**:
   * Contains no native C++ bindings, SQLite drivers, or filesystem locks.

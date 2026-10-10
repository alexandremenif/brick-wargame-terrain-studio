# Reference: Maintaining specs/01_domain/ (Domain & Contracts)

## Purpose
The `specs/01_domain/` directory contains conceptual models, invariants, and declarative contracts for domain models and service interfaces.

## Structure
* `index.md`: Aggregate descriptions (`TerrainMap`, `CellMatrix`, `PresetInstance`, `ActionHistory`), spatial invariants, and port/adapter boundaries.
* `domain.proto`: Protobuf data structures (`BoundingBox`, `CellData`, `PresetInstance`, `TilemapSummary`, etc.).
* `services.proto`: Service contracts:
  * `service PersistenceStore`: internal storage port.
  * `service TerrainEngineService`: engine command facade.

## Golden Rules
* Any new domain data type or service method MUST be declared in contract files first.
* Always adhere to strict `proto3` syntax.
* **Mandatory Codegen**: Any approved edit in contract files requires running:
  ```bash
  npm run codegen
  ```
* NEVER manually edit generated files in `packages/core-engine/src/generated/domain/`.

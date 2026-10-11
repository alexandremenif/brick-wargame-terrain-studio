# Server Component: ColorService

## 1. Role & Responsibilities
The `ColorService` is the server component responsible for loading, parsing, and serving the authoritative list of official brick colors from the static file ([`specs/domain/colors.csv`](../../domain/colors.csv)).

It operates purely in-memory, ensuring that the database remains unpolluted with static reference data while guaranteeing fast lookup and color validation for both JSON-RPC API requests and MCP AI tool calls.

---

## 2. Operations & Contract

* **Data Model**:
  * `BrickColor`: structured record containing integer `id`, string `name`, and hex color string `hex` (format `#RRGGBB`). Defined in [`specs/domain/schemas/model.yaml`](../../domain/schemas/model.yaml).

* **Operations**:
  * **Load Colors**:
    * Input: optional file path (defaults to static catalog location).
    * Behavior: Reads and parses CSV file once during server startup / bootstrap.
    * Output: None (asynchronous initialization).
  * **List Colors**:
    * Input: None.
    * Behavior: Returns all available official brick colors.
    * Output: Array of `BrickColor` records.
  * **Get Color by ID**:
    * Input: numeric color identifier `id`.
    * Behavior: Retrieves specific brick color by ID.
    * Output: `BrickColor` record, or undefined/null if ID does not exist.
  * **Validate Color ID**:
    * Input: numeric color identifier `id`.
    * Behavior: Checks whether the given numeric ID exists in the catalog.
    * Output: Boolean (`true` if valid, `false` otherwise).

---

## 3. Operational Requirements

* **File Source**:
  * Authoritative data source is `specs/domain/colors.csv` (or packaged build artifact).
  * Header line: `id,name,hex`.
  * Exactly 41 official colors must be parsed into memory.
* **Error Handling**:
  * If the file is missing, unreadable, or contains corrupted rows during startup, the server startup must abort with a descriptive fatal error.
* **Immutability & Permanent In-Memory Caching**:
  * **Zero Repeated Disk I/O**: The CSV file is read and parsed exactly once upon initialization.
  * All 41 `BrickColor` records are retained in an immutable in-memory cache (e.g., indexed by ID via a Map or hash lookup table) for the entire lifetime of the server process.
  * Subsequent calls to `listColors()`, `getColorById(id)`, and `isValidColorId(id)` serve responses exclusively from this high-performance in-memory cache in $O(1)$ time with zero file system access.
* **Integration with Inbound Adapters**:
  * Powers the `list_colors` JSON-RPC method (`openrpc.yaml`).
  * Powers the `list_colors` MCP tool (`mcp.md`).
  * Used by the domain engine / command handlers to validate `colorId` in `paintArea` requests before persistence.

---

## 4. Acceptance Criteria & Test IDs

* `TEST-SRV-COLOR-01`: `ColorService` correctly parses all 41 colors with valid integer `id`, string `name`, and `#RRGGBB` `hex`.
* `TEST-SRV-COLOR-02`: Validates color IDs (`true` for official IDs like 194, 28, 37; `false` for nonexistent IDs like 9999, -1).
* `TEST-SRV-COLOR-03`: `listColors` returns the complete list of 41 `BrickColor` records.
* `TEST-SRV-COLOR-04`: After initial load, repeated calls to `listColors`, `getColorById`, and `isValidColorId` are served strictly from the in-memory cache without re-reading the CSV file.

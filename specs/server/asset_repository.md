# Server Component: AssetRepository

## 1. Role & Responsibilities
The `AssetRepository` is the persistence abstraction responsible for managing the full lifecycle (CRUD) of the `Asset` aggregate root within SQLite using a single-table document (`JSONB`) architecture with stored derived summary columns.

Following Domain-Driven Design (DDD) principles:
* The repository operates **strictly at the Aggregate boundary (`Asset`)**.
* The entire `Asset` aggregate DTO (including its 2D row-major `cells` color ID matrix) is persisted atomically as a binary `JSONB` payload in `assets.data`.
* Mutations (such as painting or resizing) are executed on the `Asset` aggregate root in memory, which enforces domain invariants before the repository persists the updated aggregate document.

---

## 2. Operations & Contract

* **Data Types**:
  * `Asset`: Complete domain aggregate root containing identifier `id`, string `name`, dimensions `width` and `height`, `paintedCellsCount`, and 2D row-major `cells: number[][]` matrix (`0` for unpainted, $\ge 1$ for official brick color ID). Defined in [`specs/domain/schemas/model.yaml`](../../domain/schemas/model.yaml).
  * `AssetSummary`: Lightweight projection of the `Asset` containing `id`, `name`, `width`, `height`, and `paintedCellsCount`, queried directly from `STORED` generated scalar columns without reading or parsing the `data` `JSONB` payload.

* **Repository Operations**:
  * **Create Asset**:
    * Input: `Asset` aggregate root.
    * Behavior: Serializes `asset.toDto()` into SQLite `JSONB` (`jsonb(?)`) and inserts the row into `assets`. SQLite automatically populates the `STORED` generated columns (`name`, `width`, `height`, `painted_cells_count`) and verifies `CHECK (id = (data ->> '$.id'))`.
    * Output: None (asynchronous completion).
  * **Find Asset by ID**:
    * Input: string asset identifier `id`.
    * Behavior: Queries `SELECT json(data) AS data FROM assets WHERE id = ?` and reconstitutes the `Asset` aggregate root from the parsed JSON document.
    * Output: Complete `Asset` aggregate root, or null if not found.
  * **List All Assets**:
    * Input: None.
    * Behavior: Queries the `STORED` scalar summary columns (`id`, `name`, `width`, `height`, `painted_cells_count`) from `assets` sorted by creation date descending (`created_at DESC, rowid DESC`), avoiding overflow page reads or JSON parsing.
    * Output: Array of `AssetSummary` records.
  * **Update Asset**:
    * Input: Modified `Asset` aggregate root.
    * Behavior: Atomically updates `data = jsonb(?)` and `updated_at = CURRENT_TIMESTAMP` for `WHERE id = ?`. SQLite automatically recomputes all `STORED` derived summary columns and enforces identity consistency via `CHECK (id = (data ->> '$.id'))`.
    * Output: None (asynchronous completion).
  * **Delete Asset**:
    * Input: string asset identifier `id`.
    * Behavior: Permanently deletes the asset document row from `assets`.
    * Output: None (asynchronous completion).

---

## 3. Operational Requirements & Database Rules

* **Single-Table `JSONB` Document + Derived Summary Columns**:
  * `data BLOB NOT NULL CHECK (json_valid(data, 4))` stores the validated SQLite `JSONB` representation of the `Asset` DTO.
  * `id VARCHAR(36) PRIMARY KEY NOT NULL CHECK (id = (data ->> '$.id'))` guarantees that the relational primary key and the document's internal `$.id` can never drift on `INSERT` or `UPDATE`.
  * `name`, `width`, `height`, and `painted_cells_count` are defined as `GENERATED ALWAYS AS (...) STORED NOT NULL` columns positioned **before** `data` in the table definition so scalar summary queries read only the main B-tree page prefix.

---

## 4. Acceptance Criteria & Test IDs

* `TEST-SRV-REPO-01`: `create` persists the asset aggregate as `JSONB` and allows subsequent `findById` to reconstitute the exact 2D cell grid state.
* `TEST-SRV-REPO-02`: `update` replaces the `JSONB` document and automatically synchronizes `STORED` derived summary columns and `updated_at` atomically.
* `TEST-SRV-REPO-03`: `update` persists cropped 2D cell matrices when the aggregate dimensions are downsized.
* `TEST-SRV-REPO-04`: `delete` permanently removes the asset aggregate row.
* `TEST-SRV-REPO-05`: `listAll` returns all asset summaries from derived scalar columns sorted by `created_at DESC` without loading cell matrices.

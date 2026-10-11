# Server Component: AssetRepository

## 1. Role & Responsibilities
The `AssetRepository` is the persistence abstraction responsible for managing the full lifecycle (CRUD) of the `Asset` aggregate root and its encapsulated child entity cells within SQLite.

Following Domain-Driven Design (DDD) principles:
* The repository operates **strictly at the Aggregate boundary (`Asset`)**.
* External callers cannot persist or mutate internal cells directly in isolation.
* Mutations (such as painting or resizing) are executed on the `Asset` aggregate root, which enforces domain invariants before the repository persists the entire updated aggregate state.

---

## 2. Operations & Contract

* **Data Types**:
  * `Asset`: Complete domain aggregate root containing identifier `id`, string `name`, dimensions `width` and `height`, timestamps, and array of child `CellData` elements. Defined in [`specs/domain/schemas/model.yaml`](../../domain/schemas/model.yaml).
  * `AssetSummary`: Lightweight projection of the `Asset` containing `id`, `name`, `width`, `height`, `created_at`, `updated_at`, without loading cell records.

* **Repository Operations**:
  * **Create Asset**:
    * Input: `Asset` aggregate root.
    * Behavior: Persists the newly created asset record and any initial cells within an atomic transaction.
    * Output: None (asynchronous completion).
  * **Find Asset by ID**:
    * Input: string asset identifier `id`.
    * Behavior: Reconstitutes the full aggregate root from the `assets` and `cells` tables.
    * Output: Complete `Asset` aggregate root, or null if not found.
  * **List All Assets**:
    * Input: None.
    * Behavior: Queries all asset summary records sorted by creation date descending (`created_at DESC`), omitting cell data for low latency.
    * Output: Array of `AssetSummary` records.
  * **Update Asset**:
    * Input: Modified `Asset` aggregate root.
    * Behavior: Atomically updates asset metadata, synchronizes cell states (upserting painted cells, deleting erased cells), and trims cells outside updated dimensions ($x \ge W$ or $y \ge H$).
    * Output: None (asynchronous completion).
  * **Delete Asset**:
    * Input: string asset identifier `id`.
    * Behavior: Permanently deletes the asset record, relying on database foreign key cascade to remove all associated child cells.
    * Output: None (asynchronous completion).

---

## 3. Operational Requirements & Database Rules

* **Aggregate Transaction Boundary**:
  * Every mutation (`create`, `update`, `delete`) executes within an explicit `BEGIN TRANSACTION ... COMMIT` block.
  * In SQLite WAL mode, transactions guarantee ACID atomicity and consistency across `assets` and `cells` tables.
* **Cell Synchronization on Update**:
  * When `update(asset)` is called, the repository reconciles the aggregate's cell state against the `cells` table:
    - Painted cells are upserted: `INSERT INTO cells (asset_id, x, y, color_id) VALUES (?, ?, ?, ?) ON CONFLICT(asset_id, x, y) DO UPDATE SET color_id = excluded.color_id`.
    - Cells cleared to unpainted/erased in the aggregate are deleted from the table.
    - If dimensions were reduced ($W_{new} < W_{old}$ or $H_{new} < H_{old}$), cells with $x \ge W_{new}$ or $y \ge H_{new}$ are deleted.
    - Updates `assets.updated_at` to the current timestamp.
* **Cascade Deletion**:
  * Foreign key constraint `Ref: cells.asset_id > assets.id [delete: cascade]` is enforced (`PRAGMA foreign_keys = ON;`), guaranteeing zero orphaned cells upon aggregate deletion.

---

## 4. Acceptance Criteria & Test IDs

* `TEST-SRV-REPO-01`: `create` persists the asset aggregate and allows subsequent `findById` to reconstitute the exact state.
* `TEST-SRV-REPO-02`: `update` synchronizes cell mutations and timestamp updates on the `Asset` aggregate atomically.
* `TEST-SRV-REPO-03`: `update` trims cells outside boundaries when the aggregate dimensions are downsized.
* `TEST-SRV-REPO-04`: `delete` permanently removes the aggregate and cascades deletion to all child cells.
* `TEST-SRV-REPO-05`: `listAll` returns all asset summaries sorted by `created_at DESC` without loading cell arrays.

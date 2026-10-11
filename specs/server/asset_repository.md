# Server Component: AssetRepository

## 1. Role & Responsibilities
The `AssetRepository` is the persistence abstraction responsible for managing the full lifecycle (CRUD) of the `Asset` aggregate root and its encapsulated child entity cells within SQLite.

Following Domain-Driven Design (DDD) principles:
* The repository operates **strictly at the Aggregate boundary (`Asset`)**.
* External callers cannot persist or mutate internal cells directly in isolation.
* Mutations (such as painting or resizing) are executed on the `Asset` aggregate root, which enforces domain invariants before the repository persists the entire updated aggregate state.

---

## 2. Interface Specification

```typescript
import { Asset } from '../../domain/schemas/model';

export type AssetSummary = Omit<Asset, 'cells'>;

export interface AssetRepository {
  /**
   * Persists a newly created Asset aggregate root and its initial cells.
   * Executed within an atomic SQLite transaction.
   */
  create(asset: Asset): Promise<void>;

  /**
   * Retrieves an Asset by its unique identifier, reconstituting the full aggregate root
   * including its dimensions, name, and all painted cells.
   * Returns null if no asset with the specified ID exists.
   */
  findById(id: string): Promise<Asset | null>;

  /**
   * Lists all asset summaries (id, name, width, height, created_at, updated_at).
   * Does not load cells into memory for lightweight dropdown listing.
   */
  listAll(): Promise<AssetSummary[]>;

  /**
   * Persists changes to an existing Asset aggregate root:
   * - Updates name, width, height, and updated_at in the `assets` table.
   * - Synchronizes the state of cells (upserts modified cells, removes erased cells).
   * - Trims any cells that fall outside updated dimensions (x >= width OR y >= height).
   * Executed within an atomic SQLite transaction.
   */
  update(asset: Asset): Promise<void>;

  /**
   * Permanently deletes an Asset aggregate and cascades deletion to all associated cells.
   * Executed within an atomic SQLite transaction.
   */
  delete(id: string): Promise<void>;
}
```

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

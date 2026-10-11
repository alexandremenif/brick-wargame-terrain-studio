# Server Component: AssetRepository

## 1. Role & Responsibilities
The `AssetRepository` is the persistence abstraction responsible for managing the full lifecycle (CRUD) of the `Asset` aggregate root and its nested child entity cells within SQLite.

It mediates between the in-memory domain aggregate `Asset` (containing dimensions, name, and cell state) and the underlying relational SQLite database tables (`assets` and `cells` defined in [`schema.dbml`](./schema.dbml)).

---

## 2. Interface Specification

```typescript
import { Asset, CellData } from '../../domain/schemas/model';

export interface IAssetRepository {
  /**
   * Persists a newly created Asset aggregate root and any initial cells.
   * Executed within a SQLite transaction.
   */
  create(asset: Asset): Promise<void>;

  /**
   * Retrieves an Asset by its unique identifier, reconstituting the aggregate root
   * including its dimensions, name, and all painted cells.
   * Returns null if no asset with the specified ID exists.
   */
  findById(id: string): Promise<Asset | null>;

  /**
   * Lists all asset headers (id, name, width, height, created_at, updated_at).
   * Note: Does not populate full cells array for performance when listing.
   */
  listAll(): Promise<Array<Omit<Asset, 'cells'>>>;

  /**
   * Updates an existing Asset aggregate:
   * - Saves updated name, width, and height to the `assets` table.
   * - Trims/deletes any cells whose coordinates fall outside new bounds (x >= width OR y >= height).
   * Executed within a SQLite transaction.
   */
  update(asset: Asset): Promise<void>;

  /**
   * Permanently deletes an Asset and cascades deletion to all associated cells.
   * Executed within a SQLite transaction.
   */
  delete(id: string): Promise<void>;

  /**
   * Atomically paints or erases a batch of cells within the Asset aggregate.
   * For each cell:
   *   - If colorId is a valid number: UPSERT into `cells` (asset_id, x, y, color_id).
   *   - If colorId is null: DELETE FROM `cells` WHERE asset_id = ? AND x = ? AND y = ?.
   * Updates `assets.updated_at` timestamp.
   * Executed within a SQLite transaction.
   */
  saveCells(assetId: string, cells: CellData[]): Promise<void>;
}
```

---

## 3. Operational Requirements & Database Rules

* **Transaction Boundary**:
  * Every write operation (`create`, `update`, `delete`, `saveCells`) must execute within an explicit `BEGIN TRANSACTION ... COMMIT` block.
  * In SQLite with WAL mode, transactions guarantee atomicity and durability (ACID).
* **Cascade Deletion**:
  * When `delete(id)` is invoked, foreign key constraint `Ref: cells.asset_id > assets.id [delete: cascade]` automatically cleans up all associated records in `cells`. SQLite foreign key constraints (`PRAGMA foreign_keys = ON;`) must be explicitly enabled upon connection.
* **Spatial Cell Lookup & Upsert**:
  * The `cells` table uses composite primary key `(asset_id, x, y)`.
  * Painting uses SQLite `INSERT INTO cells (asset_id, x, y, color_id) VALUES (?, ?, ?, ?) ON CONFLICT(asset_id, x, y) DO UPDATE SET color_id = excluded.color_id`.
  * Erasing uses `DELETE FROM cells WHERE asset_id = ? AND x = ? AND y = ?`.
* **Dimension Downsizing**:
  * When `update(asset)` reduces dimensions, the repository automatically executes:
    `DELETE FROM cells WHERE asset_id = ? AND (x >= ? OR y >= ?)`, ensuring aggregate invariants are preserved in storage.

---

## 4. Acceptance Criteria & Test IDs

* `TEST-SRV-REPO-01`: `create` persists the asset metadata and allows subsequent `findById` to reconstitute the exact aggregate.
* `TEST-SRV-REPO-02`: `saveCells` atomically upserts painted cells and deletes erased cells (`colorId: null`).
* `TEST-SRV-REPO-03`: `update` changes dimensions and deletes cells outside new boundaries.
* `TEST-SRV-REPO-04`: `delete` permanently removes the asset and cascades to all its cells.
* `TEST-SRV-REPO-05`: `listAll` returns all assets sorted by `created_at DESC`.

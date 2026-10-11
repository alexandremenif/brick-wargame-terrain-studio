# Server Component: AssetService

## 1. Role & Responsibilities
The `AssetService` is the core application/domain service mediating between inbound protocol adapters (OpenRPC HTTP router and MCP AI adapter) and the persistence layer (`AssetRepository`).

It coordinates application use-cases on the `Asset` aggregate root:
* Translates incoming domain commands (`CreateAssetCommand`, `UpdateAssetCommand`, `GetAssetCommand`, `DeleteAssetCommand`, `PaintAreaCommand`, `ListAssetsCommand`) into domain operations.
* Validates business invariants and cross-cutting rules (such as validating color IDs against `ColorService`).
* Coordinates domain aggregate loading, mutation execution, and atomic persistence through `AssetRepository`.

---

## 2. Interface Specification

```typescript
import {
  CreateAssetCommand,
  CreateAssetResponse,
  UpdateAssetCommand,
  UpdateAssetResponse,
  GetAssetCommand,
  GetAssetResponse,
  DeleteAssetCommand,
  DeleteAssetResponse,
  PaintAreaCommand,
  PaintAreaResponse,
  ListAssetsResponse,
} from '../../domain/schemas/commands';

export interface IAssetService {
  /**
   * Creates a new Asset aggregate with validated dimensions and persists it.
   */
  createAsset(cmd: CreateAssetCommand): Promise<CreateAssetResponse>;

  /**
   * Retrieves an Asset by its ID. Throws NotFound error if not present.
   */
  getAsset(cmd: GetAssetCommand): Promise<GetAssetResponse>;

  /**
   * Lists summaries of all existing assets for dropdown selection.
   */
  listAssets(): Promise<ListAssetsResponse>;

  /**
   * Updates an Asset's name and/or dimensions.
   * Enforces dimension bounds ($1 \le W, H \le 1000$).
   * If downsized, cells outside new dimensions are automatically trimmed.
   */
  updateAsset(cmd: UpdateAssetCommand): Promise<UpdateAssetResponse>;

  /**
   * Deletes an Asset and cascades deletion to all associated cells.
   */
  deleteAsset(cmd: DeleteAssetCommand): Promise<DeleteAssetResponse>;

  /**
   * Paints or erases a rectangular area on the Asset aggregate:
   * 1. Loads Asset aggregate via AssetRepository.
   * 2. Validates colorId against ColorService (if not null).
   * 3. Executes aggregate domain method `asset.paintArea(cmd.bbox, cmd.colorId)`:
   *    - Clips coordinates to asset bounds ($[0, W-1] \times [0, H-1]$).
   *    - Updates internal cell collection.
   * 4. Persists the modified aggregate via AssetRepository.update(asset).
   * 5. Returns updated asset state and modified cell count.
   */
  paintArea(cmd: PaintAreaCommand): Promise<PaintAreaResponse>;
}
```

---

## 3. Operational Requirements & Domain Workflow

* **Dependency Injection**:
  * `AssetService` requires an instance of `IAssetRepository` and `IColorService`.
  * It has zero direct dependency on HTTP transports, JSON-RPC routers, or MCP SDKs.
* **Domain Error Mapping**:
  * Missing asset ID $\rightarrow$ throws `AssetNotFoundError` (mapped by RPC router to `-32602` or custom application error).
  * Invalid color ID $\rightarrow$ throws `InvalidColorIdError` when `colorId` is not null and not found in `ColorService`.
  * Out of bounds dimension values $\rightarrow$ throws `InvalidDimensionsError`.
* **Atomicity & Aggregate Invariant Preservation**:
  * Every command execution operates on the single `Asset` aggregate.
  * Ensures that cell coordinates never exceed asset dimensions and unpainted cells are never persisted as dummy records.

---

## 4. Acceptance Criteria & Test IDs

* `TEST-SRV-ASSET-01`: `createAsset` validates input, generates a unique ID, persists the aggregate, and returns the created `Asset`.
* `TEST-SRV-ASSET-02`: `getAsset` returns the reconstituted aggregate including all painted cells.
* `TEST-SRV-ASSET-03`: `updateAsset` updates properties, trims cells when downsized, and persists the modified aggregate.
* `TEST-SRV-ASSET-04`: `deleteAsset` permanently removes the asset via the repository and returns `success: true`.
* `TEST-SRV-ASSET-05`: `paintArea` validates the color ID via `ColorService`, mutates cells on the `Asset` aggregate with clipping, persists the updated aggregate, and returns the result.
* `TEST-SRV-ASSET-06`: `paintArea` with `colorId: null` erases cells within the specified bounding box.

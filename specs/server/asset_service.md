# Server Component: AssetService

## 1. Role & Responsibilities
The `AssetService` is the core application/domain service mediating between inbound protocol adapters (OpenRPC HTTP router and MCP AI adapter) and the persistence layer (`AssetRepository`).

It coordinates application use-cases on the `Asset` aggregate root:
* Translates incoming domain commands (`CreateAssetCommand`, `UpdateAssetCommand`, `GetAssetCommand`, `DeleteAssetCommand`, `PaintAreaCommand`, `ListAssetsCommand`) into domain operations.
* Validates business invariants and cross-cutting rules (such as validating color IDs against `ColorService`).
* Coordinates domain aggregate loading, mutation execution, and atomic persistence through `AssetRepository`.

---

## 2. Operations & Contract

All command and response payloads are formally defined in declarative YAML schemas ([`specs/domain/schemas/commands.yaml`](../../domain/schemas/commands.yaml)).

* **Create Asset**:
  * Input: `CreateAssetCommand` (name, width, height).
  * Behavior: Validates dimensions ($1 \le W, H \le 1000$), constructs a new `Asset` aggregate with a generated UUID, and persists via `AssetRepository.create`.
  * Output: `CreateAssetResponse` containing created `Asset`.

* **Get Asset**:
  * Input: `GetAssetCommand` (assetId).
  * Behavior: Retrieves asset via `AssetRepository.findById`. Throws not found error if absent.
  * Output: `GetAssetResponse` containing complete `Asset` aggregate with all painted cells.

* **List Assets**:
  * Input: None.
  * Behavior: Fetches asset summaries from `AssetRepository.listAll`.
  * Output: `ListAssetsResponse` containing array of `AssetSummary` records.

* **Update Asset**:
  * Input: `UpdateAssetCommand` (assetId, optional name, optional width, optional height).
  * Behavior: Loads aggregate, validates new dimensions ($1 \le W, H \le 1000$), applies updates, and persists via `AssetRepository.update`. If downsized, cells outside new dimensions are trimmed.
  * Output: `UpdateAssetResponse` containing updated `Asset`.

* **Delete Asset**:
  * Input: `DeleteAssetCommand` (assetId).
  * Behavior: Cascades deletion of asset and all cells via `AssetRepository.delete`.
  * Output: `DeleteAssetResponse` with `success: true`.

* **Paint Area**:
  * Input: `PaintAreaCommand` (assetId, bbox, colorId).
  * Behavior:
    1. Loads `Asset` aggregate via `AssetRepository.findById`.
    2. Validates `colorId` against `ColorService` (when `colorId > 0`; `colorId === 0` is the eraser sentinel).
    3. Invokes aggregate domain method `asset.paintArea(bbox, colorId)` which leniently clips coordinates to $[0, W-1] \times [0, H-1]$ and updates internal cells (or resets them to `0` if `colorId === 0`).
    4. Persists the modified aggregate via `AssetRepository.update(asset)`.
  * Output: `PaintAreaResponse` containing number of modified cells.

---

## 3. Operational Requirements & Domain Workflow

* **Dependency Injection**:
  * `AssetService` requires an instance of `AssetRepository` and `ColorService`.
  * It has zero direct dependency on HTTP transports, JSON-RPC routers, or MCP SDKs.
* **Domain Error Mapping**:
  * Missing asset ID $\rightarrow$ throws `AssetNotFoundError` (mapped by RPC router to `-32602` or custom application error).
  * Invalid color ID $\rightarrow$ throws `InvalidColorIdError` when `colorId !== 0` and not found in `ColorService`.
  * Out of bounds dimension values $\rightarrow$ throws `InvalidDimensionsError`.
* **Atomicity & Aggregate Invariant Preservation**:
  * Every command execution operates on the single `Asset` aggregate.
  * Ensures that the 2D `cells` matrix strictly matches `height` $\times$ `width` and unpainted cells are represented by `0`.

---

## 4. Acceptance Criteria & Test IDs

* `TEST-SRV-ASSET-01`: `createAsset` validates input, generates a unique ID, persists the aggregate, and returns the created `Asset`.
* `TEST-SRV-ASSET-02`: `getAsset` returns the reconstituted aggregate including its 2D `cells` grid.
* `TEST-SRV-ASSET-03`: `updateAsset` updates properties, trims cells when downsized, and persists the modified aggregate.
* `TEST-SRV-ASSET-04`: `deleteAsset` permanently removes the asset via the repository and returns `success: true`.
* `TEST-SRV-ASSET-05`: `paintArea` validates the color ID via `ColorService`, mutates cells on the `Asset` aggregate with clipping, persists the updated aggregate, and returns the result.
* `TEST-SRV-ASSET-06`: `paintArea` with `colorId: 0` erases cells within the specified bounding box back to `0`.

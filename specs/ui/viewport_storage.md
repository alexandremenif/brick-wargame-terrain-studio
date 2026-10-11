# UI Architecture: Viewport Storage Service (Persistence)

## 1. Role & Architectural Responsibilities

The **Viewport Storage Service** provides an isolated, swappable persistence boundary for storing and retrieving viewport configuration state (such as the active `BoundingBox`) across user browser sessions.

By isolating persistence from the runtime state management store, the application gains:
* **Single Responsibility**: The state store focuses strictly on user interactions, clamping invariants, and coordinate math, while the storage service handles serialization, key schema, error resilience, and storage engine interaction.
* **Testability**: UI components and state stores can be tested in isolation using an in-memory storage adapter without relying on browser `localStorage` or mocking globals.
* **Resilience**: The storage service safely encapsulates storage quota exhaustion, private browsing permission blocks, and malformed JSON payloads without crashing or corrupting runtime UI state.

---

## 2. Storage Adapter Contract

### 2.1 Interface & Data Boundaries
The service provides a contract (`ViewportStorageService` or `BoundingBoxStorage`) operating with the canonical domain `BoundingBox`:

* **Key Format**: `bwts:bbox:<assetId>`
* **Serialized Structure**: JSON object with fields:
  * `x`: Integer, origin column.
  * `y`: Integer, origin row.
  * `width`: Positive integer, horizontal span.
  * `height`: Positive integer, vertical span.

### 2.2 Operations

| Operation | Parameters | Return | Behavior & Error Handling |
| :--- | :--- | :--- | :--- |
| `loadBoundingBox` | `assetId`, `assetWidth`, `assetHeight` | `BoundingBox` or `null` | Reads entry `bwts:bbox:<assetId>` and delegates self-healing recovery to `recoverBoundingBox` (defined in [`specs/domain/bounding_box_math.md`](../domain/bounding_box_math.md)) against current asset dimensions $(W, H)$. Returns recovered `BoundingBox`, or `null` if the entry is unrecoverable. |
| `saveBoundingBox` | `assetId`, `boundingBox` | `void` | 1. Serializes `boundingBox` to JSON.<br/>2. Writes to `bwts:bbox:<assetId>`.<br/>3. Catches and swallows storage quota or browser sandbox restrictions, logging a warning without breaking UI execution. |
| `removeBoundingBox` | `assetId` | `void` | Deletes entry for `assetId`. Invoked when an asset is permanently deleted to avoid orphaned storage entries. |

---

### 2.3 Best-Effort Recovery Algorithm for Stale / Modified Assets

Because assets can be modified concurrently (e.g. dimensions resized by an AI agent, by another browser session, or via API updates), stored bounding box data may no longer align with current dimensions $(W, H)$. 

When `loadBoundingBox(assetId, W, H)` is called, the storage adapter processes the payload through a 4-step recovery cascade:

1. **Syntactic & Structural Validation**:
   * If the stored value does not exist, is corrupted JSON, is not an object, or contains non-numeric / `NaN` fields, parsing fails: return `null` (caller defaults to full asset `fitToAsset()`).
   * Read raw values: $(x_{\text{raw}}, y_{\text{raw}}, w_{\text{raw}}, h_{\text{raw}})$. Round each to the nearest integer.

2. **Dimension Recovery ($width, height$)**:
   * Ensure minimum dimensions:
     $$w_1 = \max(1, w_{\text{raw}}), \quad h_1 = \max(1, h_{\text{raw}})$$
   * If the stored width or height exceeds current asset dimensions (e.g. the asset was shrunk from $64\times 64$ to $32\times 32$), cap dimensions to the new maximum:
     $$width = \min(w_1, W), \quad height = \min(h_1, H)$$

3. **Origin Recovery & Boundary Clamping ($x, y$)**:
   * If the stored origin falls outside the valid range (e.g. origin $(x=40, y=40)$ when new size is $32\times 32$), shift the origin to keep the framed region inside the asset:
     $$x = \mathrm{clamp}(x_{\text{raw}}, 0, W - width)$$
     $$y = \mathrm{clamp}(y_{\text{raw}}, 0, H - height)$$

4. **Self-Healing Storage Write-Back**:
   * If any coordinate was adjusted during recovery ($x \ne x_{\text{raw}}$, $y \ne y_{\text{raw}}$, $width \ne w_{\text{raw}}$, or $height \ne h_{\text{raw}}$), the adapter silently writes the healed bounding box back to `localStorage` so future reads are immediately clean and valid.
   * Return the healed `{ x, y, width, height }`.

---

## 3. Implementations

* **`LocalStorageViewportStorage`**: The production web adapter utilizing `window.localStorage`.
* **`MemoryViewportStorage`**: In-memory adapter (holding a `Map<string, BoundingBox>`) utilized in unit tests and automated test suites.

---

## 4. Acceptance Criteria & Test IDs

* `TEST-UI-STORAGE-01`: Storing a bounding box persists serialized coordinates under key `bwts:bbox:<assetId>`.
* `TEST-UI-STORAGE-02`: Loading from non-existent or corrupted storage returns `null`.
* `TEST-UI-STORAGE-03`: Loading a bounding box whose dimensions exceed updated asset dimensions caps width and height to the new maximums.
* `TEST-UI-STORAGE-04`: Loading a bounding box whose origin falls outside resized asset boundaries shifts and clamps coordinates so the box remains fully inside.
* `TEST-UI-STORAGE-05`: Recovering a stale bounding box triggers a self-healing write-back to update `localStorage`.
* `TEST-UI-STORAGE-06`: Storage exceptions (e.g., quota exceeded or access denied) are safely caught and do not halt application execution.
* `TEST-UI-STORAGE-07`: Removing a bounding box deletes the key associated with the specified asset ID.

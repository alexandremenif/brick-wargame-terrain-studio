# Service: ImageExportService

## 1. Role & Architectural Boundaries

The `ImageExportService` is a server application service in `packages/server`. It handles the end-to-end export lifecycle for terrain assets:
* Validates requested export boundaries (`BoundingBox`) against the target asset's dimensions.
* Resolves image export profiles (`'llm'` vs `'print'`).
* Calculates adaptive resolution scales (`computeAdaptivePixelsPerStud`).
* Delegates visual rasterization to the pure domain rendering engine (`renderAssetGrid`) on a headless canvas (`@napi-rs/canvas`).
* Encodes the rendered canvas into a base64 PNG string.

---

## 2. Adaptive Scale Calculation Formula

For the `'llm'` profile (used by JSON-RPC clients and MCP tools), the pixel dimension is dynamically bounded to protect LLM context windows and token budgets:

$$\text{MAX\_ADAPTIVE\_DIMENSION} = 800$$
$$\text{MIN\_PIXELS\_PER\_STUD} = 2$$
$$\text{MAX\_PIXELS\_PER\_STUD} = 16$$

Given export stud dimensions $W_{\text{studs}}$ and $H_{\text{studs}}$:
$$\text{maxStuds} = \max(W_{\text{studs}}, H_{\text{studs}})$$
$$\text{pixelsPerStud} = \max\left(2, \min\left(16, \left\lfloor \frac{800}{\text{maxStuds}} \right\rfloor\right)\right)$$

### Profile Resolution Rules
| Profile | `pixelsPerStud` | Background Mode | Use Case |
| :--- | :--- | :--- | :--- |
| `'llm'` (default) | Adaptive ($\le 800\text{px}$) | `'checkerboard'` | Multimodal LLM inspection & preview |
| `'print'` | Fixed $64\text{px/stud}$ | `'white'` | Physical high-resolution printing |

---

## 3. Boundary Validation Invariants

When an optional `bbox` is provided:
1. $x \ge 0$ and $y \ge 0$
2. $width \ge 1$ and $height \ge 1$
3. $x + width \le asset.width$
4. $y + height \le asset.height$

If any condition is violated, the service rejects the request with standard OpenRPC error code `-32602` (`"Invalid params: Bounding box exceeds asset boundaries"`).

---

## 4. Acceptance Criteria & Test IDs

* `TEST-SRV-EXP-01`: Exports full asset with `'llm'` profile using adaptive scaling and checkerboard transparency.
* `TEST-SRV-EXP-02`: Exports full asset with `'print'` profile at $64\text{px/stud}$ with solid white background.
* `TEST-SRV-EXP-03`: Exports framed bounding box sub-region within asset boundaries.
* `TEST-SRV-EXP-04`: Throws `-32602` invalid params when bounding box exceeds asset bounds.

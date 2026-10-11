# Domain Operations: Bounding Box Mathematics & Clamping Rules

## 1. Role & Architectural Boundaries

In **Brick Wargame Terrain Studio**, a `BoundingBox` is a core domain value object representing a 2D discrete rectangular region measured in studs:
$$[x, x + width - 1] \times [y, y + height - 1]$$

Bounding boxes are fundamental across the entire system:
* In the **Domain Engine**, they define the region affected by area painting commands (`paintArea`).
* In the **UI Studio**, they frame the active viewport rendered by `<CanvasViewport>` and highlighted by `<Minimap>`.
* In **AI Tooling / MCP**, they allow agents to query, crop, or modify specific sectors.

To ensure uniform geometric invariants and prevent subtle coordinate calculation discrepancies between backend engines, AI agents, and frontend viewports, the domain mathematical operations and clamping functions on `BoundingBox` are centralized as pure shared functions exported by the domain contract library (`@lego-wargame-terrain-studio/api`).

---

## 2. Mathematical Invariants

Given an asset with dimensions $W \times H$ ($W, H \in \mathbb{Z}^+$):
1. **Dimension Validity**:
   $$1 \le width \le W, \quad 1 \le height \le H$$
2. **Boundary Clamping**:
   $$0 \le x \le W - width, \quad 0 \le y \le H - height$$
3. **Integral Grid Alignment**: All coordinates and spans are strictly integers ($\mathbb{Z}$).

---

## 3. Pure Domain Operations

### 3.1 `clampBoundingBox(bbox, maxW, maxH)`
Clamps both dimensions and position of a bounding box so it fits strictly within an asset of size $maxW \times maxH$:
* **Dimensions**:
  $$width = \mathrm{clamp}(\lfloor bbox.width \rfloor, 1, maxW)$$
  $$height = \mathrm{clamp}(\lfloor bbox.height \rfloor, 1, maxH)$$
* **Origin**:
  $$x = \mathrm{clamp}(\lfloor bbox.x \rfloor, 0, maxW - width)$$
  $$y = \mathrm{clamp}(\lfloor bbox.y \rfloor, 0, maxH - height)$$

### 3.2 `panBoundingBox(bbox, deltaX, deltaY, maxW, maxH)`
Shifts the position of an existing valid bounding box by integer stud offsets $(\Delta x, \Delta y)$ while preserving its dimensions and clamping within asset boundaries:
$$width' = bbox.width, \quad height' = bbox.height$$
$$x' = \mathrm{clamp}(bbox.x + \Delta x, 0, maxW - width')$$
$$y' = \mathrm{clamp}(bbox.y + \Delta y, 0, maxH - height')$$

### 3.3 `centerBoundingBoxAt(targetX, targetY, width, height, maxW, maxH)`
Positions a bounding box of given dimensions such that its center is as close as possible to the target stud coordinate $(targetX, targetY)$:
$$width' = \mathrm{clamp}(width, 1, maxW), \quad height' = \mathrm{clamp}(height, 1, maxH)$$
$$x' = \mathrm{clamp}\left(\lfloor targetX \rfloor - \left\lfloor\frac{width'}{2}\right\rfloor, 0, maxW - width'\right)$$
$$y' = \mathrm{clamp}\left(\lfloor targetY \rfloor - \left\lfloor\frac{height'}{2}\right\rfloor, 0, maxH - height'\right)$$

### 3.4 `zoomBoundingBox(bbox, factor, maxW, maxH)`
Scales the bounding box dimensions proportionally by a positive real scale factor $f$ (e.g. $f \approx 0.8$ for zoom in, $f \approx 1.25$ for zoom out), anchored at the current bounding box center:
1. **Center Calculation**:
   $$c_x = bbox.x + \frac{bbox.width}{2}, \quad c_y = bbox.y + \frac{bbox.height}{2}$$
2. **New Dimensions**:
   $$w_{\text{new}} = \mathrm{clamp}(\mathrm{round}(bbox.width \times f), 1, maxW)$$
   $$h_{\text{new}} = \mathrm{clamp}(\mathrm{round}(bbox.height \times f), 1, maxH)$$
3. **Re-anchored Origin**:
   $$x' = \mathrm{clamp}\left(\mathrm{round}\left(c_x - \frac{w_{\text{new}}}{2}\right), 0, maxW - w_{\text{new}}\right)$$
   $$y' = \mathrm{clamp}\left(\mathrm{round}\left(c_y - \frac{h_{\text{new}}}{2}\right), 0, maxH - h_{\text{new}}\right)$$

### 3.5 `recoverBoundingBox(raw, maxW, maxH)`
Performs best-effort self-healing recovery on raw or potentially corrupt data (from storage, external API, or concurrent edits):
1. Returns `null` if `raw` is not an object or if coordinates cannot be parsed into finite numbers.
2. Applies dimension clamping and origin clamping.
3. Returns a guaranteed-valid `BoundingBox`.

---

## 4. Acceptance Criteria & Test IDs

* `TEST-DOMAIN-BBOX-01`: `clampBoundingBox` constrains coordinates and dimensions to stay within $[0, maxW] \times [0, maxH]$.
* `TEST-DOMAIN-BBOX-02`: `panBoundingBox` shifts origin by delta offsets while preserving dimensions and clamping at boundaries.
* `TEST-DOMAIN-BBOX-03`: `centerBoundingBoxAt` centers bounding box on target stud while maintaining bounding box size and respecting bounds.
* `TEST-DOMAIN-BBOX-04`: `zoomBoundingBox` scales dimensions by the given factor, keeps the center point stable, and respects $1\times 1$ minimum and $maxW \times maxH$ maximum.
* `TEST-DOMAIN-BBOX-05`: `recoverBoundingBox` repairs out-of-bound or floating-point values into valid integer domain bounding boxes, returning `null` on corrupt input.

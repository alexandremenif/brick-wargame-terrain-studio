# Component: Minimap

## 1. Role & Responsibilities
The `<Minimap>` is embedded inside the `<RightInspectorSidebar>`. It provides a birds-eye overview thumbnail of the entire terrain asset ($W \times H$) and visually displays where the current active bounding box $(x, y, width, height)$ is positioned within the overall asset.

---

## 2. Visual Representation & Behavior

* **Whole Asset Overview**:
  * Always renders the entire terrain asset from coordinate $(0, 0)$ to $(W - 1, H - 1)$.
  * Renders painted cells using their respective official brick hex colors, and unpainted cells using the neutral dark checkerboard (`#27272a` / `#18181b`) matching the main canvas viewport transparency rendering.
* **Active Bounding Box Indicator**:
  * Renders a clearly framed region indicator showing the position and size of the current bounding box relative to the full asset:
    $$\text{indicatorX} = \frac{x}{W} \times \text{minimapWidth}, \quad \text{indicatorY} = \frac{y}{H} \times \text{minimapHeight}$$
    $$\text{indicatorW} = \frac{width}{W} \times \text{minimapWidth}, \quad \text{indicatorH} = \frac{height}{H} \times \text{minimapHeight}$$
  * When the bounding box equals the full asset ($(0, 0, W, H)$, e.g. after clicking "Fit to Asset"), the indicator covers the entire minimap thumbnail.
* **Interactive Click-to-Center Navigation**:
  * Clicking anywhere on the minimap thumbnail repositions the active bounding box such that its center moves to the clicked asset coordinate $(C_{\text{target}}, R_{\text{target}})$.
  * The current bounding box dimensions ($width, height$) are preserved.
  * Coordinates are automatically clamped to ensure the bounding box remains fully inside the asset boundaries:
    $$x = \mathrm{clamp}\left(C_{\text{target}} - \left\lfloor\frac{width}{2}\right\rfloor, 0, W - width\right)$$
    $$y = \mathrm{clamp}\left(R_{\text{target}} - \left\lfloor\frac{height}{2}\right\rfloor, 0, H - height\right)$$
  * The main `<CanvasViewport>` and `<RightInspectorSidebar>` numeric inputs update immediately to reflect the new position.
* **Dynamic Responsive Scaling (Preserving Aspect Ratio)**:
  * The entire $W \times H$ asset is scaled to best fit the available dimensions of the container ($W_{\text{avail}} \times H_{\text{avail}}$) while strictly preserving the stud aspect ratio ($W/H$).
  * Zero hardcoded thumbnail dimensions: the container's inner content box is observed dynamically (via `ResizeObserver`), computing:
    $$\text{scale} = \min\left(\frac{W_{\text{avail}}}{W}, \frac{H_{\text{avail}}}{H}\right)$$
    $$\text{minimapWidth} = \max(1, \mathrm{round}(W \times \text{scale})), \quad \text{minimapHeight} = \max(1, \mathrm{round}(H \times \text{scale}))$$
  * The thumbnail is centered horizontally and vertically within the container card with no stretching or distortion.
* **Real-Time Synchronization**:
  * Whenever cells are painted or erased on the canvas, the minimap thumbnail updates in real time.
  * Whenever bounding box parameters change, the bounding box indicator updates immediately.

---

## 3. Visual Ergonomics & Layout

* Contained within the upper section of `<RightInspectorSidebar>`.
* Thumbnail container dimensions: Card styling (`rounded border border-zinc-800 bg-zinc-950 p-2`) with flex alignment centering the thumbnail (`items-center justify-center`).
* Footer label displaying full asset dimensions and current bounding box metrics: e.g. `Asset: 32×32 | BBox: 15×13 at [9, 5]`.

---

## 4. Acceptance Criteria & Test IDs

* `TEST-UI-MINIMAP-01`: Minimap renders the entire asset ($W \times H$) scaled to fit within the thumbnail container.
* `TEST-UI-MINIMAP-02`: When the active bounding box changes, the bounding box indicator on the minimap updates its position and dimensions proportionally.
* `TEST-UI-MINIMAP-03`: When "Fit to Asset" is clicked, the bounding box indicator expands to cover the entire minimap.
* `TEST-UI-MINIMAP-04`: Painting cells on the canvas immediately reflects those color changes in the minimap thumbnail.
* `TEST-UI-MINIMAP-05`: Clicking a point on the minimap centers the bounding box on that coordinate, preserving dimensions and clamping within asset boundaries.
* `TEST-UI-MINIMAP-06`: Minimap canvas strictly preserves the asset stud aspect ratio ($W/H$) and centers the thumbnail within the container without distortion.

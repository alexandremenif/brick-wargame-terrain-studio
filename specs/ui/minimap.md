# Component: Minimap

## 1. Role & Responsibilities
The `<Minimap>` is embedded inside the `<RightInspectorSidebar>`. It provides a birds-eye overview thumbnail of the entire terrain asset ($W \times H$) and visually displays where the current active bounding box $(x, y, width, height)$ is positioned within the overall asset.

---

## 2. Visual Representation & Behavior

* **Whole Asset Overview**:
  * Always renders the entire terrain asset from coordinate $(0, 0)$ to $(W - 1, H - 1)$.
  * Renders painted cells using their respective official brick hex colors, and unpainted cells with the baseplate dark green tone (`#184632`).
* **Active Bounding Box Indicator**:
  * Renders a clearly framed region indicator showing the position and size of the current bounding box relative to the full asset:
    $$\text{indicatorX} = \frac{x}{W} \times \text{minimapWidth}, \quad \text{indicatorY} = \frac{y}{H} \times \text{minimapHeight}$$
    $$\text{indicatorW} = \frac{width}{W} \times \text{minimapWidth}, \quad \text{indicatorH} = \frac{height}{H} \times \text{minimapHeight}$$
  * When the bounding box equals the full asset ($(0, 0, W, H)$, e.g. after clicking "Fit to Asset"), the indicator covers the entire minimap thumbnail.
* **Automatic Scaling**:
  * The entire $W \times H$ asset is scaled to fit within the fixed minimap thumbnail viewport ($208 \times 128$ px) preserving aspect ratio.
* **Real-Time Synchronization**:
  * Whenever cells are painted or erased on the canvas, the minimap thumbnail updates in real time.
  * Whenever bounding box parameters change, the bounding box indicator updates immediately.

---

## 3. Visual Ergonomics & Layout

* Contained within the upper section of `<RightInspectorSidebar>`.
* Thumbnail container dimensions: $224 \times 148$ px with dark card styling (`rounded border border-zinc-800 bg-zinc-950`).
* Footer label displaying full asset dimensions and current bounding box metrics: e.g. `Asset: 32×32 | BBox: 15×13 at [9, 5]`.

---

## 4. Acceptance Criteria & Test IDs

* `TEST-UI-MINIMAP-01`: Minimap renders the entire asset ($W \times H$) scaled to fit within the thumbnail container.
* `TEST-UI-MINIMAP-02`: When the active bounding box changes, the bounding box indicator on the minimap updates its position and dimensions proportionally.
* `TEST-UI-MINIMAP-03`: When "Fit to Asset" is clicked, the bounding box indicator expands to cover the entire minimap.
* `TEST-UI-MINIMAP-04`: Painting cells on the canvas immediately reflects those color changes in the minimap thumbnail.

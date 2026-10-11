# Component: Minimap

## 1. Role & Responsibilities
The `<Minimap>` component provides a scaled 2D overview thumbnail of the entire terrain asset. It visualizes the distribution of painted brick cells and displays the active bounding box selection overlay at a reduced scale, enabling operators to maintain spatial context regardless of viewport dimensions.

## 2. Visual Representation & Behavior
* **Miniature Grid Rendering**:
  * Renders a proportional 2D canvas/SVG scaling the entire asset dimensions ($W \times H$) to fit within the minimap panel (e.g., $128 \times 128$ px thumbnail area).
  * Painted cells are displayed as miniature colored pixels matching their official brick hex colors.
  * Empty cells are shown with the neutral baseplate canvas tone (`#0e0e11`).
* **Active Bounding Box Indicator**:
  * When a bounding box is active $(x, y, width, height)$, the minimap renders a scaled semi-transparent rectangle with a dashed border (`#ec4899`) corresponding to the exact normalized region:
    $$\text{miniX} = \frac{x}{W} \times \text{miniWidth}, \quad \text{miniY} = \frac{y}{H} \times \text{miniHeight}$$
    $$\text{miniW} = \frac{width}{W} \times \text{miniWidth}, \quad \text{miniH} = \frac{height}{H} \times \text{miniHeight}$$
* **Interactive Framing (Click to Frame)**:
  * Clicking on the minimap centers the bounding box or moves the active selection region origin $(x, y)$ to the clicked coordinate.

## 3. Visual Ergonomics & Layout
* Contained within the upper section of `<RightInspectorSidebar>`.
* Fixed thumbnail container dimensions: $224 \times 140$ px with rounded corners (`rounded border border-zinc-800 bg-zinc-950`).
* Footer metrics showing the current asset size ($W \times H$) and thumbnail scaling factor.

## 4. Acceptance Criteria & Test IDs
* `TEST-UI-MINIMAP-01`: Minimap renders all painted cells using their respective official brick colors in real time.
* `TEST-UI-MINIMAP-02`: When the active bounding box changes, the minimap bounding box overlay updates its position and dimensions proportionally.
* `TEST-UI-MINIMAP-03`: When the bounding box is cleared, the overlay in the minimap is hidden.

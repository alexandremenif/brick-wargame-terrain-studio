# Component: SvgViewport

## 1. Role & Responsibilities
The `<SvgViewport>` is the central interactive display of the studio. It renders the asset's discrete 2D cell matrix, painted colors, and the highlighted bounding box overlay using high-performance scalable vector graphics (SVG).

## 2. Flat 2D Print-Ready Rendering
* **Pure Flat 2D Vector Squares**:
  * Outer viewBox sized to $W \times H$ studs (scaled by cell size, e.g. 24px/stud).
  * Dark Green background (`#184632`) for unpainted cells.
  * Painted cells rendered as crisp vector flat rectangles (`<rect>`) with their official hex colors.
  * **No Round Stud Nubs**: To avoid visual clutter, aliasing, and complex printing artifacts on physical tabletop vinyl mats, circular stud nubs are intentionally omitted. The rendering consists of clean, crisp 2D flat square cells with thin vector grid lines.
* **Interactive Pointer Painting**:
  * `onPointerDown`: Immediately applies active brush tool at the clicked stud coordinate.
  * `onPointerMove`: If pointer button is down, continues painting as the user drags across studs.
  * Lenient clipping: Pointer events that drag outside the grid boundary are safely ignored without raising errors.
* **Bounding Box Visual Overlay**:
  * When an active bounding box is defined, an overlaid SVG stroke rectangle (`stroke="#ec4899" stroke-dasharray="4,4" fill="rgba(236,72,153,0.15)"`) clearly delimits the framed region.
* **Cursor Feedback**:
  * Hovering over studs triggers cursor tracking reported to the `<BottomStatusBar>`.

## 3. Acceptance Criteria & Test IDs
* `TEST-UI-VIEWPORT-01`: Clicking or dragging over studs with the active brush paints cells with the active color.
* `TEST-UI-VIEWPORT-02`: Painting with the Eraser tool clears painted studs back to the unpainted base.
* `TEST-UI-VIEWPORT-03`: The active bounding box is visually rendered directly on top of the corresponding stud coordinates.
* `TEST-UI-VIEWPORT-04`: Cursor movement over the grid reports the exact stud $(x, y)$ position.
* `TEST-UI-VIEWPORT-05`: Rendered output consists strictly of 2D flat square cells without circular stud nubs.

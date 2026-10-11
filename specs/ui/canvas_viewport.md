# Component: CanvasViewport

## 1. Role & Responsibilities
The `<CanvasViewport>` is the central high-performance interactive display of the studio. It renders the asset's discrete 2D cell matrix, painted colors, and the highlighted bounding box overlay using an immediate-mode HTML5 2D `<canvas>`.

---

## 2. High-Performance Immediate-Mode 2D Canvas

* **Immediate-Mode 2D Rendering Engine**:
  * Backed by an HTML5 `<canvas>` element (with device-pixel-ratio scaling for sharp high-DPI displays).
  * Sustained **60–120 FPS** during continuous drag-painting, eliminating DOM node allocation, layout reflows, and SVG string serialization overhead.
  * Optimistic local drawing: Brush strokes update the canvas buffer instantaneously, while asynchronous delta commands (`paintArea`) sync state to the backend in the background.

* **Flat 2D Continuous Studs (Print-Ready)**:
  * Dark Green base tone (`#184632`) for unpainted cells.
  * Painted cells drawn directly via `ctx.fillRect()` using authentic hex colors from the official brick palette.
  * **No Round Stud Nubs**: To avoid visual clutter, aliasing, and complex printing artifacts on physical tabletop vinyl mats, circular stud nubs are intentionally omitted. The rendering consists strictly of clean, crisp 2D flat square cells.
  * **Optional Reference Grid**:
    * **Off by default**: Cells touch edge-to-edge for continuous physical terrain preview.
    * **When enabled**: A crisp 1px reference grid overlay (`#27272a`) is drawn to delineate individual stud boundaries.

* **Interactive Pointer Painting**:
  * `onPointerDown`: Immediately applies active brush tool ($1\times 1$ up to $32\times 32$) at the clicked stud coordinate.
  * `onPointerMove`: If the pointer is pressed, continues painting as the user drags across studs.
  * **Lenient Clipping**: Pointer events outside the asset surface ($[0, W-1] \times [0, H-1]$) are safely clipped without raising errors.

* **Bounding Box Visual Overlay**:
  * When an active bounding box is defined $(x, y, width, height)$, an overlaid tinted rectangle with a dashed magenta border (`#ec4899`, `rgba(236,72,153,0.18)`) clearly delimits the framed region.

* **Cursor Tracking & Brush Footprint Preview**:
  * Hovering displays a translucent preview outline matching the active brush size ($1\times 1$ up to $32\times 32$) centered under the pointer.

---

## 3. Acceptance Criteria & Test IDs

* `TEST-UI-VIEWPORT-01`: Clicking or dragging over studs with the active brush paints cells with the active color without dropped frames.
* `TEST-UI-VIEWPORT-02`: Painting with the Eraser tool clears painted studs back to the unpainted base.
* `TEST-UI-VIEWPORT-03`: The active bounding box is visually rendered directly on top of the corresponding stud coordinates.
* `TEST-UI-VIEWPORT-04`: Cursor movement over the grid reports the exact stud $(x, y)$ position.
* `TEST-UI-VIEWPORT-05`: Rendered output consists strictly of 2D flat square cells without circular stud nubs.
* `TEST-UI-VIEWPORT-06`: Toggling the grid mode switches between continuous flat surfaces and overlaid reference grid lines.

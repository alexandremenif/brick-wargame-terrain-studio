# Component: CanvasViewport

## 1. Role & Responsibilities
The `<CanvasViewport>` is the central interactive editing area. It displays the **active bounding box region** of the terrain asset:
$$[x, x + width - 1] \times [y, y + height - 1]$$
Using an immediate-mode HTML5 2D `<canvas>`, it renders flat 2D studs at sustained 60–120 FPS and processes single-click painting actions.

---

## 2. Visual Representation & Styling

* **View of the Active Bounding Box**:
  * The canvas viewport displays the studs framed by the current bounding box parameters $(x, y, width, height)$.
  * There is **no bounding box frame or outline drawn over the canvas**; the bounds of the canvas viewport *are* the active bounding box view.
  * When bounding box parameters change in the Inspector, the canvas viewport re-frames immediately to show the specified subregion.
  * On initial asset creation or load, the bounding box defaults to the full asset ($(0, 0, W, H)$), displaying the entire terrain.
* **Automatic Best-Fit with No Scrolling**:
  * The framed bounding box area is automatically scaled to **best fit the available viewport dimensions** ($W_{\text{viewport}} \times H_{\text{viewport}}$) with zero scrolling, preserving the 1:1 stud aspect ratio:
    $$S_{\text{stud}} = \min\left(\frac{W_{\text{viewport}}}{width}, \frac{H_{\text{viewport}}}{height}\right)$$
  * There is **no panning and no zooming** in this iteration. The framed area remains centered in the viewport.
* **Flat 2D Continuous Studs**:
  * Stud cells are rendered as continuous flat colored squares.
  * No 3D bevels, drop shadows, or circular stud nub graphics are drawn.
* **Baseplate Background**:
  * Unpainted cells display the authentic dark green baseplate color `#184632`.
* **Optional 1px Alignment Grid**:
  * Toggled via the "Show Grid" checkbox in `<TopHeaderBar>`.
  * When enabled, renders 1px semi-transparent grid lines (`rgba(255, 255, 255, 0.08)`) between studs.
  * When disabled, cells appear as continuous flush brick surfaces.

---

## 3. Interactive Behaviors

* **Click-to-Paint (No Drag-to-Paint)**:
  * Painting is strictly performed on **mouse click** (`pointerdown`). Drag-to-paint is disabled in this iteration.
  * Clicking on a visible stud at column $C$ and row $R$ paints an area matching the currently active brush size ($1\times 1, 2\times 2, 4\times 4, 8\times 8, 16\times 16, 32\times 32$), with the clicked stud at the top-left origin $(C, R)$.
  * Active tool behavior:
    * **Brush Tool**: Paints cells with the active official brick color ID.
    * **Eraser Tool**: Clears cells to `colorId: null` (reverting to the baseplate `#184632`).
* **Optimistic Update & Immediate API Call**:
  * On click, the client immediately updates the local canvas buffer and dispatches the `paintArea` JSON-RPC HTTP request to the backend.

---

## 4. Acceptance Criteria & Test IDs

* `TEST-UI-VIEWPORT-01`: Viewport renders the active bounding box region $(x, y, width, height)$ scaled to fit the viewport container with no scrollbars.
* `TEST-UI-VIEWPORT-02`: Changing bounding box parameters updates the canvas to frame the new subregion.
* `TEST-UI-VIEWPORT-03`: Clicking on a stud paints the cell(s) matching the active brush size and active color immediately.
* `TEST-UI-VIEWPORT-04`: Toggling the grid overlay turns the 1px reference grid lines on and off without modifying cell data.
* `TEST-UI-VIEWPORT-05`: Rendered output consists strictly of 2D flat square cells without circular stud nubs.

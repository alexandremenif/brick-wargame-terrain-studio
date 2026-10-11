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
* **Automatic Best-Fit with Dynamic Framing**:
  * The framed bounding box area is automatically scaled to **best fit the available viewport dimensions** ($W_{\text{viewport}} \times H_{\text{viewport}}$) with zero scrolling, preserving the 1:1 stud aspect ratio:
    $$S_{\text{stud}} = \min\left(\frac{W_{\text{viewport}}}{width}, \frac{H_{\text{viewport}}}{height}\right)$$
  * The framed area remains centered in the viewport.
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

* **Click-to-Paint (Brush & Eraser Modes)**:
  * In `Brush` and `Eraser` modes, painting is strictly performed on **mouse click** (`pointerdown`). Drag-to-paint is disabled in this iteration.
  * Clicking on a visible stud at column $C$ and row $R$ paints an area matching the currently active brush size ($1\times 1, 2\times 2, 4\times 4, 8\times 8, 16\times 16, 32\times 32$), with the clicked stud at the top-left origin $(C, R)$.
  * Active tool behavior:
    * **Brush Tool**: Paints cells with the active official brick color ID.
    * **Eraser Tool**: Clears cells to `colorId: null` (reverting to the baseplate `#184632`).
  * On click, the client immediately updates the local canvas buffer and dispatches the `paintArea` JSON-RPC HTTP request to the backend.
* **Drag-to-Pan (Pan Mode)**:
  * When the active tool mode is `Pan` (`[✋ Pan]`), clicking and dragging (`pointerdown` followed by `pointermove`) on the canvas viewport pans the active view.
  * **Natural Hand / Grab Movement**: Dragging pulls the underlying terrain under the cursor (consistent with standard tools like Figma and Photoshop). Moving the cursor by pixel displacement $(\Delta X_{\text{px}}, \Delta Y_{\text{px}})$ shifts the bounding box origin inversely:
    $$\Delta x_{\text{studs}} = \mathrm{round}\left(\frac{\Delta X_{\text{px}}}{S_{\text{stud}}}\right), \quad \Delta y_{\text{studs}} = \mathrm{round}\left(\frac{\Delta Y_{\text{px}}}{S_{\text{stud}}}\right)$$
    $$x_{\text{new}} = \mathrm{clamp}(x_{\text{start}} - \Delta x_{\text{studs}}, 0, W - width)$$
    $$y_{\text{new}} = \mathrm{clamp}(y_{\text{start}} - \Delta y_{\text{studs}}, 0, H - height)$$
  * Cursor style indicates navigation: `cursor: grab` when idle, `cursor: grabbing` while dragging.
* **Mouse Wheel Zooming**:
  * Scrolling the mouse wheel over the canvas viewport enlarges or reduces the bounding box dimensions centered on the current bounding box center:
    * **Wheel Up (Zoom In)**: Decreases bounding box dimensions ($width, height$) by ~25% (scaling factor $\approx 0.8\times$), maintaining aspect ratio and centering the new box at the existing center. Minimum dimensions are $1 \times 1$ stud.
    * **Wheel Down (Zoom Out)**: Increases bounding box dimensions ($width, height$) by ~25% (scaling factor $\approx 1.25\times$), maintaining aspect ratio and centering the new box at the existing center. Maximum dimensions are capped at full asset dimensions $(W, H)$.
  * Origin coordinates $(x, y)$ are recomputed to keep the bounding box center fixed and clamped within $[0, W - width]$ and $[0, H - height]$.
  * Wheel zooming is active across all tool modes.

---

## 4. Acceptance Criteria & Test IDs

* `TEST-UI-VIEWPORT-01`: Viewport renders the active bounding box region $(x, y, width, height)$ scaled to fit the viewport container with no scrollbars.
* `TEST-UI-VIEWPORT-02`: Changing bounding box parameters updates the canvas to frame the new subregion.
* `TEST-UI-VIEWPORT-03`: Clicking on a stud paints the cell(s) matching the active brush size and active color immediately.
* `TEST-UI-VIEWPORT-04`: Toggling the grid overlay turns the 1px reference grid lines on and off without modifying cell data.
* `TEST-UI-VIEWPORT-05`: Rendered output consists strictly of 2D flat square cells without circular stud nubs.
* `TEST-UI-VIEWPORT-06`: In Pan mode, dragging the mouse across the canvas viewport updates $(x, y)$ of the bounding box clamped to asset boundaries.
* `TEST-UI-VIEWPORT-07`: Scrolling the mouse wheel up zooms in (reduces bounding box dimensions by ~25% down to $1\times 1$), keeping the bounding box center fixed.
* `TEST-UI-VIEWPORT-08`: Scrolling the mouse wheel down zooms out (enlarges bounding box dimensions by ~25% up to full asset dimensions), keeping the bounding box center fixed.

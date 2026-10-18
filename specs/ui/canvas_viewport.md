# Component: CanvasViewport

## 1. Role & Responsibilities
The `<CanvasViewport>` is the central interactive editing area. It displays the **active bounding box region** of the terrain asset:
$$[x, x + \text{width} - 1] \times [y, y + \text{height} - 1]$$
Using an immediate-mode HTML5 2D `<canvas>`, it renders flat 2D studs at sustained 60–120 FPS and processes single-click painting actions, pan navigation, and wheel zooming.

---

## 2. Component Contract

### Input Props
| Prop | Type | Description |
| :--- | :--- | :--- |
| `boundingBox` | BoundingBox object | Active framed subregion coordinates $(x, y, \text{width}, \text{height})$ |
| `cells` | Array of CellData | Painted cell data for the active asset |
| `colorsById` | Map<Integer, BrickColor> | Color catalog map used for canvas stud rendering |
| `showGrid` | Boolean | Whether the alignment grid overlay lines are visible |
| `toolMode` | Enum (`Brush`, `Eraser`, `Pan`) | Current interactive tool mode |
| `brushSize` | Enum (`1x1`, `2x2`, `4x4`, `8x8`, `16x16`, `32x32`) | Footprint of the painting tool |
| `selectedColorId` | Integer | Color applied in Brush mode |

### Callbacks
| Callback | Arguments | Trigger Condition |
| :--- | :--- | :--- |
| `onPaint` | `x: Integer, y: Integer, width: Integer, height: Integer, colorId: Integer or null` | User clicks to paint (Brush) or clear (Eraser) an area |
| `onPanBy` | `deltaX: Integer, deltaY: Integer` | User drags mouse across canvas in Pan mode |
| `onZoom` | `factor: Number` | User scrolls mouse wheel over canvas viewport |

---

## 3. Visual Representation & Styling

* **View of the Active Bounding Box**:
  * Displays studs framed by active bounding box parameters $(x, y, \text{width}, \text{height})$.
  * When bounding box parameters change, the canvas viewport re-frames immediately to show the specified subregion.
* **Automatic Best-Fit with Dynamic Framing**:
  * The framed bounding box area is automatically scaled to **best fit the available viewport dimensions** ($W_{\text{viewport}} \times H_{\text{viewport}}$) with zero scrolling, preserving the 1:1 stud aspect ratio:
    $$S_{\text{stud}} = \min\left(\frac{W_{\text{viewport}}}{\text{width}}, \frac{H_{\text{viewport}}}{\text{height}}\right)$$
  * The framed area remains centered in the `.studio-viewport` container.
* **Flat 2D Continuous Studs via Domain Rendering Engine**:
  * Visual rasterization is processed by the pure domain function `renderAssetGrid` in `@lego-wargame-terrain-studio/domain`, guaranteeing 100% pixel parity with server image exports.
  * Stud cells are rendered as continuous flat colored squares without circular stud nubs.
* **Neutral Checkerboard Transparency Background**:
  * Unpainted cells display a subtle $2 \times 2$ neutral checkerboard pattern per stud, distinguishing unpainted empty space from official White bricks.
* **Optional 1px Alignment Grid**:
  * When enabled and stud size exceeds $3\text{px}$, renders 1px semi-transparent grid lines between studs.

---

## 4. Interactive Behaviors

* **Click-to-Paint (Brush & Eraser Modes)**:
  * In `Brush` and `Eraser` modes, painting is strictly performed on **mouse click** (`pointerdown`).
  * Clicking on a visible stud at column $C$ and row $R$ paints an area matching the currently active brush size, with the clicked stud at the top-left origin $(C, R)$.
  * Active tool behavior:
    * **Brush Tool**: Paints cells with the active official brick color ID.
    * **Eraser Tool**: Clears cells to `colorId: null` (reverting to checkerboard transparency pattern).
* **Drag-to-Pan (Pan Mode)**:
  * In `Pan` mode, clicking and dragging on the canvas viewport shifts the active view.
  * Moving cursor by pixel displacement $(\Delta X_{\text{px}}, \Delta Y_{\text{px}})$ shifts the bounding box origin inversely:
    $$\Delta x_{\text{studs}} = \mathrm{round}\left(\frac{\Delta X_{\text{px}}}{S_{\text{stud}}}\right), \quad \Delta y_{\text{studs}} = \mathrm{round}\left(\frac{\Delta Y_{\text{px}}}{S_{\text{stud}}}\right)$$
    $$x_{\text{new}} = \mathrm{clamp}(x_{\text{start}} - \Delta x_{\text{studs}}, 0, W - \text{width})$$
    $$y_{\text{new}} = \mathrm{clamp}(y_{\text{start}} - \Delta y_{\text{studs}}, 0, H - \text{height})$$
* **Mouse Wheel Zooming**:
  * Scrolling the mouse wheel over the canvas viewport scales bounding box dimensions centered on the current center:
    * **Wheel Up (Zoom In)**: Decreases bounding box dimensions by ~25% down to $1\times 1$.
    * **Wheel Down (Zoom Out)**: Increases bounding box dimensions by ~25% up to full asset dimensions $(W, H)$.

---

## 5. Acceptance Criteria & Test IDs
* `TEST-UI-VIEWPORT-01`: Viewport renders the active bounding box region $(x, y, \text{width}, \text{height})$ scaled to fit the viewport container with no scrollbars.
* `TEST-UI-VIEWPORT-02`: Changing bounding box parameters updates the canvas to frame the new subregion.
* `TEST-UI-VIEWPORT-03`: Clicking on a stud paints the cell(s) matching the active brush size and active color immediately.
* `TEST-UI-VIEWPORT-04`: Toggling the grid overlay turns the 1px reference grid lines on and off without modifying cell data.
* `TEST-UI-VIEWPORT-05`: Rendered output consists strictly of 2D flat square cells without circular stud nubs.
* `TEST-UI-VIEWPORT-06`: In Pan mode, dragging the mouse across the canvas viewport updates $(x, y)$ of the bounding box clamped to asset boundaries.
* `TEST-UI-VIEWPORT-07`: Scrolling the mouse wheel up zooms in (reduces bounding box dimensions by ~25% down to $1\times 1$), keeping the bounding box center fixed.
* `TEST-UI-VIEWPORT-08`: Scrolling the mouse wheel down zooms out (enlarges bounding box dimensions by ~25% up to full asset dimensions), keeping the bounding box center fixed.

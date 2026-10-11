# Component: BoundingBoxWindow

## 1. Role & Responsibilities
The `<BoundingBoxWindow>` is the visual preview area embedded inside the `<RightInspectorSidebar>`. The window itself represents the bounding box: it displays the framed subregion of studs specified by the active bounding box parameters $(x, y, width, height)$.

---

## 2. Visual Representation & Behavior

* **Window as the Bounding Box**:
  * There is **no bounding box overlay rectangle drawn inside this window**; the viewport of the window *is* the bounding box.
  * Displays the discrete studs located within the range:
    $$[x, x + width - 1] \times [y, y + height - 1]$$
  * Renders each cell with its authentic official brick hex color (or the dark green baseplate tone `#184632` if unpainted).
* **Automatic Scaling & Fitting**:
  * Whatever the bounding box dimensions ($width \times height$), the entire region **must fit within the inspector preview viewport** ($W_{\text{viewport}} \times H_{\text{viewport}}$).
  * The rendered size of a stud ($S_{\text{stud}}$ in pixels) is dynamically scaled to fit, preserving the aspect ratio (1:1 square studs):
    $$S_{\text{stud}} = \min\left(\frac{W_{\text{viewport}}}{width}, \frac{H_{\text{viewport}}}{height}\right)$$
  * The framed grid is rendered centered within the preview viewport area.
* **Dynamic Framing on Parameter Change**:
  * Whenever valid bounding box parameters $(x, y, width, height)$ are entered in the inspector inputs or changed via actions (e.g. "Fit to Asset"), the window re-frames immediately and recalculates the stud scale factor $S_{\text{stud}}$.
  * When cells within the framed region are painted or erased in the studio, the window updates in real time.

---

## 3. Visual Ergonomics & Layout

* Contained within the upper section of `<RightInspectorSidebar>`.
* Fixed container dimensions: $224 \times 148$ px with dark card styling (`rounded border border-zinc-800 bg-zinc-950`).
* Preview viewport inner drawing area: maximum $208 \times 128$ px (accounting for internal padding).
* Footer label displaying current framed region coordinates and stud scaling: e.g. `Region: 15×13 at [9, 5] (9.8px/stud)`.

---

## 4. Acceptance Criteria & Test IDs

* `TEST-UI-BBOX-WIN-01`: The window displays the cells contained within the active bounding box region $(x, y, width, height)$.
* `TEST-UI-BBOX-WIN-02`: Changing X, Y, Width, or Height to valid values updates the window to frame and display the new region.
* `TEST-UI-BBOX-WIN-03`: No bounding box overlay graphic is drawn inside the preview window; the frame bounds represent the bounding box.
* `TEST-UI-BBOX-WIN-04`: For any valid bounding box dimensions $(width, height)$, all framed studs fit entirely within the preview viewport without clipping or scrolling, with stud pixel size $S_{\text{stud}} = \min(W_{\text{viewport}} / width, H_{\text{viewport}} / height)$.

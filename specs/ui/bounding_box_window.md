# Component: BoundingBoxWindow

## 1. Role & Responsibilities
The `<BoundingBoxWindow>` is the visual preview area embedded inside the `<RightInspectorSidebar>`. The window itself represents the bounding box: it displays the framed subregion of studs specified by the active bounding box parameters $(x, y, width, height)$.

---

## 2. Visual Representation & Behavior

* **Window as the Bounding Box**:
  * There is **no bounding box overlay rectangle drawn inside this window**; the viewport of the window *is* the bounding box.
  * Displays the discrete studs located within the range:
    $$[x, x + width - 1] \times [y, y + height - 1]$$
  * Renders each cell with its authentic official brick hex color (or the dark green base tone `#184632` if unpainted).
* **Dynamic Framing on Parameter Change**:
  * Whenever valid bounding box parameters $(x, y, width, height)$ are entered in the inspector inputs or changed via actions (e.g. "Fit to Asset"), the window re-frames immediately to show the corresponding region.
  * When cells within the framed region are painted or erased in the studio, the window updates in real time.

---

## 3. Visual Ergonomics & Layout

* Contained within the upper section of `<RightInspectorSidebar>`.
* Fixed container dimensions: $224 \times 148$ px with dark card styling (`rounded border border-zinc-800 bg-zinc-950`).
* Footer label displaying current framed region coordinates: e.g. `Region: 15×13 at [9, 5]`.

---

## 4. Acceptance Criteria & Test IDs

* `TEST-UI-BBOX-WIN-01`: The window displays the cells contained within the active bounding box region $(x, y, width, height)$.
* `TEST-UI-BBOX-WIN-02`: Changing X, Y, Width, or Height to valid values updates the window to frame and display the new region.
* `TEST-UI-BBOX-WIN-03`: No bounding box overlay graphic is drawn inside the preview window; the frame bounds represent the bounding box.

# Component: RightInspectorSidebar

## 1. Role & Responsibilities
The `<RightInspectorSidebar>` hosts the `<BoundingBoxWindow>` region preview and provides numerical coordinate controls to configure the active bounding box parameters $(x, y, width, height)$ with a quick framing action.

---

## 2. Child Components & Controls

* **Bounding Box Window**:
  * Hosts the `<BoundingBoxWindow>` component (see [`bounding_box_window.md`](./bounding_box_window.md)).
  * The window itself is the bounding box: it displays the framed subregion of studs without any internal bounding box overlay graphic.
  * Dynamically updates whenever bounding box parameters change.
* **Bounding Box Inputs**:
  * `X`: Origin stud X coordinate ($0 \le x < W$).
  * `Y`: Origin stud Y coordinate ($0 \le y < H$).
  * `Width`: Region width in studs ($width \ge 1$, $x + width \le W$).
  * `Height`: Region height in studs ($height \ge 1$, $y + height \le H$).
* **Preset Framing Action**:
  * `[Fit to Asset]`: Sets the bounding box to frame the full asset ($x=0, y=0, w=W, h=H$).

---

## 3. Visual Ergonomics & Layout

* Width: 260px fixed sidebar (`w-64`).
* Background: `bg-zinc-900 border-l border-zinc-800`.
* Upper section: Bounding Box Window preview ($224 \times 148$ px).
* Middle section: Numeric coordinate inputs with clear labels.
* Lower section: Framing action button (`[Fit to Asset]`).

---

## 4. Acceptance Criteria & Test IDs

* `TEST-UI-INSPECTOR-01`: Editing X, Y, Width, or Height values updates the active bounding box parameters and updates the `<BoundingBoxWindow>` to display the new region.
* `TEST-UI-INSPECTOR-02`: Clicking "Fit to Asset" sets bounding box dimensions to match the full asset ($0, 0, W, H$).

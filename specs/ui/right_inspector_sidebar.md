# Component: RightInspectorSidebar

## 1. Role & Responsibilities
The `<RightInspectorSidebar>` hosts the `<Minimap>` thumbnail overview and provides numerical coordinate controls to configure the active bounding box parameters $(x, y, width, height)$ with a quick framing action.

---

## 2. Child Components & Controls

* **Minimap Panel**:
  * Hosts the `<Minimap>` component (see [`minimap.md`](./minimap.md)).
  * Displays the scaled overview of the entire terrain asset ($W \times H$) with an indicator highlighting the position of the active bounding box.
  * Dynamically updates whenever bounding box parameters change or cells are painted.
* **Bounding Box Numerical Inputs**:
  * `X`: Origin stud X coordinate ($0 \le x < W$).
  * `Y`: Origin stud Y coordinate ($0 \le y < H$).
  * `Width`: Region width in studs ($width \ge 1$, $x + width \le W$).
  * `Height`: Region height in studs ($height \ge 1$, $y + height \le H$).
* **Input Validation & Rejection**:
  * If the user enters an invalid value (e.g. $x + width > W$ or a non-positive dimension), the input is **rejected and immediately reverts to the previous valid value**.
  * The main `<CanvasViewport>` and `<Minimap>` only update when valid values are entered.
* **Preset Framing Action**:
  * `[Fit to Asset]`: Sets the bounding box to frame the full asset ($x=0, y=0, w=W, h=H$).

---

## 3. Visual Ergonomics & Layout

* Width: 260px fixed sidebar (`w-64`).
* Background: `bg-zinc-900 border-l border-zinc-800`.
* Upper section: Minimap thumbnail overview ($224 \times 148$ px).
* Middle section: Numeric coordinate inputs with clear labels.
* Lower section: Framing action button (`[Fit to Asset]`).

---

## 4. Acceptance Criteria & Test IDs

* `TEST-UI-INSPECTOR-01`: Editing X, Y, Width, or Height values to valid numbers updates the active bounding box parameters, shifts the framed area in the canvas viewport, and moves the minimap indicator.
* `TEST-UI-INSPECTOR-02`: Entering an invalid bounding box value rejects the input and reverts to the previous valid value.
* `TEST-UI-INSPECTOR-03`: Clicking "Fit to Asset" sets bounding box dimensions to match the full asset ($0, 0, W, H$).

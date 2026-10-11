# Component: RightInspectorSidebar

## 1. Role & Responsibilities
The `<RightInspectorSidebar>` provides numerical coordinates feedback, controls to configure the active bounding box region $(x, y, width, height)$, and quick framing/fill actions.

## 2. Child Components & Controls
* **Bounding Box Inputs**:
  * `X`: Origin stud X coordinate ($0 \le x < W$).
  * `Y`: Origin stud Y coordinate ($0 \le y < H$).
  * `Width`: Region width in studs ($width \ge 1$, $x + width \le W$).
  * `Height`: Region height in studs ($height \ge 1$, $y + height \le H$).
* **Preset Framing Actions**:
  * `[Fit to Asset]`: Automatically sets the bounding box to frame the full asset ($x=0, y=0, w=W, h=H$).
  * `[Clear Bounding Box]`: Clears the active bounding box.
* **Paint Bounding Box Quick Action**:
  * `[Fill Bounding Box]`: Fills the entire framed bounding box area with the active brush color via `paintArea`.

## 3. Visual Ergonomics & Layout
* Width: 260px fixed sidebar (`w-64`).
* Background: `bg-zinc-900 border-l border-zinc-800`.
* Section headers and numeric input fields with steppers.

## 4. Acceptance Criteria & Test IDs
* `TEST-UI-INSPECTOR-01`: Editing X, Y, Width, or Height values updates the active bounding box state and highlights the region on the SVG viewport.
* `TEST-UI-INSPECTOR-02`: Clicking "Fit to Asset" sets bounding box dimensions to match the asset width and height.
* `TEST-UI-INSPECTOR-03`: Clicking "Fill Bounding Box" fills the framed area with the active color in a single operation.

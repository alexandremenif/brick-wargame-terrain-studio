# Component: LeftToolboxSidebar

## 1. Role & Responsibilities
The `<LeftToolboxSidebar>` manages the active drawing modes (Brush vs Eraser), brush size presets (ranging from single stud up to $32 \times 32$), and the 41 official brick colors catalog dynamically retrieved via `listColors`.

## 2. Child Components & Controls
* **Tool Mode Selector**:
  * `[🖌 Brush]`: In brush mode, painting sets cells to the currently selected brick color ID.
  * `[🧹 Eraser]`: In eraser mode, painting clears cells (sets `colorId` to `null`).
* **Brush Size Presets**:
  * Quick-access preset grid spanning sizes from fine detail to broad macro terrain painting:
    * `[1x1]`: Fine single-stud editing.
    * `[2x2]`: Small $2 \times 2$ stud brush.
    * `[4x4]`: Medium $4 \times 4$ stud brush.
    * `[8x8]`: Broad $8 \times 8$ stud brush.
    * `[16x16]`: Sector $16 \times 16$ stud brush.
    * `[32x32]`: Macro $32 \times 32$ stud brush.
* **1x1 Flat Square Color Palette Swatches**:
  * 41 flat square 1x1 swatches displayed in an ergonomic grid (e.g. 8 columns).
  * Each swatch is a flat 1x1 colored square displaying the authentic hex color, with an accessible tooltip showing the official name (e.g. "Bright Green", "Medium Stone Grey").
  * Active color swatch shows an unmistakable selection ring/border (`ring-2 ring-white`).
  * Only enabled when Tool Mode is `Brush`.

## 3. Visual Ergonomics & Layout
* Width: 260px fixed sidebar (`w-64`).
* Background: `bg-zinc-900 border-r border-zinc-800`.
* Compact two-row brush size button matrix.
* Scrollable color catalog container (`overflow-y-auto`).

## 4. Acceptance Criteria & Test IDs
* `TEST-UI-TOOLBOX-01`: Clicking the "Eraser" tool switches drawing mode to clear cells.
* `TEST-UI-TOOLBOX-02`: Selecting any brush size ($1\times 1$, $2\times 2$, $4\times 4$, $8\times 8$, $16\times 16$, $32\times 32$) updates the active brush footprint.
* `TEST-UI-TOOLBOX-03`: Clicking a 1x1 color swatch selects it as active brush color and highlights its visual ring.

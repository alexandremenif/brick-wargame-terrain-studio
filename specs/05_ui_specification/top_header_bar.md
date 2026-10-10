# Component: TopHeaderBar

## 1. Role & Responsibilities
Top bar containing global project metadata, history controls, viewport toggles, and high-resolution export actions.

## 2. Elements & Controls
* **Project Identity**: Title ("LEGO Wargame Terrain Studio"), physical table dimensions ($95\text{ cm} \times 180\text{ cm}$, $118 \times 225$ studs).
* **Undo / Redo Controls**:
  * Undo button (`Ctrl+Z`), disabled when no action is available.
  * Redo button (`Ctrl+Y`), disabled when no undone action is available.
* **Grid Toggle (Toggle Grid)**:
  * Button and keyboard shortcut `G` to toggle the 1px reference grid overlay spaced by 8 mm physical units.
* **Viewport Controls**:
  * Current zoom level percentage display (e.g. `100%`).
  * "Reset Zoom" button (centers view at 100% over the table center).
* **Export Menu**:
  * High-Definition Raster Export (PNG 300 DPI at 1:1 physical scale for Pixartprinting / Printoclock).
  * Optimized Vector SVG Export (with polygon merging).

## 3. Acceptance Criteria & Test IDs
* `TEST-UI-THB-01`: Clicking Undo dispatches the `undo` command via the gateway.
* `TEST-UI-THB-02`: Pressing key `G` toggles the grid visibility state.
* `TEST-UI-THB-03`: Undo and Redo buttons accurately reflect `canUndo` and `canRedo` booleans.

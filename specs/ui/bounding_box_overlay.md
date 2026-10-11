# Component: BoundingBoxOverlay

## 1. Role & Responsibilities
Interactive vector overlay layer rendered on top of the canvas, managing rectangular Bounding Box selection, resizing, translation, and AI agent coordination.

## 2. Elements & Controls
* **Box Drag Selection**:
  * In Select tool mode (`tool: select`), left-click dragging draws a magnetic rectangle snapped to whole stud units.
* **Resize Handles**:
  * 4 corner handles to resize the box interactively.
  * Center move handle to translate the box without changing dimensions.
* **"Copy for AI" Floating Action Button**:
  * Appears above the selected box (also triggered via keyboard shortcut `Ctrl+Shift+C`).
  * Copies formatted text to clipboard:
    `Bounding Box: [x: 40, y: 110, w: 24, h: 32] (zone of 19.2cm x 25.6cm)`
* **Live AI Camera Focus**:
  * When the AI invokes MCP tool `set_active_bounding_box`, the overlay repositions the box and the viewport centers smoothly around it.

## 3. Acceptance Criteria & Test IDs
* `TEST-UI-BBOX-01`: Selected rectangle snaps strictly to integer stud units (no fractional studs).
* `TEST-UI-BBOX-02`: Clicking "Copy for AI" writes the exact coordinate format to the clipboard.

# Component: RightInspectorSidebar

## 1. Role & Responsibilities
Right-hand sidebar dedicated to numerical bounding box inspection, reusable preset library management, and placed instance manipulation.

## 2. Elements & Controls
* **Bounding Box Inspector**:
  * Precision metrics: `X: 45, Y: 120 | W: 24 studs (19.2 cm) | H: 32 studs (25.6 cm)`.
  * Editable numeric inputs to adjust selection via keyboard.
* **Preset Library**:
  * Visual gallery of saved presets with thumbnail previews.
  * Drag-and-drop: drag a preset card onto the canvas to place a new instance.
  * "New Preset" button: opens preset editor on an isolated canvas with alpha transparency.
* **Active Placed Instances**:
  * Z-index sorted list of preset instances currently on the board.
  * Key `R`: rotates the selected instance by $90^\circ$ increments.
  * Key `Delete` / `Backspace`: removes the selected instance.

## 3. Acceptance Criteria & Test IDs
* `TEST-UI-RIS-01`: Editing X or Y inputs in the inspector shifts the selection box on the canvas.
* `TEST-UI-RIS-02`: Pressing `R` with an instance selected increments its rotation by $90^\circ$.

# Component: LeftToolboxSidebar

## 1. Role & Responsibilities
Left-hand sidebar for selecting the active tool, brush size, official LEGO color, and overlayable SVG texture.

## 2. Elements & Controls
* **Tool Selector**:
  * Brush Tool
  * Eraser Tool: clears cell color (restores base background color or alpha transparency)
  * Select Tool: rectangular Bounding Box drag selection
* **Brush Size Selector**:
  * Preset sizes: $1\times 1$, $2\times 2$, $4\times 4$, $8\times 8$, $16\times 16$, $32\times 32$ studs.
  * Keyboard shortcuts: Key `[` decreases brush size; key `]` increases brush size.
* **Official LEGO Color Palette**:
  * Category tabs: *All*, *Vegetation / Nature* (Bright Green, Dark Green, Lime), *Stone / Ruins* (Medium Stone Grey, Dark Stone Grey), *Water* (Medium Blue, Trans-Light Blue), *Earth / Wood* (Dark Tan, Reddish Brown).
  * Hover tooltip displaying official LEGO name and BrickLink color ID.
* **Vector SVG Texture Selector**:
  * Clickable thumbnails: *Grass clumps*, *Stone cobble*, *Water ripples*, *Cracked earth*.
  * Ability to clear texture selection for flat solid colors.

## 3. Acceptance Criteria & Test IDs
* `TEST-UI-LTB-01`: Selecting a color swatch updates the active painting color for subsequent canvas clicks.
* `TEST-UI-LTB-02`: Pressing `[` or `]` adjusts the brush size between 1 and 32.

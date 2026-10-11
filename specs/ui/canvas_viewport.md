# Component: CanvasViewport

## 1. Role & Responsibilities
High-performance central interactive rendering zone displaying the $118 \times 225$ stud grid via HTML5 Canvas.

## 2. Camera Navigation & Interactions
* **Panning**:
  * Right-click drag (or middle-mouse click drag, or Spacebar + left-click drag) moves the viewport camera smoothly.
* **Smooth Zooming**:
  * Mouse wheel zooms centered around the mouse pointer.
  * Zoom constraints: from $10\%$ (entire table overview) to $1200\%$ (stud-level inspection).
* **Terrain Rendering**:
  * Continuous 2D flat vector color fills faithful to official LEGO shades.
  * Superimposed SVG vector texture rendering.
  * Optional 1px reference grid overlay spaced by 8 mm physical units.
* **Painting & Erasing**:
  * Left-click drag applies color or clears cells over the area covered by the active brush size.

## 3. Acceptance Criteria & Test IDs
* `TEST-UI-CV-01`: Mouse wheel adjusts zoom strictly within $[10\%, 1200\%]$.
* `TEST-UI-CV-02`: Cursor motion accurately reports the stud coordinate under the pointer $[0 \le x < 118, 0 \le y < 225]$.

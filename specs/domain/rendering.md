# Domain Operations: 2D Canvas Asset Grid Rendering

## 1. Role & Architectural Boundaries

In **Brick Wargame Terrain Studio**, the 2D Canvas rendering engine is a pure domain capability residing in `@lego-wargame-terrain-studio/domain`. It defines the deterministic visual representation of an `Asset` (and optional `BoundingBox` framed sub-region) on a standard 2D canvas context (`Canvas2DContext`).

This rendering engine serves two synchronized consumers:
1. **Interactive Studio UI (`packages/ui`)**: Paints immediate-mode graphics onto the browser's native `<canvas>` viewport in `<CanvasViewport>`.
2. **Server Headless Exporter (`packages/server`)**: Paints onto a headless canvas context (`@napi-rs/canvas`) to produce PNG buffers for JSON-RPC `exportImage` and MCP `export_image`.

Because both consumers share the exact same domain rendering engine, what the user sees in the editor is identical pixel-for-pixel with the exported images.

---

## 2. Mathematical Invariants & Resolution Rules

### 2.1 Stud Dimension Constraints
$$\text{MIN\_PIXELS\_PER\_STUD} = 2$$
Every stud rendered on canvas must occupy at least $2\text{px} \times 2\text{px}$ so that the mini-checkerboard sub-grid remains sharp and distinguishable from solid white bricks.

---

## 3. Visual Styling & Layering Rules

The rendering function `renderAssetGrid(ctx, options)` follows an explicit multi-layer pipeline:

### 3.1 Background & Transparency Representation
* **`'checkerboard'` Mode (Default for Studio & MCP LLM)**:
  - Unpainted/empty studs are filled with a $2 \times 2$ alternating neutral checkerboard:
    - Color A: `#27272a` (zinc-800)
    - Color B: `#18181b` (zinc-900)
  - This guarantees that multimodal LLM agents and human artists instantly distinguish empty space from official White bricks (`#FFFFFF`).
* **`'white'` Mode (Printing Profile)**:
  - Unpainted/empty studs are filled with solid white `#FFFFFF` to ensure printer ink efficiency and paper compatibility.

### 3.2 Cell Rendering
- The asset's cells are provided as a 2D row-major matrix `cells: number[][]` (`cells[y][x]`, where `0` is unpainted and $\ge 1$ is a painted brick color ID).
- For each stud coordinate $(x, y)$ in the active region $[x_0, x_0 + W - 1] \times [y_0, y_0 + H - 1]$:
  - Read `colorId = cells[y]?.[x] ?? 0`.
  - If `colorId > 0`, lookup the `BrickColor` from `colorsById` by `colorId` and draw a solid square at local canvas coordinate $((x - x_0) \times s, (y - y_0) \times s)$ with dimensions $s \times s$ (where $s = \text{pixelsPerStud}$).
  - If `colorId === 0`, draw the configured background representation (`'checkerboard'` or `'white'`).

### 3.3 Alignment Grid Overlay
- When `grid: true` and $\text{pixelsPerStud} > 3$:
  - A 1px alignment grid is stroked over stud boundaries with static domain color:
    $$\text{GRID\_COLOR} = \text{'rgba(0, 0, 0, 0.15)'}$$
- If $\text{pixelsPerStud} \le 3$, grid lines are automatically suppressed to avoid visual noise and pixel blending artifacts.

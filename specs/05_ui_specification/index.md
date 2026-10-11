# User Interface Specification (UI & UX)

This directory defines the visual ergonomics, functional studio component architecture, and interaction rules for the playmat editor.
Following modular architecture principles, each major UI component is specified in its own dedicated Markdown file.

---

## 1. Overview & Component Hierarchy

The studio layout is structured as follows:

```
<StudioLayout> (index.md)
├── <TopHeaderBar>               -> top_header_bar.md
├── <LeftToolboxSidebar>         -> left_toolbox_sidebar.md
├── <CanvasViewport>             -> canvas_viewport.md
├── <BoundingBoxOverlay>         -> bounding_box_overlay.md
├── <RightInspectorSidebar>      -> right_inspector_sidebar.md
└── <BottomStatusBar>            -> bottom_status_bar.md
```

---

## 2. Studio Layout & Visual Ergonomics

The application interface is organized into distinct functional workspaces designed for ergonomic playmat editing:

* **Top Control Zone (Header)**:
  * Project-level metadata (table dimensions in centimeters and studs).
  * History navigation (Undo / Redo), viewport reset, and export operations.
* **Tool & Palette Zone (Left Sidebar)**:
  * Active tool selection (drawing brush, eraser, selection marquee).
  * Brush dimensions and official LEGO color palette with tactile swatches.
* **Central Interactive Viewport (Canvas & Overlay)**:
  * High-performance rendering of the full playmat terrain and stud grid.
  * Direct manipulation canvas supporting camera navigation (pan/zoom) and drawing.
  * Interactive bounding box overlay for selecting and framing areas for human or AI attention.
* **Property & Library Zone (Right Sidebar)**:
  * Numerical coordinate feedback and fine-tuning for selected regions.
  * Reusable preset catalog for modular terrain pieces and stamp placement.
* **Persistent Status Zone (Bottom Bar)**:
  * Real-time cursor coordinates (physical scale in centimeters and grid studs).
  * Engine connectivity indicator and current scale reference legend.

---

## 3. Core Interaction Principles

* **Direct Manipulation**: All terrain interactions (painting, erasing, selecting) operate directly on the central canvas with immediate visual feedback.
* **Physical-to-Stud Fidelity**: Every UI dimension is anchored to the physical scale ($1\text{ stud} = 8\text{ mm}$), ensuring that visual designs map 1:1 to printed tabletop mats.
* **Agentic Transparency**: Regions framed via bounding boxes can be inspected or acted upon by autonomous AI agents with clear visual overlays, keeping the user in full control of AI-assisted modifications.
* **Keyboard Accessibility**: Core editing actions support primary keyboard shortcuts (`G` for grid toggle, `[`/`]` for brush size, `Ctrl+Z`/`Ctrl+Y` for history).

---

## 4. Component Specification Index

* **[TopHeaderBar](./top_header_bar.md)**: Project title, Undo/Redo history buttons, 1px grid toggle, zoom, and exports.
* **[LeftToolboxSidebar](./left_toolbox_sidebar.md)**: Tools (brush, eraser, select), brush sizes ($1\times 1$ to $32\times 32$), LEGO palette, and SVG textures.
* **[CanvasViewport](./canvas_viewport.md)**: HTML5 Canvas rendering engine, camera panning, and mouse-wheel zooming ($10\%$ to $1200\%$).
* **[BoundingBoxOverlay](./bounding_box_overlay.md)**: Interactive SVG selection box, corner resize handles, and "Copy for AI" quick button.
* **[RightInspectorSidebar](./right_inspector_sidebar.md)**: Coordinate inspector, drag-and-drop preset library, and active instance management.
* **[BottomStatusBar](./bottom_status_bar.md)**: Live cursor coordinates, connection status indicator, and physical scale legend ($1\text{ stud} = 8\text{ mm}$).

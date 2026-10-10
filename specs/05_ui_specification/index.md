# User Interface Specification (UI & UX)

This directory defines the visual ergonomics, React component architecture, and interaction rules for the playmat editor.
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

## 2. Transport Abstraction (`IEngineGateway`)

All React components are fully decoupled from networking and desktop bindings through an abstract gateway:
* **Local Web Mode**: Connects via WebSockets to `localhost:4000`.
* **Native Desktop Mode (Tauri / Electron)**: Connects via native OS IPC bindings.

---

## 3. Component Specification Index

* **[TopHeaderBar](./top_header_bar.md)**: Project title, Undo/Redo history buttons, 1px grid toggle, zoom, and exports.
* **[LeftToolboxSidebar](./left_toolbox_sidebar.md)**: Tools (brush, eraser, select), brush sizes ($1\times 1$ to $32\times 32$), LEGO palette, and SVG textures.
* **[CanvasViewport](./canvas_viewport.md)**: HTML5 Canvas rendering engine, camera panning, and mouse-wheel zooming ($10\%$ to $1200\%$).
* **[BoundingBoxOverlay](./bounding_box_overlay.md)**: Interactive SVG selection box, corner resize handles, and "Copy for AI" quick button.
* **[RightInspectorSidebar](./right_inspector_sidebar.md)**: Coordinate inspector, drag-and-drop preset library, and active instance management.
* **[BottomStatusBar](./bottom_status_bar.md)**: Live cursor coordinates, connection status indicator, and physical scale legend ($1\text{ stud} = 8\text{ mm}$).

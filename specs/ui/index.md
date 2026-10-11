# User Interface Specification (UI & UX)

This directory defines the visual ergonomics, functional component hierarchy, and interaction rules for the **Brick Wargame Terrain Studio** UI.

---

## 1. Visual Mockup & Layout Architecture

![Brick Studio UI Mockup](./mockup.svg)

The UI is structured into 5 cohesive components matching the layout:

```text
<StudioApp> (index.md)
├── <TopHeaderBar>               -> top_header_bar.md (Branding, Asset Selector, Dimensions WxH, Grid Toggle)
├── <div className="flex flex-1">
│   ├── <LeftToolboxSidebar>     -> left_toolbox_sidebar.md (Brush/Eraser, Brush Size, 41 Flat Color Tiles)
│   ├── <SvgViewport>            -> svg_viewport.md (Interactive SVG Continuous 2D Grid & BBox Overlay)
│   └── <RightInspectorSidebar>  -> right_inspector_sidebar.md (Bounding Box Controls & Framing Actions)
└── <BottomStatusBar>            -> bottom_status_bar.md (Cursor Position, Painted Cells Total, Live Sync)
```

---

## 2. Component Specification Index

* **[`top_header_bar.md`](./top_header_bar.md)**: Clean identity ("Brick Wargame Terrain Studio"), asset switching dropdown, new asset action, width/height dimensions inputs, and optional grid toggle.
* **[`left_toolbox_sidebar.md`](./left_toolbox_sidebar.md)**: Tool mode selector (Brush vs Eraser), brush size presets ($1\times 1, 2\times 2, 4\times 4$), and 41 official brick color swatches displayed as 1x1 flat squares.
* **[`svg_viewport.md`](./svg_viewport.md)**: High-performance interactive 2D flat SVG grid with **continuous stud surfaces by default** (no round nubs, optional reference grid toggle), click/drag painting, and bounding box visual overlay.
* **[`right_inspector_sidebar.md`](./right_inspector_sidebar.md)**: Bounding box numerical inputs ($x, y, w, h$), quick framing actions ("Fit to Asset", "Clear"), and area fill ("Fill BBox").
* **[`bottom_status_bar.md`](./bottom_status_bar.md)**: Live stud cursor coordinates under pointer, painted stud metrics, and real-time backend connection status.

---

## 3. UI Acceptance Scenarios Index

Located under [`features/`](./features/):
* [`header.feature`](./features/header.feature): Asset switching, new asset creation, dimension updates, grid toggle.
* [`toolbox.feature`](./features/toolbox.feature): Tool modes (brush vs eraser), brush sizes, palette selection.
* [`viewport.feature`](./features/viewport.feature): Interactive grid painting with continuous cells, eraser clearing, bounding box visual highlight.
* [`inspector.feature`](./features/inspector.feature): Bounding box adjustments, quick actions (Fit to Asset, Fill Area).

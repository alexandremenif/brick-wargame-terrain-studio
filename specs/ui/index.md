# User Interface Specification (UI & UX) - Single Asset Studio

This directory defines the functional studio component architecture and interaction rules for the Single Asset Studio & Parity MVP.

---

## 1. Overview & Component Architecture

The studio layout is structured into 4 cohesive components:

```
<StudioApp>
├── <AssetDimensionsControl>  -> asset_dimensions_controls.md
├── <BoundingBoxControl>      -> bounding_box_controls.md
├── <LegoPaletteToolbar>      -> lego_palette_toolbar.md
└── <AssetSvgViewport>        -> asset_svg_viewport.md
```

---

## 2. Core Functional Capabilities

* **Asset Dimensions**: Name display and numerical controls to set or update asset size ($W \times H$).
* **Bounding Box Definition**: Numerical controls for active bounding box region ($x, y, width, height$).
* **Brush Painting**: Palette of official LEGO colors and interactive click/drag painting on the asset grid.
* **SVG Rendering & Parity**: The SVG viewport shares the identical visual rendering model used by MCP `get_asset_image`.

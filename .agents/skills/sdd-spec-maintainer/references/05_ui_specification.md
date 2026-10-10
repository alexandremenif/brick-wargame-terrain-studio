# Reference: Maintaining specs/05_ui_specification/

## Purpose
The `specs/05_ui_specification/` directory defines the visual ergonomics, React component architecture, and interaction rules for the playmat editor.

## Structure
* `index.md`: Entry point, global layout hierarchy, and `IEngineGateway` transport abstraction.
* Component specifications:
  * `top_header_bar.md`: File menu, undo/redo buttons, grid toggle, export modals.
  * `left_toolbox_sidebar.md`: Tool selection (Select, Brush, Fill, Eraser, Eyedropper) and brush size slider.
  * `canvas_viewport.md`: Smooth 60 FPS panning/zooming, infinite grid rendering, stud snapping.
  * `bounding_box_overlay.md`: Rectangular area selection, dashed bounding box overlay, coordinates badge.
  * `right_inspector_sidebar.md`: Active selection details, official LEGO color palette picker, preset library.
  * `bottom_status_bar.md`: Coordinates display, zoom level, canvas dimensions, MCP server connection status.

## Golden Rules
* When adding a new UI panel or feature, create a dedicated Markdown file and link it in `index.md`.
* UI components must remain decoupled from physical storage and communicate exclusively via `IEngineGateway`.

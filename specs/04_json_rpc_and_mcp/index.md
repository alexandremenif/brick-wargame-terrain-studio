# JSON-RPC API & MCP Integration Specification

This document specifies the JSON-RPC 2.0 communication facade and the AI tools exposed via the Model Context Protocol (MCP).

---

## 1. Protobuf-Enforced JSON-RPC Contract

All JSON-RPC method signatures map directly to `TerrainEngineService` declared in [`specs/01_domain/services.proto`](../01_domain/services.proto).

### Completeness Constraint:
The generated TypeScript interface requires every method to be implemented:
* `paintArea`: Paints a color and/or vector texture over a Bounding Box.
* `placePreset`: Positions a reusable preset instance.
* `movePreset`: Relocates an existing preset instance.
* `deletePreset`: Removes a preset instance.
* `undo` / `redo`: Reverts or reapplies historical actions.
* `renderBBoxImage`: Generates a PNG/JPEG raster image of a Bounding Box for multimodal AI inspection and exports.

---

## 2. Model Context Protocol (MCP) Tools

The unified server exposes the following tools to AI agents:

1. **`get_map_summary`**: High-level map stats (118x225 studs, present presets, undo/redo availability).
2. **`inspect_bounding_box`**: Granular inspection of cells and preset instances within $(x, y, w, h)$.
3. **`get_bounding_box_image`**: Multimodal visual rendering (PNG) of the target area.
4. **`paint_area`**: Paints a bounding box with an official LEGO color or texture.
5. **`place_preset`**, **`move_preset`**, **`delete_preset`**: Reusable structure management.
6. **`set_active_bounding_box`**: Focuses and scrolls the user's canvas to the agent's work area.
7. **`undo`** / **`redo`**: History navigation.

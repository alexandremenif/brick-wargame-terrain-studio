# Model Context Protocol (MCP) AI Server Specification

This document specifies the Model Context Protocol (MCP) tools exposed by the server to AI coding assistants and autonomous agents (Antigravity 2.0 / Claude Desktop).

---

## 1. Tool Mapping Overview

Each MCP tool is mapped directly from our domain command definitions to guarantee 100% parity with the UI:

| MCP Tool Name | Domain Command | Description |
| :--- | :--- | :--- |
| `create_asset` | `CreateAssetCommand` | Creates a new terrain asset with a name and dimensions ($W \times H$). |
| `update_asset_dimensions` | `UpdateAssetDimensionsCommand` | Resizes an existing asset to new dimensions. |
| `set_bounding_box` | `SetBoundingBoxCommand` | Sets or adjusts the active bounding box region $(x, y, w, h)$. |
| `paint_area` | `PaintAreaCommand` | Paints a rectangular area (or $1 \times 1$ cell) with an official LEGO `color_id`. |
| `list_assets` | `ListAssetsCommand` | Lists all available assets in the studio. |
| `list_colors` | `ListColorsCommand` | Lists the official LEGO colors catalog (`id`, `name`, `hex`). |
| `get_asset_image` | `GetAssetImageCommand` | Returns the rendered SVG image of the asset or of the bounding box. |

---

## 2. Dynamic Tool Registration & Live Parity

The MCP server runs over stdio and maps tool schemas directly from domain JSON Schemas:
* All mutations (`create_asset`, `update_asset_dimensions`, `paint_area`, `set_bounding_box`) persist immediately to SQLite and trigger real-time updates in the UI.
* `get_asset_image` returns the exact SVG image representation shared with the UI renderer.

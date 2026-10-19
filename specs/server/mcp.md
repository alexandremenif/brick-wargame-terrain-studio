# Model Context Protocol (MCP) AI Server Specification

This document specifies the Model Context Protocol (MCP) tools exposed by the server to AI coding assistants and autonomous agents (Antigravity 2.0 / Claude Desktop / Remote Agents).

---

## 1. Tool Mapping Overview

Each MCP tool is mapped directly from our domain command definitions to guarantee 100% parity with the UI:

| MCP Tool Name | Domain Command | Description |
| :--- | :--- | :--- |
| `create_asset` | `CreateAssetCommand` | Creates a new terrain asset with a name and dimensions ($W \times H$). |
| `update_asset` | `UpdateAssetCommand` | Updates an asset's name or dimensions ($W \times H$). Resizing down crops cells outside the new bounds. |
| `get_asset` | `GetAssetCommand` | Retrieves an asset's full state, dimensions, and 2D row-major `cells` color ID matrix (`0` for unpainted) for structured AI inspection. |
| `delete_asset` | `DeleteAssetCommand` | Deletes an asset and all its associated cells. |
| `paint_area` | `PaintAreaCommand` | Paints or erases a rectangular area (or $1 \times 1$ cell) with an official brick `color_id` (or `0` to clear cells). Overflow is clipped. |
| `list_assets` | `ListAssetsCommand` | Lists all available assets in the studio. |
| `list_colors` | `ListColorsCommand` | Lists the official brick colors catalog (`id`, `name`, `hex`). |
| `export_image` | `ExportImageCommand` | Exports an asset or framed sub-region as a PNG image with adaptive resolution and checkerboard transparency. Returns native MCP `ImageContent` (`image/png`). |

---

## 2. Dynamic Tool Registration & Streamable HTTP Transport

The MCP server supports **Streamable HTTP** transport (in addition to optional stdio) so that it can be hosted locally or remotely:
* All mutations (`create_asset`, `update_asset`, `delete_asset`, `paint_area`) persist immediately to SQLite and trigger real-time updates in the UI.
* Bounding boxes are transient selections supplied as arguments to `paint_area`, not stored on the persistent asset.
* AI agents inspect the layout and verify patterns directly through the structured coordinate cell array returned by `get_asset`.
* Multimodal AI agents call `export_image` to inspect the visual rendering. The tool automatically applies the adaptive `'llm'` profile ($\text{maxDimension} \le 800\text{px}$) and renders unpainted studs with a neutral checkerboard transparency pattern, returning native MCP `ImageContent` (`{ type: 'image', data: base64, mimeType: 'image/png' }`) so models visually distinguish empty space from white-painted bricks.


# Model Context Protocol (MCP) AI Server Specification

This document specifies the Model Context Protocol (MCP) tools exposed by the server to AI coding assistants and autonomous agents (Antigravity 2.0 / Claude Desktop).

---

## 1. Tool Mapping Overview

Each MCP tool is mapped directly from our pure domain command definitions:

| MCP Tool Name | Domain Command | Description |
| :--- | :--- | :--- |
| `create_map` | `CreateMapCommand` | Initializes a new terrain map asset with given width and height. |
| `paint_area` | `PaintAreaCommand` | Fills an axis-aligned bounding box with an official LEGO color. |
| `paint_cell` | `PaintCellCommand` | Modifies an individual stud cell color. |
| `undo` | `UndoCommand` | Reverts the last command on the specified terrain map. |

---

## 2. Dynamic Tool Registration

The MCP server runs over stdio and dynamically maps its `tools/list` schema directly from domain JSON Schemas, ensuring that parameter names, required fields, and integer ranges match domain invariants.

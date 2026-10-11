# LEGO Wargame Terrain Studio - Specifications

Welcome to the central specifications repository for **LEGO Wargame Terrain Studio**.
This directory is the **single source of truth** for all architectural principles, domain invariants, declarative contracts, persistence schemas, and user interface designs.

---

## 1. Project Context & Goals

### 1.1 Context & Purpose
The goal of this project is to build a modular game mat design and terrain generation tool for tabletop wargaming sessions played cooperatively or competitively against a Game Master across any universe or genre (fantasy, sci-fi, historical, modern).

* **Miniatures**: LEGO-compatible minifigures representing Heroes and Units on one side, and opposing forces on the other.
* **Physical 3D Scenery**: Vertical relief and tactical structures (trees, ruined walls, stone towers, bridges, rock formations) will be built out of **real LEGO bricks placed directly on the printed mat**.
* **Printed 2D Mat**: The studio does not render 3D trompe-l'œil structures, but designs the **flat 2D printed playmat** (printed as custom vinyl canvas via online print providers such as Pixartprinting, Printoclock, or Easyflyer).

---

### 1.2 Geometry & Real-World Dimensions
* **Dining Table Dimensions**: **$95\text{ cm} \times 180\text{ cm}$** ($950\text{ mm} \times 1800\text{ mm}$).
* **Standard LEGO Stud Pitch**: **$8.0\text{ mm} \times 8.0\text{ mm}$**.
* **Grid Resolution**:
  * Width: $\lfloor 950 / 8 \rfloor = 118$ studs ($944\text{ mm}$, providing a $3\text{ mm}$ bleed/cut margin on each side).
  * Length: $\lfloor 1800 / 8 \rfloor = 225$ studs ($1800\text{ mm}$).
  * Total Playmat Grid: **$118 \times 225 = 26,550$ studs**.

---

### 1.3 Visual Rendering & Printing Output
* **Flat 2D Vector Rendering**: Pure flat colors without fake 3D studs or cylinder shading.
* **Toggleable Reference Grid (1px)**: Optional 8 mm grid overlay that can be toggled on/off to verify physical brick alignment.
* **Official LEGO Color Palette**: Strict compliance with official LEGO brick color codes (Bright Green, Dark Tan, Medium Stone Grey, etc.).
* **Superimposed SVG Textures**: Vector patterns (cobblestone, ripples, cracked earth, grass clumps) overlayable onto colored studs.
* **High-Definition Print Export**: 300 DPI real-scale raster export (PNG/TIFF/PDF) with bleed marks for print services, plus optimized vector SVG export with polygon merging.

---

### 1.4 AI Delegation & Hybrid Navigation
* Most artistic terrain editing is delegated to an external AI agent (Antigravity 2.0 / Claude Desktop) via the **Model Context Protocol (MCP)**.
* The user inspects, pans, zooms, and selects **Bounding Boxes** on screen, copies stud coordinates for prompt injection, and watches AI edits render in real time.

---

## 2. Specification Navigation Index

The detailed specifications are organized into numbered modular section directories, each containing an `index.md` entry point:

1. [**01. Domain Model & Core Logic**](./01_domain/index.md)
   * Core aggregates (`TerrainMap`, `CellMatrix`, `PresetInstance`, `ActionHistory`), spatial validation, color palette, and formal Protobuf contracts (`domain.proto`, `api.proto`, `persistence.proto`).

2. [**02. System Architecture & Monorepo Layout**](./02_system_architecture/index.md)
   * Monorepo topology (`api`, `server`, `client`), process boundaries, communication flows, and local SQLite data isolation.

3. [**03. Persistence Layer**](./03_persistence/index.md)
   * Generic `PersistenceStore` port abstraction.
   * [SQL Store & SQLite WAL Adapter](./03_persistence/sql_store.md) (relational models, transaction semantics, spatial B-Tree queries, shared `schema.dbml`).
   * [In-Memory Store](./03_persistence/memory_store.md) (fast deterministic unit testing and headless simulation).

4. [**04. JSON-RPC API & MCP Integration**](./04_json_rpc_and_mcp/index.md)
   * Protobuf-enforced JSON-RPC 2.0 facade and Model Context Protocol (MCP) tools for AI agents (`get_map_summary`, `paint_area`, `place_preset`, `render_bbox_image`, etc.).

5. [**05. Web Studio User Interface**](./05_ui_specification/index.md)
   * High-performance Canvas viewport, top header bar, left toolbox, right inspector sidebar, bounding box overlay, and bottom status bar.

---

## 3. Code Generation Pipeline

Declarative contracts and schemas contained anywhere within `specs/` (`*.proto` and `*.dbml`) automatically compile into machine-generated types and migrations under `packages/api/src/generated/` and `packages/server/src/` via:

```bash
npm run codegen
```

> [!IMPORTANT]
> Files under `**/generated/**` are strictly read-only machine assets and must never be edited manually.

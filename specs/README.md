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

### 1.2 Geometry & Arbitrary Asset Dimensions
* **Standard LEGO Stud Pitch**: **$8.0\text{ mm} \times 8.0\text{ mm}$**.
* **Arbitrary Grid Scale**: Maps and presets are unified assets that can be created with **any arbitrary stud dimensions** ($width \ge 1, height \ge 1$).
* **Common Preset**: Standard dining table ($95\text{ cm} \times 180\text{ cm} \approx 118 \times 225 = 26,550$ studs) is an optional preset.

---

### 1.3 AI Delegation & Hybrid Navigation
* Terrain editing can be performed manually in the Web Studio or delegated to an external AI agent (Antigravity 2.0 / Claude Desktop) via the **Model Context Protocol (MCP)**.
* The user inspects, pans, zooms, and selects **Bounding Boxes** on screen, copies stud coordinates for prompt injection, and watches AI edits render in real time.

---

## 2. Specification Navigation Index

The specifications are organized into 4 clean layers matching system boundaries:

1. [**domain/**](./domain/index.md) - Pure Domain
   * Domain entities ([`schemas/model.yaml`](./domain/schemas/model.yaml)), command contracts ([`schemas/commands.yaml`](./domain/schemas/commands.yaml)), official rules ([`rules.md`](./domain/rules.md)), and acceptance criteria ([`features/terrain_domain.feature`](./domain/features/terrain_domain.feature)).
   * Zero network concepts, zero database dependencies.

2. [**server/**](./server/index.md) - Server Adapters & Ports
   * JSON-RPC 2.0 wire protocol in OpenRPC 1.2+ ([`openrpc.yaml`](./server/openrpc.yaml)).
   * SQLite relational storage model in DBML ([`schema.dbml`](./server/schema.dbml)).
   * AI agent tooling specification ([`mcp.md`](./server/mcp.md)).
   * Server BDD scenarios ([`features/persistence.feature`](./server/features/persistence.feature), [`features/jsonrpc_protocol.feature`](./server/features/jsonrpc_protocol.feature)).

3. [**ui/**](./ui/index.md) - Web Studio UI Presentation
   * High-performance Canvas viewport, toolbars, color palettes, and inspector panels.
   * Playwright UI BDD scenarios ([`features/toolbox.feature`](./ui/features/toolbox.feature)).

4. [**architecture/**](./architecture/index.md) - System Topology & Flows
   * Monorepo package breakdown and component boundaries.
   * End-to-end data flows ([`data_flows.md`](./architecture/data_flows.md)).

---

## 3. Code Generation Pipeline

Declarative contracts in `specs/` (`*.yaml` and `*.dbml`) automatically compile into machine-generated types and migrations under `packages/api/src/generated/` and `packages/server/src/` via:

```bash
npm run codegen
```

> [!IMPORTANT]
> Files under `**/generated/**` are strictly read-only machine assets and must never be edited manually.

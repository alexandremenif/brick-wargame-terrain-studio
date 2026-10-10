---
name: sdd-spec-maintainer
description: >-
  Guide and reference for authoring, editing, modularizing, and maintaining specification files
  in specs/ for LEGO Wargame Terrain Studio. Must be activated whenever the agent needs to analyze,
  extend, or update project specifications.
---

# Specification Maintenance Guide (SDD)

This skill provides reference guides and procedures for authoring and maintaining documentation and declarative schema files in `specs/`.

---

## 1. Directory Structure Rule

* **Root Document**:
  `specs/README.md` is the root navigation entry point, project context, and table of contents.
* **Systematic Directory Organization**:
  Every section under `specs/` (e.g. `01_domain/`, `02_system_architecture/`, etc.) is a dedicated directory with an `index.md` file.
* **Modular Specifications**:
  No single Markdown specification should become a monolithic document. Subsystems and components are documented in dedicated sibling Markdown files within the section folder (e.g. `sql_store.md`, `memory_store.md` in `specs/03_persistence/`, or component files in `specs/05_ui_specification/`).

---

## 2. Reference Guides by Specification Section

To understand how to edit each section of the specification, consult the corresponding reference guide in the `references/` subdirectory:

* **Domain Models & Contracts**: See [`references/01_domain.md`](./references/01_domain.md)
* **System Architecture & Layout**: See [`references/02_system_architecture.md`](./references/02_system_architecture.md)
* **Persistence & Storage**: See [`references/03_persistence.md`](./references/03_persistence.md)
* **JSON-RPC API & MCP Integration**: See [`references/04_json_rpc_and_mcp.md`](./references/04_json_rpc_and_mcp.md)
* **User Interface & Components**: See [`references/05_ui_specification.md`](./references/05_ui_specification.md)

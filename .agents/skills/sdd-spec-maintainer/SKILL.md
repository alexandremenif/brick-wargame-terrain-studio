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
* **Systematic Layer Organization**:
  The specification is strictly organized into 4 unnumbered layers matching system boundaries:
  * `specs/domain/`: Pure domain models, commands, rules, and invariants.
  * `specs/server/`: OpenRPC wire API, DBML storage schema, and MCP AI tooling.
  * `specs/ui/`: Interactive Canvas Studio, visual components, and UI interactions.
  * `specs/architecture/`: System topology, package breakdown, and data flows.
* **Modular Specifications**:
  No single Markdown specification should become a monolithic document. Subsystems and components are documented in dedicated sibling Markdown files within the layer folder (e.g. `canvas_viewport.md`, `left_toolbox_sidebar.md` in `specs/ui/`).
* **Executable BDD Scenarios (`features/`)**:
  Acceptance criteria are expressed as executable Gherkin feature files within a dedicated `features/` directory in the relevant layer (e.g. `specs/domain/features/` for domain invariants, `specs/server/features/` for protocol/persistence, or `specs/ui/features/` for UI flows). Markdown specifications link to and contextualize these scenarios.

---

## 2. Reference Guides by Specification Layer

To understand how to edit each layer of the specification, consult the corresponding reference guide in the `references/` subdirectory:

* **Domain Layer (JSON Schema & Invariants)**: See [`references/domain.md`](./references/domain.md)
* **Server Layer (OpenRPC, DBML & MCP)**: See [`references/server.md`](./references/server.md)
* **UI Layer (Canvas Studio & Components)**: See [`references/ui.md`](./references/ui.md)
* **Architecture Layer (Topology & Data Flows)**: See [`references/architecture.md`](./references/architecture.md)

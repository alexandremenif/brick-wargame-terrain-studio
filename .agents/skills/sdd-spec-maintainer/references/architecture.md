# Reference: Maintaining specs/architecture/

## Purpose
The `specs/architecture/` directory defines overall system topology, monorepo package layout, component boundaries, and end-to-end data flows.

## Structure
* `index.md`: Architecture diagrams, monorepo packages (`api`, `server`, `ui`, `dbml-compiler`), and process communication flows.
* `data_flows.md`: End-to-end traces: UI/MCP -> Wire Router -> Domain Engine -> Storage.

## Golden Rules
* System-wide architectural adjustments and cross-cutting topology changes must be documented here.

# Reference: Maintaining specs/domain/ (Domain & Schemas)

## Purpose
The `specs/domain/` directory contains conceptual models, invariants, and declarative contracts for domain entities and commands. It contains zero network or database dependencies.

## Structure
* `index.md`: Aggregate descriptions, ubiquitous language, conceptual invariants, and boundaries.
* `rules.md`: Invariants, constraints, and business domain rules.
* `schemas/model.yaml`: Protocol-agnostic JSON Schema defining core domain entities, value objects, and data models.
* `schemas/commands.yaml`: Protocol-agnostic JSON Schema defining domain commands, input parameters, and execution responses.
* `features/*.feature`: Executable BDD scenarios validating business invariants, domain operations, and boundary conditions.

## Golden Rules
* Any new domain entity or command MUST be authored in `schemas/model.yaml` or `schemas/commands.yaml` first.
* Always adhere to standard JSON Schema (Draft 7 / 2020-12) syntax in YAML format with descriptive `title` attributes on definitions.
* **Mandatory Codegen**: Any approved edit in domain schema files requires running:
  ```bash
  npm run codegen
  ```
* NEVER manually edit generated files in `packages/api/src/generated/`.

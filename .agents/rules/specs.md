---
trigger: glob
globs: "specs/**"
description: "Strict rules for modifying specification files (Spec-Driven Development)"
---

# Specification Modification Rules

1. **Mandatory User Approval (Golden Rule)**:
   * You are STRICTLY FORBIDDEN from creating, editing, or deleting any file in `specs/` without first presenting a detailed proposal to the user and obtaining their explicit approval.
   * If an ambiguity or contradiction arises during development, stop immediately and ask the user for clarification.

2. **Systematic Layered Directory Organization**:
   * `specs/README.md` is the root entry point, project context, and table of contents for the entire specification suite.
   * Every major layer under `specs/` (`domain/`, `server/`, `ui/`, `architecture/`) MUST systematically be a dedicated directory with an `index.md` entry point.
   * Subsystems and components within a layer are authored as dedicated sibling Markdown files (e.g. `canvas_viewport.md`, `left_toolbox_sidebar.md` in `specs/ui/`).

3. **No Executable Code in `specs/` & Declarative Contract Colocation**:
   * Specifications must contain NO executable code (.ts, .js, .tsx, .py).
   * Only formal declarative formats are permitted:
     * Markdown (`.md`) for documentation and acceptance test criteria.
     * Pure domain schemas in JSON Schema / YAML (`schemas/*.yaml` in `specs/domain/`).
     * Wire API specifications in OpenRPC 1.2+ (`openrpc.yaml` in `specs/server/`).
     * Relational schema definitions in DBML (`schema.dbml` in `specs/server/`).
     * Executable BDD scenarios (`.feature`) co-located in `features/` within each layer.

4. **Mandatory Codegen Execution**:
   * After any approved change to declarative contract or schema files in `specs/`, you MUST immediately execute:
     ```bash
     npm run codegen
     ```
   * Generated files are saved strictly under `**/generated/**` and must never be edited manually.

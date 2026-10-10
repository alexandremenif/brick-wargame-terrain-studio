---
trigger: glob
globs: "specs/**"
description: "Strict rules for modifying specification files (Spec-Driven Development)"
---

# Specification Modification Rules

1. **Mandatory User Approval (Golden Rule)**:
   * You are STRICTLY FORBIDDEN from creating, editing, or deleting any file in `specs/` without first presenting a detailed proposal to the user and obtaining their explicit approval.
   * If an ambiguity or contradiction arises during development, stop immediately and ask the user for clarification.

2. **Systematic Directory Organization**:
   * `specs/README.md` is the root entry point, project context, and table of contents for the entire specification suite.
   * Every numbered section under `specs/` (e.g. `01_domain/`, `02_system_architecture/`, etc.) MUST systematically be a dedicated directory with an `index.md` entry point, even if currently holding a single document.
   * Subsystems and components within a section are authored as dedicated sibling Markdown files (e.g. `specs/03_persistence/sql_store.md`, `specs/03_persistence/memory_store.md`).

3. **No Executable Code in `specs/` & Declarative Contract Colocation**:
   * Specifications must contain NO executable code (.ts, .js, .tsx, .py).
   * Only formal declarative formats are permitted:
     * Markdown (`.md`) for documentation and acceptance test criteria.
     * Contract definition files (`.proto`, etc.) co-located within their relevant section (e.g. `specs/01_domain/`).
     * Relational schema definitions (`.dbml`, etc.) co-located within the persistence specification (e.g. `specs/03_persistence/`).

4. **Mandatory Codegen Execution**:
   * After any approved change to declarative contract or schema files in `specs/`, you MUST immediately execute:
     ```bash
     npm run codegen
     ```
   * Generated files are saved strictly under `**/generated/**` and must never be edited manually.

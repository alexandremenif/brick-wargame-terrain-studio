---
trigger: glob
globs: "**/generated/**"
description: "Strict prohibition against manual editing of automatically generated code"
---

# Generated Code Integrity Rule

1. **No Manual Editing**:
   * Any file or directory located inside a `**/generated/**` folder is a machine-generated asset produced from specifications in `specs/`.
   * It is STRICTLY FORBIDDEN for agents or developers to edit these files manually.

2. **Automated Pipeline**:
   * Any change to types, service contracts, or database schemas must be made in the source specifications under `specs/` (e.g., Protobuf contracts, DBML schemas) and compiled via:
     ```bash
     npm run codegen
     ```

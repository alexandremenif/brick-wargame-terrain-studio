---
trigger: glob
globs: "packages/ui/src/**/*.tsx"
description: "Mandatory Design System audit ensuring React components consume existing primitives"
---

# Design System Audit Rule

Whenever `.tsx` files in `packages/ui/src/` (outside `packages/ui/src/components/design_system/`) are created or modified:

1. **Mandatory Subagent Audit**:
   - You MUST invoke the `design-system-auditor` subagent (or execute its auditing procedure) to audit the modified `.tsx` files before completing any UI implementation task.
   - The audit ensures that code does not reinvent or inline raw HTML elements when a corresponding component already exists in `specs/ui/design_system/`.
   - You may only consider the UI implementation complete once the `design-system-auditor` issues an **APPROVED** verdict.

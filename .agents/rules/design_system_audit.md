---
trigger: glob
globs: "packages/ui/src/**/*.tsx,specs/ui/mockups/*.html"
description: "Mandatory Design System audit ensuring React components and HTML mockups strictly adhere to the project design system specification"
---

# Design System Audit Rule

Whenever `.tsx` files in `packages/ui/src/` or HTML mockup files in `specs/ui/mockups/*.html` are created or modified:

1. **Mandatory Subagent Audit**:
   - You MUST invoke the `design-system-auditor` subagent (or execute its auditing procedure) to audit the target files before completing any UI implementation task.
   - The auditor MUST consult [`specs/ui/design_system.md`](specs/ui/design_system.md) to discover the project's designated design system, its allowed component primitives, design tokens, and layout utilities.
   - The audit ensures that code does not reinvent or inline raw HTML elements when a corresponding design system component or layout utility defined in the specification exists.
   - You may only consider the UI implementation complete once the `design-system-auditor` issues an **APPROVED** verdict.

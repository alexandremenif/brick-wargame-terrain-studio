---
name: sdd-feature-development
description: >-
  Official Spec-Driven Development (SDD) methodology for developing, testing, and implementing features
  in LEGO Wargame Terrain Studio. Must be activated whenever the user asks to implement, modify,
  or extend any feature, UI component, or API.
---

# Spec-Driven Development (SDD) Feature Methodology

This skill teaches the mandatory 3-step cycle every agent must follow when implementing any feature in this repository.

---

## Step 1: Specification Verification & Validation

Before writing any application code:

1. **Verify `specs/`**:
   * Inspect the relevant files in `specs/` to verify if the requested feature is already completely and unambiguously described.
2. **If the spec is missing, incomplete, or contradictory**:
   * **STOP**: Do NOT modify the spec and do NOT write implementation code.
   * Draft a clear proposal for the user outlining the suggested modifications or additions to `specs/`.
   * Wait for the user's explicit approval.
3. **Update the Approved Spec**:
   * Once approved by the user, update the declarative files in `specs/`:
     * Contract definitions (e.g. `domain.proto`, `services.proto` in the domain specification).
     * Relational schemas (e.g. `schema.dbml` in the persistence specification).
     * **BDD Scenarios (Gherkin)**: Add canonical feature files in `specs/01_domain/features/*.feature` (for domain invariants) or `specs/05_ui_specification/features/*.feature` (for UI workflows).
     * Corresponding Markdown documentation referencing these features.

---

## Step 2: Automated Codegen & RED Tests (TDD & BDD)

1. **Execute Automated Codegen**:
   * Run the codegen script:
     ```bash
     npm run codegen
     ```
   * *Golden Rule*: Contract and DTO code in `src/generated/*` is generated strictly by this command, never by you manually.
2. **Write Failing Tests & Steps (RED)**:
   * Write or update domain step definitions in `packages/core-engine/test/steps/domain_steps.ts` delegating to `this.driver` (`EngineDriver`).
   * **Multi-Adapter Completeness**: Ensure the operation is represented across all 3 transport drivers:
     * `InMemoryDriver` in `packages/core-engine/test/support/memory_driver.ts` (direct aggregate).
     * `JsonRpcDriver` in `packages/server/test/support/jsonrpc_driver.ts` (JSON-RPC 2.0 facade).
     * `McpDriver` in `packages/server/test/support/mcp_driver.ts` (MCP AI tool invocation).
   * Verify that tests fail as expected (RED) by running:
     ```bash
     npm run test:bdd:headless
     ```
3. **Handling Missing Classes (Interfaces & Skeletons)**:
   * If tests require classes that do not yet exist:
     * **Always prefer creating a pure interface** describing the contract.
     * If a concrete class is strictly necessary, create a **minimal skeleton** (methods throwing `throw new Error('Not implemented')`) so tests compile but fail at runtime.
4. **Adversarial Test Audit (Non-Complacent Check)**:
   * Once you (the primary agent) have written the tests, submit them to the `test-auditor` subagent for audit.
   * Do not delegate the writing of tests to the subagent; the subagent's role is strictly adversarial inspection (detecting shallow assertions, weak coverage, lack of negative cases, or false positives).
   * Resolve any complacency smells flagged by `test-auditor` before moving to implementation.

---

## Step 3: GREEN Implementation & Contradiction Handling

1. **Implement the Code**:
   * Fill out the skeleton code until all tests pass (GREEN).
   * Respect architecture boundaries (domain logic does not depend on infrastructure adapters).
2. **Handling Contradictions**:
   * If you discover an unforeseen technical impossibility or a contradiction between the spec and the tests:
     * **STOP IMMEDIATELY**: Do NOT attempt a silent workaround.
     * Present the conflict to the user along with viable options, and wait for their decision.
3. **Final Verification & Test Audit Confirmation**:
   * Run the test suite:
     ```bash
     npm run test
     ```
   * Verify that the workspace builds cleanly:
     ```bash
     npm run build
     ```
   * Confirm that all test suites have been validated and approved by the `test-auditor` subagent.

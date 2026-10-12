---
trigger: glob
globs: "**/test/**, **/*.test.*, **/*.spec.*, **/*.feature, **/steps/**, **/support/**"
description: "Mandatory non-complacent test audit delegation to test-auditor subagent"
---

# Test Audit Rule

Whenever unit tests, integration tests, Gherkin feature files (`*.feature`), Cucumber step definitions (`**/steps/**`), or test drivers (`**/support/**`) are created, modified, or reviewed:

1. **Mandatory Subagent Audit**:
   - You MUST invoke the `test-auditor` subagent (or run its auditing procedure) to audit both the feature files and the underlying step definitions / drivers before completing the task.
   - The auditor must verify that step definitions actually execute the behavior against the target drivers rather than performing dummy no-ops or complacent passes.
   - You may only consider the test suite verified once the `test-auditor` approves the tests.

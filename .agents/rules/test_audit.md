---
trigger: glob
globs: "**/test/**, **/*.test.*, **/*.spec.*"
description: "Mandatory non-complacent test audit delegation to test-auditor subagent"
---

# Test Audit Rule

Whenever unit or integration test files are created, modified, or reviewed:

1. **Mandatory Subagent Audit**:
   - You MUST invoke the `test-auditor` subagent (or run its auditing procedure) to audit the test files before completing the task.
   - You may only consider the test suite verified once the `test-auditor` approves the tests.

---
description: "Test MCP access from Task tool agents - CRITICAL validation for plugin approach"
argument-hint: ""
allowed-tools:
  - Task
  - Read
---

You have been invoked via the /test-mcp-mvp command.

# CRITICAL TEST: MCP Access Validation

This test determines if the Feature Harness pure plugin approach is viable.

**Question**: Can agents spawned via Task tool access MCP servers configured in the plugin?

# STEP 1: Explain Test to User

Tell the user:
```
🧪 Running MCP Access Validation Test

This CRITICAL test determines if plugin approach is viable by checking:
1. Can Task tool agents access Linear MCP configured in plugin?
2. Can Task tool agents access Playwright MCP configured in plugin?

If these tests fail, the plugin approach has a fundamental blocker.

Starting test agent...
```

# STEP 2: Launch Test Agent

Use the Task tool to spawn the test-mcp-agent:

```javascript
Task({
  description: "MCP access validation test",
  subagent_type: "feature-harness-mvp:test-mcp-agent",
  prompt: "Test Linear and Playwright MCP access from spawned agent"
})
```

# STEP 3: After Agent Completes

Read `test-results.txt` from repository root and display results to user.

Summarize the outcome:
- **If all tests passed**: "✅ MCP access validation PASSED. Plugin approach is viable. Proceed with Phase 2 (MVP plugin build)."
- **If any test failed**: "❌ MCP access validation FAILED. BLOCKER identified. Plugin approach may require alternative design or stay with Agent SDK."

Provide the user with next steps based on results.

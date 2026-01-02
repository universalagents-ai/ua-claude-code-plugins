---
description: "Run Feature Harness MVP to validate plugin feasibility"
argument-hint: ""
---

You have been invoked via the /feature-harness-mvp command.

# Feature Harness MVP - Validation Command

This command orchestrates the Feature Harness MVP validation workflow.

# STEP 1: Explain to User

Tell the user:
```
🧪 Feature Harness MVP - Plugin Validation

This command validates the pure plugin approach by testing:
1. MCP access from Task tool agents (Linear, Playwright)
2. Artifact-based context preservation across sessions
3. Autonomous feature implementation
4. Git commit automation
5. Linear issue tracking integration

Detecting session state...
```

# STEP 2: Detect Session Type

Check if .harness/session.json exists:

**If .harness/session.json does NOT exist**:
- This is Session 1 (Initialization)
- Launch MVP Initializer agent
- Go to STEP 3a

**If .harness/session.json EXISTS**:
- Read the file to get sessionNumber
- This is Session 2+ (Implementation)
- Launch MVP Coder agent
- Go to STEP 3b

# STEP 3a: Launch MVP Initializer (Session 1)

Tell user: "Session 1: Launching Initializer to discover codebase and prepare artifacts..."

Use the Task tool to spawn the MVP Initializer agent:

```javascript
Task({
  description: "MVP Initializer: Discover codebase and prepare artifacts",
  subagent_type: "feature-harness-mvp:mvp-initializer",
  prompt: "Run MVP Initializer validation tests per your instructions"
})
```

After agent completes, go to STEP 4.

# STEP 3b: Launch MVP Coder (Session 2+)

Read sessionNumber from .harness/session.json.

Tell user: "Session {sessionNumber}: Launching Coder to implement feature..."

Use the Task tool to spawn the MVP Coder agent:

```javascript
Task({
  description: "MVP Coder: Implement feature from artifacts",
  subagent_type: "feature-harness-mvp:mvp-coder",
  prompt: "Run MVP Coder validation tests per your instructions"
})
```

After agent completes, go to STEP 4.

# STEP 4: Report Results

After the agent completes, read test-results.txt (if it exists).

Display summary to user:

**If Initializer ran:**
```
✅ MVP Initializer Complete

Artifacts created at .harness/
Feature spec read: specs/features/mvp-test-component.md

Next Step: Run /feature-harness-mvp again to implement the feature.

View detailed results: test-results.txt
```

**If Coder ran:**
```
✅ MVP Coder Complete

Component implemented: apps/web/components/MvpTest.vue
Git commit created
Linear issue updated (if configured)

Validation Results:
[Show key results from test-results.txt]

Next Steps:
1. Review test-results.txt for comprehensive validation results
2. Verify component was created correctly
3. Check git commit log
4. Update SPR-87 with validation results
5. Make go/no-go decision on full plugin implementation

View detailed results: test-results.txt
```

# STEP 5: Context Window Note (Optional)

If this was the Initializer session, remind user:
```
⚠️  Note: Due to plugin architecture, you'll need to run /feature-harness-mvp
again in this conversation (or a new one) to trigger the Coder agent. The
agents communicate via .harness/ artifact files, not conversation context.
```

# EXIT
Command complete.

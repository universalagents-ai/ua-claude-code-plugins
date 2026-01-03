---
description: "Gracefully stop Feature Harness execution and create a manual checkpoint for later resumption"
argument-hint: "[--reason <message>]"
allowed-tools:
  - Read
  - Write
  - Bash
  - AskUserQuestion
---

# Feature Stop Command

Gracefully stop the Feature Harness system and create a manual checkpoint. Use this when you need to pause autonomous implementation and return later.

## What This Command Does

**Creates a manual checkpoint:**
1. Reads current session and feature state
2. Asks user for stop reason (optional)
3. Creates checkpoint file with current state
4. Updates session.json to "checkpoint" status
5. Adds entry to progress log
6. Optionally adds comment to Linear issue
7. Tells user how to resume later

**This is different from automatic checkpoints:**
- Automatic: Created by Coder Agent on failures (test_failure, playwright_browser_stuck, etc.)
- Manual: Created by you when you want to pause intentionally

## When to Use This

**Good reasons to stop:**
- Need to investigate an implementation detail before continuing
- Want to review completed features before proceeding
- End of work session, want to pause until tomorrow
- Codebase changes require re-planning
- Linear priorities changed
- Need to manually implement a complex feature first
- Want to checkpoint before risky operation

**Don't use this for:**
- Test failures (let Coder Agent create automatic checkpoint)
- Trying to fix bugs (let checkpoint recovery handle it)
- Simple pauses (just stop - session state is preserved)

## Command Execution

### STEP 1: Check Current State

**Read session file:**
```
Read: .harness/session.json
```

**If file doesn't exist:**
```
❌ Feature Harness not running

The Feature Harness hasn't been initialized yet.

Nothing to stop.
```

**Stop here if not initialized**

**If session already has checkpoint:**
```
⚠️  Checkpoint already exists

There's already an active checkpoint from [timestamp].

Options:
1. View checkpoint: Read .harness/checkpoints/[latest].json
2. Resume: /feature-harness (will launch Resume Agent)
3. Force new checkpoint: Continue with /feature-stop --force

Do you want to create a new checkpoint anyway?
```

Use AskUserQuestion to ask if they want to continue.
If No, exit. If Yes, proceed.

### STEP 2: Read Current Feature Context

**If session status is "in_progress" (mid-implementation):**

1. **Read features.json:**
   ```
   Read: .harness/features.json
   ```

2. **Find the current feature:**
   - Look for feature with status "in_progress"
   - Read its details (featureId, name, linearIssueId)

3. **Warn user:**
   ```
   ⚠️  Feature implementation in progress

   Current feature: [feature-name] ([linear-issue-id])

   Stopping now will create a checkpoint mid-implementation.
   You can resume later, but you'll need to provide context
   about what was completed so far.

   Proceed with stop?
   ```

   Use AskUserQuestion to confirm.
   If No, exit. If Yes, proceed.

**If session status is "ready" or "completed":**
- Safe to stop between features
- No warning needed
- Proceed directly

### STEP 3: Ask for Stop Reason

**Ask user why they're stopping:**

```
Use AskUserQuestion with:

Question: "Why are you stopping the Feature Harness?"

Header: "Stop Reason"

Options:

1. End of work session
   Label: "End of work session"
   Description: "Taking a break, will resume later (tomorrow, next week, etc.)"

2. Need to investigate
   Label: "Need to investigate"
   Description: "Need to research or plan before continuing with implementation"

3. Codebase changes needed
   Label: "Codebase changes needed"
   Description: "Manual changes required before autonomous implementation can continue"

4. Priority change
   Label: "Priority change"
   Description: "Linear priorities changed, need to re-plan feature order"

5. Other
   Label: "Other (specify)"
   Description: "Custom reason - will prompt for details"

multiSelect: false
```

**If user selects "Other":**
Ask for custom reason as text input.

**Capture the reason for checkpoint message**

### STEP 4: Create Manual Checkpoint

**Generate checkpoint file:**

```json
{
  "sessionNumber": [current-session-number],
  "featureId": [current-feature-id OR null if between features],
  "featureName": [feature-name OR "Between features"],
  "linearIssueId": [issue-id OR null],
  "linearIssueIdentifier": [identifier OR null],
  "reason": "manual_stop",
  "stopReason": "[user-provided-reason]",
  "manualCheckpoint": true,
  "requiresHumanAction": false,
  "message": "Manual stop requested by user: [reason]",
  "createdAt": "[current-timestamp]",
  "artifactState": {
    "sessionJson": { ...current session.json... },
    "featuresJson": { ...current features.json... },
    "featureProgress": "[description of where we are in current feature, or null]"
  }
}
```

**Write checkpoint file:**
```
Write: .harness/checkpoints/manual-[timestamp].json
```

**File name format:**
- `manual-2026-01-02T15-30-00.json`
- Note "manual-" prefix to distinguish from automatic checkpoints

### STEP 5: Update Session State

**Update session.json:**

```json
{
  "sessionNumber": [current-number],
  "status": "checkpoint",
  "checkpointReason": "manual_stop",
  "lastUpdated": "[current-timestamp]",
  "lastFeatureId": [last-completed-feature-id OR null],
  "manualCheckpoint": true,
  "stoppedBy": "user",
  "stoppedAt": "[current-timestamp]"
}
```

```
Write: .harness/session.json
```

### STEP 6: Update Progress Log

**Append to progress.txt:**

```
Read: .harness/progress.txt
```

Add entry:
```
=== MANUAL STOP - [timestamp] ===
Session: [session-number]
Status: checkpoint (manual)
Reason: [user-provided-reason]

[If mid-feature]:
Current feature: [feature-name] ([linear-issue-id])
Feature progress: Implementation in progress

[If between features]:
Last completed: [last-feature-name]
Next pending: [next-feature-name]

Manual checkpoint created at: .harness/checkpoints/manual-[timestamp].json

To resume: Run /feature-harness (Resume Agent will guide recovery)
===
```

```
Write: .harness/progress.txt
```

### STEP 7: Optional Linear Update

**If Linear MCP is configured AND currently implementing a feature:**

```
mcp__linear-server__create_comment with:
issueId: [current-feature-linear-id]
body: "⏸️ Feature Harness manually stopped

Reason: [user-provided-reason]
Stopped at: [timestamp]

The harness has been paused by user request. Implementation will resume when /feature-harness is run again.

Checkpoint: .harness/checkpoints/manual-[timestamp].json"
```

**If between features or Linear not configured:**
- Skip Linear update

### STEP 8: Confirm Stop to User

**Tell user what happened:**

```
⏸️  Feature Harness stopped successfully

Checkpoint created: .harness/checkpoints/manual-[timestamp].json
Session status: checkpoint
Reason: [user-provided-reason]

[If mid-feature]:
Current feature: [feature-name] ([linear-issue-id])
Status: Implementation paused - you can resume later

[If between features]:
Last completed: [last-feature-name]
Next up: [next-feature-name]

To resume:
1. Run /feature-harness
2. The Resume Agent will guide you through resumption
3. You can choose to:
   - Continue with paused feature
   - Skip to next feature
   - Review and adjust plans

Session state preserved. You can close this context window safely.

═══════════════════════════════════════════════════
```

**Final message variations:**

**If stopped mid-feature:**
```
💡 TIP: Since you stopped mid-implementation, when you resume:
- Review what was completed so far (check git diff)
- Decide if you want to continue or restart the feature
- The Resume Agent will ask you how to proceed
```

**If stopped between features:**
```
💡 TIP: You stopped between features - a clean checkpoint!
- Next session will start fresh with the next feature
- All context is preserved in .harness/ artifacts
- Simply run /feature-harness when ready to continue
```

## Error Handling

**If no .harness/ directory:**
```
❌ Feature Harness not initialized

Cannot stop - no active session.
```

**If session.json is malformed:**
```
❌ Session file corrupted

Cannot create checkpoint - session state is unclear.

Please investigate .harness/session.json manually.
```

**If checkpoint already exists:**
- Warn user
- Ask if they want to create another checkpoint
- If yes, create with unique timestamp (both will coexist)
- Resume Agent will use most recent

## Arguments

**--reason <message>**
Provide stop reason directly without interactive prompt:
```
/feature-stop --reason "End of day, picking up tomorrow"
```

**--force**
Force checkpoint creation even if one already exists:
```
/feature-stop --force
```

Useful if you want to create multiple checkpoints.

## Usage Examples

### End of work session
```
/feature-stop
```
→ Asks for reason, creates checkpoint, ready to resume later

### With custom reason
```
/feature-stop --reason "Need to review API design before continuing"
```
→ Creates checkpoint with provided reason

### Force new checkpoint
```
/feature-stop --force --reason "Second checkpoint for safety"
```
→ Creates checkpoint even if one exists

## Implementation Notes

**Manual checkpoints are different:**
- Created intentionally by user, not due to failure
- Have `manualCheckpoint: true` flag
- Have `reason: "manual_stop"`
- Include user's custom stop reason
- May or may not be mid-feature

**Resume behavior:**
- Resume Agent treats manual checkpoints same as automatic
- Explains stop reason to user
- Asks how to proceed (continue/skip/abort)
- User has full control over resumption

**Safety:**
- Always preserve current state
- Never destructive
- Can create multiple manual checkpoints
- Resume Agent uses most recent

## Related Commands

- `/feature-harness` - Resume from checkpoint
- `/feature-status` - Check current state before stopping
- `/feature-resume` - Explicitly resume (same as /feature-harness when checkpoint exists)

## Tips

**When to use /feature-stop:**
- ✅ End of work session (clean pause)
- ✅ Need to manually investigate something
- ✅ Want to review progress before continuing
- ✅ Priorities changed, need to re-plan

**When NOT to use /feature-stop:**
- ❌ Tests failed (let Coder create automatic checkpoint)
- ❌ Playwright stuck (let Coder handle it)
- ❌ Just want to pause briefly (state is always preserved)

**Best practices:**
- Provide clear stop reasons for future you
- Stop between features when possible (cleaner)
- Review /feature-status before stopping
- Document what to check when resuming

---

**This command creates a safe checkpoint** - you can always resume exactly where you left off.

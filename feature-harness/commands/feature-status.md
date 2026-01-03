---
description: "Display current Feature Harness progress, session state, completed features, and next steps"
argument-hint: "[--detailed]"
allowed-tools:
  - Read
  - Bash
---

# Feature Status Command

Show the current state of the Feature Harness system - what's been completed, what's in progress, what's pending, and what to do next.

## What This Command Does

**Reads artifacts and displays:**
1. Current session number and status
2. Total features and completion percentage
3. List of completed features (with Linear IDs)
4. Current feature (if in progress)
5. Pending features to implement
6. Skipped/needs-manual features
7. Checkpoint information (if exists)
8. Next action for user

## Command Execution

### STEP 1: Check if Feature Harness is Initialized

**Read session file:**
```
Read: .harness/session.json
```

**If file doesn't exist:**
```
❌ Feature Harness not initialized

The Feature Harness system hasn't been initialized yet.

To get started:
1. Create feature specs: /write-spec
2. Initialize the harness: /feature-harness

Or see the guide: Invoke the harness-guide skill
```

**Stop here if not initialized**

### STEP 2: Read All Artifacts

**Read the main artifact files:**

1. **Session state:**
   ```
   Read: .harness/session.json
   ```

2. **Features list:**
   ```
   Read: .harness/features.json
   ```

3. **Progress log** (optional, for --detailed flag):
   ```
   Read: .harness/progress.txt
   ```

4. **Check for checkpoints:**
   ```bash
   ls .harness/checkpoints/*.json 2>/dev/null | wc -l
   ```

5. **Linear project** (if configured):
   ```
   Read: .harness/.linear_project.json
   ```

### STEP 3: Calculate Statistics

**From features.json, count:**
- Total features
- Completed features (status: "completed")
- In progress features (status: "in_progress")
- Pending features (status: "pending" or "todo")
- Skipped features (status: "needs-manual" or "skipped")
- Failed features (those with checkpoint files)

**Calculate:**
- Completion percentage: `(completed / total) * 100`
- Remaining features: `total - completed - skipped`

### STEP 4: Display Status Report

**Format the output like this:**

```
═══════════════════════════════════════════════════
  FEATURE HARNESS STATUS
═══════════════════════════════════════════════════

📊 OVERVIEW
─────────────────────────────────────────────────
Session:        3
Status:         ready
Last updated:   2026-01-02 15:30:00

Progress:       3 of 10 features (30%)
Remaining:      7 features

─────────────────────────────────────────────────

✅ COMPLETED (3)
─────────────────────────────────────────────────
1. User Authentication (SPR-120) ✓
   Implemented in session 1

2. User Profile Editing (SPR-123) ✓
   Implemented in session 2

3. Social Feed (SPR-124) ✓
   Implemented in session 3

─────────────────────────────────────────────────

📋 PENDING (7)
─────────────────────────────────────────────────
1. User Notifications (SPR-126) - Next
   Priority: High
   Dependencies: User Authentication ✓

2. Payment Integration (SPR-125)
   Priority: Medium
   Dependencies: None

3. Admin Dashboard (SPR-127)
   Priority: Low
   Dependencies: User Authentication ✓

[... list all pending features ...]

─────────────────────────────────────────────────

🔄 NEXT STEPS
─────────────────────────────────────────────────
✓ Ready to implement next feature

Run this command to continue:
  /feature-harness

The Coder Agent will implement "User Notifications" (SPR-126)

─────────────────────────────────────────────────

💡 TIP
─────────────────────────────────────────────────
Each /feature-harness session implements 1-2 features.
Check Linear for detailed progress and issue updates.

═══════════════════════════════════════════════════
```

**VARIATION: If status is "checkpoint":**

```
═══════════════════════════════════════════════════
  FEATURE HARNESS STATUS
═══════════════════════════════════════════════════

📊 OVERVIEW
─────────────────────────────────────────────────
Session:        2
Status:         ⏸️  CHECKPOINT
Last updated:   2026-01-02 15:30:00

Progress:       1 of 10 features (10%)
Remaining:      9 features

─────────────────────────────────────────────────

⚠️  CHECKPOINT ACTIVE
─────────────────────────────────────────────────
Reason:         test_failure
Feature:        User Profile Editing (SPR-123)
Created:        2026-01-02 15:25:00

The Coder Agent encountered an issue and created a checkpoint.

What went wrong:
Automated tests failed when implementing the user profile editing
feature. The bio update functionality isn't working correctly.

─────────────────────────────────────────────────

✅ COMPLETED (1)
─────────────────────────────────────────────────
1. User Authentication (SPR-120) ✓

─────────────────────────────────────────────────

🔄 NEXT STEPS
─────────────────────────────────────────────────
⚠️  Checkpoint needs resolution

Options:
1. Fix the issue and run: /feature-harness (to retry)
2. Skip this feature and move on: /feature-harness (choose "skip")
3. Investigate further: Read checkpoint at .harness/checkpoints/[timestamp].json

The Resume Agent will guide you through recovery.

═══════════════════════════════════════════════════
```

**VARIATION: If status is "completed" (all done):**

```
═══════════════════════════════════════════════════
  FEATURE HARNESS STATUS
═══════════════════════════════════════════════════

📊 OVERVIEW
─────────────────────────────────────────────────
Session:        11
Status:         🎉 ALL COMPLETE
Last updated:   2026-01-02 18:00:00

Progress:       10 of 10 features (100%)

─────────────────────────────────────────────────

✅ COMPLETED (10)
─────────────────────────────────────────────────
1. User Authentication (SPR-120) ✓
2. User Profile Editing (SPR-123) ✓
3. Social Feed (SPR-124) ✓
[... all features ...]

─────────────────────────────────────────────────

🎉 ALL FEATURES IMPLEMENTED!
─────────────────────────────────────────────────
All features from the specs have been successfully implemented,
tested, and committed.

Next steps:
• Review implementation in Linear
• Run integration tests
• Create pull request
• Deploy to staging

═══════════════════════════════════════════════════
```

**VARIATION: If there are skipped features:**

Include section:
```
⏭️  SKIPPED / NEEDS MANUAL (2)
─────────────────────────────────────────────────
1. Payment Integration (SPR-125)
   Reason: unclear_spec
   Skipped: 2026-01-02 14:30:00

2. Advanced Analytics (SPR-130)
   Reason: dependency_missing
   Skipped: 2026-01-02 16:00:00

These features require manual attention and have been moved to
Backlog in Linear.
```

### STEP 5: Detailed Mode (Optional)

**If --detailed flag is provided:**

Add these sections:

```
─────────────────────────────────────────────────

📜 SESSION HISTORY
─────────────────────────────────────────────────
Session 1: Initialization
  - Discovered codebase
  - Created Linear issues
  - Generated artifacts
  - Duration: ~15 minutes

Session 2: User Authentication (SPR-120)
  - Implemented feature
  - All tests passed
  - Committed: abc123def456
  - Duration: ~25 minutes

Session 3: User Profile Editing (SPR-123)
  - ⚠️ Checkpoint: test_failure
  - Resumed and fixed
  - All tests passed
  - Committed: def456abc123
  - Duration: ~35 minutes (including recovery)

[... all sessions ...]

─────────────────────────────────────────────────

📁 ARTIFACT FILES
─────────────────────────────────────────────────
.harness/
├── session.json ✓
├── features.json ✓
├── progress.txt ✓
├── codebase-inventory.json ✓
├── init.sh ✓
├── .linear_project.json ✓
└── checkpoints/
    ├── resolved/ (2 files)
    └── skipped/ (1 file)

─────────────────────────────────────────────────

🔗 LINEAR INTEGRATION
─────────────────────────────────────────────────
Project:        Feature Harness
Team:           Sprocket UX Limited
META Issue:     SPR-META-100

View in Linear: https://linear.app/sprocket-ux-limited/project/...

─────────────────────────────────────────────────
```

## Error Handling

**If .harness/ directory doesn't exist:**
```
❌ Feature Harness not initialized

Run /feature-harness to initialize the system.
```

**If session.json is malformed:**
```
❌ Session file is corrupted

The .harness/session.json file cannot be parsed.

You may need to:
1. Check the file manually for syntax errors
2. Restore from backup
3. Reinitialize the harness (will lose progress)
```

**If features.json is missing:**
```
⚠️  Features file missing

The .harness/features.json file is missing but session.json exists.

This indicates a corrupted state. Please check your .harness/ directory.
```

## Implementation Notes

**Keep it simple:**
- Just read and display - no modifications
- Use emoji sparingly for visual structure
- Clear section headers
- Easy to scan at a glance

**Key information to highlight:**
- Current status (ready/checkpoint/completed)
- What's next for the user
- Completion percentage
- Any blockers (checkpoints, skipped features)

**Linear integration:**
- Show Linear project if configured
- Include Linear issue IDs with features
- Provide links to Linear when possible

## Usage Examples

### Basic usage
```
/feature-status
```
→ Shows overview, completed, pending, next steps

### Detailed mode
```
/feature-status --detailed
```
→ Shows everything including session history, artifacts, Linear links

### After checkpoint
```
/feature-status
```
→ Highlights checkpoint, explains issue, shows recovery options

### When complete
```
/feature-status
```
→ Celebration message, all features done, suggests next steps

## Related Commands

- `/feature-harness` - Continue implementation
- `/feature-resume` - Resume from checkpoint (if status is "checkpoint")
- `/feature-stop` - Stop and create manual checkpoint
- `/write-spec` - Create new feature specs

## Tips

**Check status frequently:**
- After each /feature-harness session
- Before starting new work
- When returning after a break
- To understand current state

**Use --detailed for debugging:**
- To see full session history
- To understand what happened
- To check artifact integrity
- To verify Linear integration

**Share status with team:**
- Copy/paste the output for standup
- Include in progress reports
- Document in Linear comments

---

**This command is read-only** - it never modifies any files. It's safe to run anytime you want to check progress.

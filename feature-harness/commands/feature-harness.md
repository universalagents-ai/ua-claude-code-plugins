---
description: "Main Feature Harness command - detects session state and launches appropriate agent (Initializer for Session 1, Coder for Session 2+)"
argument-hint: "[--specs-dir <path>]"
allowed-tools:
  - Read
  - Write
  - Bash
  - Task
  - TodoWrite
---

# Feature Harness Command

This command is the **main entry point** for the Feature Harness system. It automatically detects the current session state and launches the appropriate agent.

## Session Detection Logic

### Session 1 (Initialization)
**When**: `.harness/session.json` does NOT exist

**Action**: Launch **Initializer Agent**

**What happens**:
- Discovers codebase (components, prototypes, patterns)
- Generates init.sh environment bootstrap script
- Reads feature specs from `specs/features/`
- Creates Linear project and issues (if configured)
- Generates artifacts in `.harness/`
- Commits initialization to git

### Session 2+ (Implementation)
**When**: `.harness/session.json` EXISTS and status is "ready" or "completed"

**Action**: Launch **Coder Agent**

**What happens**:
- Reads artifacts to restore context
- Runs init.sh to ensure environment is ready
- Selects highest priority pending feature
- Implements feature following spec
- Runs Playwright tests
- Commits if tests pass (or creates checkpoint if fail)
- Updates Linear issue status
- Returns control to user

### Checkpoint Recovery
**When**: `.harness/session.json` EXISTS and status is "checkpoint" or "waiting_human"

**Action**: Launch **Resume Agent**

**What happens**:
- Reads checkpoint details
- Explains what went wrong
- Asks user for action (retry/skip/modify)
- Updates artifacts and continues

## Command Execution

### STEP 1: Check Session State

**Read the session file:**
```
Read: .harness/session.json
```

**If file doesn't exist:**
- This is Session 1
- Proceed to launch Initializer Agent

**If file exists:**
- Parse the JSON
- Check `status` field
- Determine which agent to launch

### STEP 2: Launch Appropriate Agent

**For Session 1 (Initialization):**
```
Task: {
  subagent_type: "feature-harness:initializer",
  description: "Initialize Feature Harness Session 1",
  prompt: "Initialize the Feature Harness system:

1. Discover codebase components and patterns
2. Generate init.sh environment bootstrap script
3. Read feature specs from ${SPECS_DIR}
4. Create Linear project and issues (if configured)
5. Generate .harness/ artifacts
6. Commit initialization to git

Specs directory: ${SPECS_DIR}

Begin initialization now."
}
```

**For Session 2+ (Implementation):**
```
Task: {
  subagent_type: "feature-harness:coder",
  description: "Implement next feature",
  prompt: "Continue Feature Harness implementation:

1. Read artifacts from .harness/ to restore context
2. Run init.sh to ensure environment is ready
3. Select highest priority pending feature
4. Implement feature following spec
5. Run tests
6. Commit if tests pass
7. Update Linear and artifacts

Begin implementation now."
}
```

**For Checkpoint Recovery:**
```
Task: {
  subagent_type: "feature-harness:resume",
  description: "Resume from checkpoint",
  prompt: "Resume Feature Harness from checkpoint:

1. Read checkpoint details from .harness/
2. Explain what went wrong
3. Ask user for action (retry/skip/modify)
4. Update artifacts and continue

Begin recovery now."
}
```

### STEP 3: Handle Arguments

**Support optional arguments:**

**--specs-dir <path>**
- Override default specs directory
- Default: `specs/features/`
- Example: `/feature-harness --specs-dir custom/specs/path`

**Parse arguments:**
```bash
# Check for --specs-dir argument
SPECS_DIR="specs/features/"

if [[ "$1" == "--specs-dir" ]]; then
  SPECS_DIR="$2"
fi
```

**Pass to agent via prompt variable substitution**

## Implementation

**This command should:**

1. Use Read tool to check for `.harness/session.json`
2. Detect session state (Session 1, Session 2+, or Checkpoint)
3. Use Task tool to launch appropriate agent
4. Pass any command-line arguments to the agent
5. Let the agent do all the work (this command is just a dispatcher)

**DO NOT:**
- Perform any business logic in this command
- Read specs or create artifacts directly
- Call Linear MCP or other integrations
- Make decisions about implementation

**This command is purely a router** - it detects state and launches the correct agent.

---

## Error Handling

**If .harness/session.json is malformed:**
- Report error to user
- Suggest manual inspection
- Offer to reinitialize (WARNING: will overwrite existing state)

**If agent launch fails:**
- Report error to user
- Check that agent files exist in plugin
- Verify Task tool is available

**If specs directory doesn't exist:**
- Report error to user
- Suggest running `/write-spec` first
- Or provide path to existing specs with `--specs-dir`

---

## Usage Examples

### Start fresh (Session 1)
```
/feature-harness
```
→ Launches Initializer Agent

### Continue implementation (Session 2+)
```
/feature-harness
```
→ Launches Coder Agent (next feature)

### Repeat for each feature
```
/feature-harness  # Feature 1 complete
/feature-harness  # Feature 2 complete
/feature-harness  # Feature 3 complete
```

### Resume from checkpoint
```
/feature-harness
```
→ Detects checkpoint, launches Resume Agent

### Custom specs directory
```
/feature-harness --specs-dir custom/specs/
```
→ Uses custom directory for feature specs

---

## Tips

- **Run after writing specs**: Use `/write-spec` first to create feature specifications
- **One feature per session**: Each `/feature-harness` invocation implements ~1-2 features
- **Check status between runs**: Use `/feature-status` to see progress
- **Review Linear between sessions**: Check issue updates and META tracker
- **Trust the artifacts**: The system preserves full context across sessions

---

## Related Commands

- `/write-spec` - Create feature specifications before initializing
- `/feature-status` - Check current progress and session state
- `/feature-resume` - Explicitly resume from checkpoint
- `/feature-stop` - Stop execution and create manual checkpoint

---

## Technical Details

**Agent Selection Logic:**
```
if .harness/session.json does NOT exist:
  → Launch Initializer Agent

elif session.status == "checkpoint" OR "waiting_human":
  → Launch Resume Agent

elif session.status == "ready" OR "completed":
  → Launch Coder Agent

else:
  → Report error (unknown status)
```

**Argument Handling:**
- Parses `--specs-dir` argument
- Defaults to `specs/features/` if not provided
- Passes to agent via prompt variable

**Session State:**
- Stored in `.harness/session.json`
- Updated by each agent after execution
- Used to coordinate multi-session workflow

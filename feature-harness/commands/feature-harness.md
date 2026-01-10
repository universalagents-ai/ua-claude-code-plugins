---
description: "Main Feature Harness command - detects session state and routes to appropriate workflow (Completed → new feature, Ready → coding, No session → initialization)"
argument-hint: "[--specs-dir <path>]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Task
  - TodoWrite
  - AskUserQuestion
  - Skill
---

# Feature Harness Command - Orchestrator

This command is the **main orchestrator** for the Feature Harness system. It manages workflow state, handles human-in-the-loop interactions, and coordinates focused agents for autonomous work.

## Architecture: Command-as-Orchestrator

**Key Principle**: The command orchestrates, agents execute focused tasks.

```
ORCHESTRATOR (this command):
├── State management (.harness/*.json)
├── Human-in-the-loop (AskUserQuestion)
├── Linear MCP operations
├── Git operations
├── Artifact generation
├── Playwright browser testing (direct MCP calls)
└── Agent coordination:
    ├── codebase-scanner → Autonomous codebase analysis
    └── feature-implementer → Core coding work (can run parallel)
```

**Why this matters**:
- Agents can't spawn other agents (Task tool limitation)
- AskUserQuestion only works in commands
- Agents should be stateless, focused workers
- Command provides the coordination layer

---

# SESSION DETECTION AND ROUTING

## Step 1: Detect Session State

**Read the session file:**
```
Read: .harness/session.json
```

**Routing logic:**
```
if .harness/session.json does NOT exist:
  → INITIALIZATION WORKFLOW (Session 1)

elif session.status == "checkpoint" OR "waiting_human":
  → RESUME WORKFLOW (handled by resume agent)

elif session.status == "completed":
  → COMPLETED SESSION WORKFLOW (new feature selection)

elif session.status == "ready":
  → CODING WORKFLOW (Session 2+)

else:
  → Report error (unknown status)
```

---

# COMPLETED SESSION WORKFLOW

Execute when `.harness/session.json` exists AND `status == "completed"`.

**This workflow handles the transition between completed features and new ones.**

## Completed Step 1: Acknowledge Previous Completion

**Output to user:**
```
✅ Previous feature '[session.feature]' completed successfully!

Session [N] finished:
- Spec: [session.specPath]
- Issues: [X] completed
- Last commit: [session.lastCommitHash]
```

## Completed Step 2: Archive Old Session

**Create timestamped backups of completed session:**
```bash
cd "$(git rev-parse --show-toplevel)"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Create archive directory
mkdir -p .harness/archive

# Archive completed session files
mv .harness/session.json ".harness/archive/session-${TIMESTAMP}.json"
mv .harness/progress.txt ".harness/archive/progress-${TIMESTAMP}.txt"
```

## Completed Step 3: Scan for New Specs

**Check for unimplemented specs:**
```
Glob: "specs/features/**/*.md"
```

**For each spec found:**
1. Check if spec matches any completed session in `.harness/archive/`
2. Build list of specs that haven't been implemented yet
3. Check if user passed a specific spec via arguments

**If user specified a spec (e.g., `@specs/features/phase-3.md`):**
- Use that spec directly
- Skip the selection prompt

## Completed Step 4: User Selects Next Feature

**If multiple unimplemented specs exist:**

```
AskUserQuestion: {
  questions: [{
    question: "Which feature would you like to implement next?",
    header: "Feature",
    multiSelect: false,
    options: [
      // List unimplemented specs
      { label: "[spec-1-title] (Recommended)", description: "specs/features/spec-1.md" },
      { label: "[spec-2-title]", description: "specs/features/spec-2.md" },
      { label: "Exit - no new features", description: "End session without starting new work" }
    ]
  }]
}
```

**If only one unimplemented spec:**
```
AskUserQuestion: {
  questions: [{
    question: "Found 1 unimplemented spec: '[title]'. Start implementation?",
    header: "Confirm",
    multiSelect: false,
    options: [
      { label: "Yes, start implementation (Recommended)", description: "[spec path]" },
      { label: "No, exit", description: "End session" }
    ]
  }]
}
```

**If no unimplemented specs found:**
```
Output: "🎉 All specs have been implemented! No new features to build."
Output: "Create new spec files in specs/features/ and run /feature-harness again."
→ EXIT
```

## Completed Step 5: Store Selected Spec

**Before continuing to initialization, store the user's selection for Init Step 2:**

```
selectedSpecPath = [user's chosen spec path]
selectedSpecTitle = [parsed from spec file]
previousFeature = [session.feature from archived session]
linearProjectId = [from .harness/.linear_project.json - reuse existing]
```

## Completed Step 6: Continue to Initialization Workflow

**Hand off to INITIALIZATION WORKFLOW (Session 1)** with context:
- The selected spec path is known
- Linear project can be reused (cache exists in `.linear_project.json`)
- META issue can receive a new comment about the new feature

The initialization workflow will:
- Run environment check (Step 0)
- Check codebase inventory freshness (Step 1) - may reuse if <24h old
- Read the selected spec (Step 2)
- Continue through remaining initialization steps

→ **Continue to: INITIALIZATION WORKFLOW (Session 1)**

---

# INITIALIZATION WORKFLOW (Session 1)

Execute when `.harness/session.json` does NOT exist OR after Completed Session Workflow.

**This workflow runs entirely in the command** with agent assistance for focused tasks.

## Init Step 0: Environment Check

**What the command does directly:**

1. Create todo list for initialization workflow
2. Run `pwd` to verify repository root
3. Run `ls -la` to see directory structure
4. Read `CLAUDE.md` to understand project conventions
5. Read `package.json` to detect package manager
6. Check if `.harness/` directory exists (shouldn't on first run)

**Expected results:**
- Current directory confirmed
- Package manager detected (pnpm/npm/yarn)
- Project structure understood

## Init Step 1: Codebase Discovery (via Agent)

**Reference**: See `codebase-inventory` skill for inventory file format details.

### 1.1 Check for Existing Inventory

Before launching scanner agents, check if inventory files already exist:

```
Read: .harness/codebase-inventory.json
Read: .harness/codebase-inventory.md
```

**Determine inventory status:**

```
IF both files exist:
  Parse lastUpdated from JSON
  Calculate age = now - lastUpdated

  IF age < 24 hours:
    → Output: "📋 Found existing codebase inventory (updated: [timestamp])"
    → Set inventoryContext = existing inventory content
    → Scanners will VALIDATE against existing state
  ELSE:
    → Output: "📋 Inventory stale (>24h). Rescanning with comparison..."
    → Set inventoryContext = existing inventory for comparison

ELSE IF only JSON exists:
  → Output: "📋 Found partial inventory (missing .md). Rescanning..."
  → Set inventoryContext = JSON content

ELSE:
  → Output: "📋 No existing inventory found. Creating new..."
  → Ensure directory: mkdir -p .harness
  → Set inventoryContext = null
```

### 1.2 Launch Codebase Scanner Agents IN PARALLEL

**All 3 agents run simultaneously** with inventory context passed:

```
Task: {
  subagent_type: "feature-harness:codebase-scanner",
  description: "Scan UI components and patterns",
  prompt: "Focus: Component & UI Patterns. Scan apps/web/components/**/*.vue, apps/web/pages/**/*.vue. Document reusable components, naming conventions, Tailwind patterns, slot/emit usage.

  [IF inventoryContext exists:]
  EXISTING INVENTORY CONTEXT:
  [Include relevant sections from existing inventory]

  TASK: Validate existing inventory against current codebase state. Report any changes (added/removed/modified)."
}

Task: {
  subagent_type: "feature-harness:codebase-scanner",
  description: "Scan state and data flow",
  prompt: "Focus: State & Data Flow. Scan apps/web/composables/**/*.ts, apps/web/stores/**/*.ts, apps/web/server/api/**/*.ts. Document Pinia patterns, useFetch usage, API conventions.

  [IF inventoryContext exists:]
  EXISTING INVENTORY CONTEXT:
  [Include relevant sections from existing inventory]

  TASK: Validate existing inventory against current codebase state. Report any changes."
}

Task: {
  subagent_type: "feature-harness:codebase-scanner",
  description: "Scan architecture and deps",
  prompt: "Focus: Architecture & Dependencies. Read nuxt.config.ts, package.json, CLAUDE.md. Document layer structure, module usage, build configuration.

  [IF inventoryContext exists:]
  EXISTING INVENTORY CONTEXT:
  [Include relevant sections from existing inventory]

  TASK: Validate existing inventory against current codebase state. Report any changes."
}
```

Wait for all three to complete.

### 1.3 Merge Results and Update Inventory

Collect results from all 3 scanners and merge:

1. **Extract counts** from each scanner's structured output
2. **Combine patterns** from all focus areas (UI, State, Architecture)
3. **Deduplicate** component listings
4. **Compare with existing** (if inventoryContext was set):
   ```markdown
   ## Changes Since Last Scan

   | Metric | Previous | Current | Change |
   |--------|----------|---------|--------|
   | Components | [prev] | [curr] | +/-N |
   | Pages | [prev] | [curr] | +/-N |
   ```

5. **Update BOTH files** following `codebase-inventory` skill format:

**Write `.harness/codebase-inventory.json`** (machine-readable):
```json
{
  "lastUpdated": "[ISO timestamp]",
  "componentCount": N,
  "pageCount": N,
  "apiRouteCount": N,
  "storeCount": N,
  "composableCount": N,
  "architecture": {...},
  "patterns": {...},
  "scanners": {
    "uiPatterns": "[results from scanner 1]",
    "dataFlow": "[results from scanner 2]",
    "architecture": "[results from scanner 3]"
  }
}
```

**Write `.harness/codebase-inventory.md`** (human-readable):
```markdown
# Codebase Inventory

**Last Updated**: [ISO timestamp]
**Scanned By**: Feature Harness /feature-harness

## Summary
[2-3 sentences about codebase]

## File Counts
| Category | Count |
...

[See codebase-inventory skill for complete format]
```

## Init Step 2: Read Feature Specs

**Command reads specs directly:**

```
Glob: "specs/features/**/*.md"
```

For each spec file:
- Parse title, description, acceptance criteria
- Extract test cases
- Identify dependencies
- Assign priority (or use existing)

**Build enhanced feature objects** with codebase context from Step 1.

## Init Step 3: Human-in-the-Loop Confirmation (CRITICAL)

**This step MUST be in the command** - agents can't use AskUserQuestion.

### 3.1 Confirm Implementation Strategies

For features that match prototypes:

```
AskUserQuestion: {
  questions: [{
    question: "Feature '[name]' matches prototype '[file]'. How should we implement?",
    header: "Strategy",
    multiSelect: false,
    options: [
      {
        label: "Promote prototype to production (Recommended)",
        description: "Keep existing UI/UX, replace mock data with real APIs"
      },
      {
        label: "Use prototype as reference only",
        description: "Build from scratch following prototype's patterns"
      },
      {
        label: "Build completely new",
        description: "Ignore prototype, fresh implementation"
      }
    ]
  }]
}
```

### 3.2 Confirm Overall Plan

```
AskUserQuestion: {
  questions: [{
    question: "Review implementation plan. Proceed with [N] features?",
    header: "Confirm",
    multiSelect: false,
    options: [
      {
        label: "Yes, proceed as planned (Recommended)",
        description: "Features: [N] total. Dependencies validated."
      },
      {
        label: "Let me adjust priorities",
        description: "I want to change order or skip features"
      },
      {
        label: "Cancel initialization",
        description: "I need to update specs first"
      }
    ]
  }]
}
```

**If "adjust":** Wait for user guidance, update, ask again.
**If "cancel":** EXIT without creating artifacts.
**If "proceed":** Continue to Step 4.

## Init Step 4: Linear Project Selection (Human-in-the-Loop)

**Check for cached project:**
```
Read: .harness/.linear_project.json
```

**If cache exists and fresh (<30 days):** Use cached project ID.

**If no cache or stale:**

```
AskUserQuestion: {
  questions: [{
    question: "Which Linear project should Feature Harness use?",
    header: "Project",
    multiSelect: false,
    options: [
      // List existing projects from: mcp__linear-server__list_projects
      { label: "Feature Harness (existing)", description: "Use existing project" },
      { label: "Create new project", description: "Create fresh project" }
    ]
  }]
}
```

**Cache selection:**
```json
{
  "teamId": "[team]",
  "projectId": "[selected]",
  "projectName": "[name]",
  "cachedAt": "[timestamp]",
  "ttl": 2592000
}
```

## Init Step 5: Create Linear Issues (Command executes MCP)

**Reference**: Load `testable-increment-patterns` skill for ticket grouping guidance.

### 5.1 Parse Build Sequence for Ticket Boundaries

Scan the spec's Build Sequence section for `<!-- Ticket N: Title -->` annotations:

```markdown
<!-- Ticket 1: Block Card Grid -->
### Step 1: Create BlockCard component...
### Step 2: Add grid layout...

<!-- Ticket 2: Block Overlay System -->
### Step 3: Create overlay modal...
```

If annotations exist, use them to group steps into tickets.
If no annotations, group by user-testable capability (3-6 hours of work each).

### 5.2 Ticket Granularity Strategy

**CRITICAL**: Create tickets for testable milestones, NOT file-level steps.

**Grouping rules**:
1. Each ticket = 1 testable milestone (not 1 file)
2. Target 3-6 hours of work per ticket
3. Browser-verifiable outcome REQUIRED
4. Include "Test: Navigate to X, verify Y" in acceptance criteria

**Target**: 4-7 tickets per feature (NOT 14+)

### 5.3 Create Tickets

**For each testable increment, create issue:**

```
mcp__linear-server__create_issue with {
  team: "[team]",
  project: "[project]",
  title: "[User Capability Title]",
  description: "
## What User Can Do After This
[Description of user-facing capability]

## Files
| File | Action | Purpose |
|------|--------|---------|
| [files from this increment] |

## Playwright Test
\`\`\`
browser_navigate('/path')
browser_snapshot() -> verify [expectation]
\`\`\`

## Acceptance Criteria
- [ ] [Testable criterion 1]
- [ ] [Testable criterion 2]
- [ ] Browser verification passes
",
  priority: [1-4]
}
```

### 5.4 Set Dependencies

```
mcp__linear-server__update_issue with {
  id: "[issue-id]",
  blockedBy: ["dependency-id"]
}
```

## Init Step 6: Create META Tracking Issue

```
mcp__linear-server__create_issue with {
  team: "[team]",
  project: "[project]",
  title: "[META] Feature Harness Session Tracker",
  description: "Tracks all Feature Harness sessions. Never close this issue.",
  state: "in_progress"
}
```

Add initial comment with Session 1 summary.

## Init Step 7: Generate Artifacts

**Command creates all .harness/ files:**

1. `mkdir -p .harness/checkpoints`

2. Write `features.json`:
```json
{
  "features": [...],
  "metadata": {
    "totalFeatures": N,
    "generatedAt": "[timestamp]"
  }
}
```

3. Write `session.json`:
```json
{
  "sessionNumber": 1,
  "status": "ready",
  "linearProjectId": "[id]",
  "linearMetaIssueId": "[id]"
}
```

4. Write `progress.txt` with initialization log

## Init Step 7.5: Generate init.sh

**Analyze package.json** to detect:
- Package manager (pnpm/npm/yarn)
- Dev/build/test scripts
- Port configuration

**Write `.harness/init.sh`** with project-specific commands.

**Make executable:** `chmod +x .harness/init.sh`

## Init Step 8: Git Operations

```
AskUserQuestion: {
  questions: [{
    question: "Create feature branch for harness work?",
    header: "Branch",
    multiSelect: false,
    options: [
      { label: "Yes, create branch (Recommended)", description: "Isolate harness commits" },
      { label: "No, use current branch", description: "Continue on: [current-branch]" }
    ]
  }]
}
```

If yes: `git checkout -b feature/harness-[date]`

## Init Step 9: Commit and Push Artifacts

**Use commit-commands plugin for properly formatted commits:**

### 9.1 Stage Harness Artifacts

```bash
git add .harness/
```

### 9.2 Create Commit Using Commit-Commands

```
Skill: commit-commands:commit
```

The commit-commands plugin will:
- Create properly formatted commit message
- Include co-author attribution
- Follow conventional commit format

### 9.3 Push to Remote Repository

```bash
git push -u origin [branch-name]
```

**If push fails** (no remote or permission issues):
- Log warning to progress.txt
- Continue with initialization (push is not blocking)
- Tell user they may need to push manually

## Init Step 10: Handoff Summary

Output to user:
- What was initialized
- Linear project URL
- Next steps (run /feature-harness again)
- Artifacts created

**END INITIALIZATION WORKFLOW**

---

# CODING WORKFLOW (Session 2+)

Execute when `.harness/session.json` exists and status is "ready".

## Code Step 1: Environment Check

**CRITICAL: Establish repository root first!**

**Command does directly:**
1. Create todo list
2. **Navigate to repository root** (MANDATORY first step):
   ```bash
   cd "$(git rev-parse --show-toplevel)"
   pwd  # Verify location
   ```
3. Verify directory contains `.harness/` and `.git/`:
   ```bash
   ls -d .git .harness  # Both MUST exist
   ```
4. Read session.json, features.json, progress.txt
5. Read codebase-inventory.json for context

**IMPORTANT**: Shell variables do NOT persist between tool calls. Do NOT rely on `$REPO_ROOT` being set. Instead, use `cd "$(git rev-parse --show-toplevel)"` at the START of any Bash command that requires being at repo root (especially tests and git operations).

## Code Step 2: Review Linear Status

**Command queries Linear:**
```
mcp__linear-server__list_issues with {
  project: "[from .linear_project.json]"
}
```

Read META issue for session history.

## Code Step 3: Start Dev Server

**IMPORTANT: Track the dev server so it can be killed at session end.**

### 3.1 Kill Any Existing Dev Servers First (MANDATORY)

**CRITICAL: Always start with a clean slate to prevent port accumulation!**

```bash
echo "🧹 Cleaning up any existing dev servers..."

# Kill any existing processes on common dev ports (3000-3003)
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:3002 | xargs kill -9 2>/dev/null || true
lsof -ti:3003 | xargs kill -9 2>/dev/null || true

# Also kill any node processes running nuxt as backup
pkill -f "nuxt dev" 2>/dev/null || true

# Remove stale PID file if exists
rm -f .harness/.dev_server_pid

# Brief pause to ensure processes are terminated
sleep 1

# Verify ports are free
for port in 3000 3001 3002 3003; do
  if lsof -ti:$port >/dev/null 2>&1; then
    echo "⚠️ WARNING: Port $port still in use after cleanup"
  fi
done

echo "✅ Dev server cleanup complete"
```

### 3.2 Start Dev Server in Background

```bash
cd "$(git rev-parse --show-toplevel)"
chmod +x .harness/init.sh
.harness/init.sh dev &
DEV_SERVER_PID=$!
```

### 3.3 Store Dev Server PID for Cleanup

```bash
echo "$DEV_SERVER_PID" > .harness/.dev_server_pid
```

### 3.4 Verify Server is Running

Wait a few seconds, then verify server running on port 3000:
```bash
sleep 5
curl -s http://localhost:3000 > /dev/null && echo "✅ Dev server running on :3000" || echo "⚠️ Dev server may not be ready"
```

## Code Step 4: Regression Testing (REQUIRED - Orchestrator Executes Directly)

**CRITICAL**: Before implementing new features, verify existing work still functions.

**NOTE**: Regression testing is performed by the orchestrator directly using Playwright MCP tools (NOT via browser-tester subagent). This is because subagents cannot access the Linear MCP tools needed for full workflow integration.

**For 1-2 completed increments, perform regression testing directly:**

### 4.1 Identify Completed Increments to Test

From `features.json`, identify 1-2 recently completed features with browser-testable outcomes.

### 4.2 Execute Regression Tests Directly

For each completed increment:

1. **Navigate to the URL**:
   ```
   mcp__playwright__browser_navigate: { url: "[URL from completed ticket]" }
   ```

2. **Take a snapshot** to verify page structure:
   ```
   mcp__playwright__browser_snapshot: {}
   ```
   Parse snapshot to verify expected elements are present.

3. **Take a screenshot** for evidence:
   ```
   mcp__playwright__browser_take_screenshot: {
     filename: ".harness/regression-[timestamp]-[feature].png"
   }
   ```

4. **Check console for errors**:
   ```
   mcp__playwright__browser_console_messages: { level: "error" }
   ```
   If errors found, document them.

5. **Check network requests** if API verification needed:
   ```
   mcp__playwright__browser_network_requests: {}
   ```

### 4.3 Evaluate Regression Results

**If ALL tests PASS:**
- Log: "✅ Regression tests passed for [N] completed features"
- Continue to Step 5

**If ANY test FAILS:**
- Stop coding workflow immediately
- Document which feature(s) failed and why
- Fix regression first
- Do NOT proceed to new features with broken existing work

## Code Step 5: Select Next Feature

**Command queries Linear for highest priority Todo:**
```
mcp__linear-server__list_issues with {
  project: "[project]",
  state: "Todo",
  orderBy: "priority"
}
```

Check dependencies are met.

## Code Step 6: Update Linear Status

```
mcp__linear-server__update_issue with {
  id: "[issue-id]",
  state: "In Progress"
}
```

Update session.json with currentFeatureId.

## Code Step 7: Implement Feature (via feature-implementer agents)

**IMPORTANT**: Each ticket now spans MULTIPLE files (vertical slice). The feature-implementer should expect to create/modify all files in the ticket's file list.

**Reference**: The ticket description includes the Playwright test to run after implementation.

**PARALLEL IMPLEMENTATION**: Launch up to 3 feature-implementer agents simultaneously for non-conflicting features.

**Check for parallelizable features:**
1. No shared file dependencies
2. No blocking relationships
3. Different areas of codebase

```
Task: {
  subagent_type: "feature-harness:feature-implementer",
  description: "Implement [Testable Increment]",
  prompt: "Implement this testable increment:

  Title: [User Capability Title]
  Description: [What user can DO after this]

  ## Files to Create/Modify
  | File | Action | Purpose |
  |------|--------|---------|
  [ALL files from the ticket - types, store, components together]

  ## Playwright Test (REQUIRED)
  After implementation, this test MUST pass:
  \`\`\`
  browser_navigate('/path')
  browser_snapshot() -> verify [expectation]
  \`\`\`

  Acceptance Criteria:
  - [criterion 1]
  - [criterion 2]
  - Browser verification passes

  Related components: [from codebase-inventory]
  Implementation strategy: [promote_prototype | build_new]
  Patterns to follow: [from CLAUDE.md]

  Return: SUCCESS with files changed + Playwright test result, or BLOCKED with reason"
}
```

**For parallel execution (if 3 non-conflicting increments available):**

```
// Launch all 3 in single message
Task: feature-implementer for Increment A
Task: feature-implementer for Increment B
Task: feature-implementer for Increment C
```

Wait for all to complete.

## Code Step 8: Browser Verification (REQUIRED - Orchestrator Executes Directly)

**CRITICAL**: Browser verification is REQUIRED for every increment. Do NOT proceed to commit if this step fails.

**NOTE**: Browser verification is performed by the orchestrator directly using Playwright MCP tools (NOT via browser-tester subagent). This is because subagents cannot access the Linear MCP tools needed for full workflow integration.

**Reference**: Use the Playwright test from the ticket description.

### 8.1 Execute Browser Verification

1. **Navigate to the feature URL**:
   ```
   mcp__playwright__browser_navigate: { url: "[URL from ticket's Playwright test]" }
   ```

2. **Take an accessibility snapshot** to verify page structure:
   ```
   mcp__playwright__browser_snapshot: {}
   ```
   Parse the snapshot to verify:
   - Expected elements are present
   - Component structure matches acceptance criteria
   - Interactive elements are accessible

3. **Take a screenshot** for evidence:
   ```
   mcp__playwright__browser_take_screenshot: {
     filename: ".harness/verification-[timestamp]-[feature].png"
   }
   ```

4. **Check console for errors**:
   ```
   mcp__playwright__browser_console_messages: { level: "error" }
   ```
   Document any errors found.

5. **Check network requests** to verify API calls:
   ```
   mcp__playwright__browser_network_requests: {}
   ```
   Verify expected API endpoints were called.

6. **Interact with elements** if needed to verify functionality:
   ```
   mcp__playwright__browser_click: { element: "[description]", ref: "[ref]" }
   ```

### 8.2 Evaluate Verification Results

**If browser verification PASSES:**
- Log: "✅ Browser verification passed for [Feature Title]"
- Proceed to Step 9 (tests) and Step 10 (commit)

**If browser verification FAILS:**
1. Create checkpoint in `.harness/checkpoints/[timestamp].json`
2. Update session.json to status: "checkpoint"
3. Add Linear comment with failure details:
   ```
   mcp__linear-server__create_comment: {
     issueId: "[feature issue ID]",
     body: "## Browser Verification Failed\n\n[Details of failure]\n\nScreenshot: [path]"
   }
   ```
4. Fix the issue before proceeding
5. Re-run browser verification

**Only proceed to Step 9 (tests) and Step 10 (commit) if browser verification PASSES.**

## Code Step 9: Run Automated Tests

**IMPORTANT: Run tests from the correct directory!**

### 9.1 Ensure Correct Directory (MANDATORY)

**CRITICAL: This step is NON-NEGOTIABLE. Execute these commands BEFORE any test commands.**

```bash
# Step 1: Find and navigate to repository root
cd "$(git rev-parse --show-toplevel)"

# Step 2: Verify we're at repo root (MUST show path containing .git)
pwd
ls -d .git  # This MUST succeed

# Step 3: Confirm .harness directory exists (proves we're in right place)
ls -d .harness
```

**If any of these commands fail**, you are NOT at the repository root. Do NOT proceed with tests until you've navigated to the correct directory.

### 9.2 Run Project Tests

**These are the project's automated tests (unit tests, integration tests), NOT browser tests.**

The test command depends on the project structure. **Always run from repo root using pnpm --filter:**

```bash
# For monorepo (like Interplay) - run from repo root using filter:
pnpm --filter web test

# OR for single app (from repo root):
pnpm test
```

**DO NOT** use `cd apps/web && pnpm test` - this changes directory and can cause issues with subsequent commands.

**Note**: The Feature Harness plugin itself has no tests - it's the PROJECT being developed that has tests. If you see "feature-harness app has no tests", you're in the wrong directory.

### 9.3 Handle Test Results

**If tests FAIL:**
- Create checkpoint in `.harness/checkpoints/[timestamp].json`
- Update session.json to status: "checkpoint"
- Add Linear comment with failure details
- Tell user about checkpoint
- **STOP workflow**

**If tests PASS:** Continue to Step 10.

## Code Step 10: Commit Changes

**Only execute if tests passed in Step 9**

### 10.0 Ensure Correct Directory for Git Operations (MANDATORY)

**CRITICAL: This step is NON-NEGOTIABLE. Execute these commands BEFORE any git commands.**

Git commands MUST run from the repository root. If you skip this step, git add/commit will fail with "pathspec did not match any files".

```bash
# Step 1: Find and navigate to repository root (ALWAYS use this command)
cd "$(git rev-parse --show-toplevel)"

# Step 2: Verify we're at repo root
pwd  # MUST show the repository root path

# Step 3: Confirm .git directory exists here
ls -d .git  # This MUST succeed

# Step 4: Confirm .harness directory exists (proves we're in right place)
ls -d .harness
```

**If any of these commands fail**, you are NOT at the repository root. Do NOT proceed with git commands until you've navigated to the correct directory.

### 10.1 Use Commit-Commands Plugin

**CRITICAL**: Use the official commit-commands plugin for properly formatted commits.

```
Skill: commit-commands:commit
```

This will:
- Stage all changes with `git add .`
- Create commit with proper format including Linear issue reference
- Add co-author attribution
- Follow conventional commit format

**Expected commit format (handled by plugin):**
```
feat: Implement [feature name] (LINEAR-123)

- [Summary of changes]
- [Files created/modified]

Acceptance criteria:
✅ [criterion 1]
✅ [criterion 2]

Tests: All passing
Browser verification: Complete

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

### 10.2 Capture Commit Hash

After commit, get the commit hash:

```bash
COMMIT_HASH=$(git rev-parse HEAD)
```

### 10.3 Update features.json

Read `.harness/features.json`, update the completed feature:

```json
{
  "id": "feat-001",
  "status": "completed",
  "completedAt": "[timestamp]",
  "commitHash": "[hash from git]",
  "linearIssueId": "LINEAR-123"
}
```

Write the updated features.json back.

### 10.4 Push to Remote Repository

```bash
git push
```

This ensures:
- Team members can see progress
- CI/CD pipelines can run on commits
- Work is backed up remotely

**If push fails:**
- Log warning to progress.txt
- Continue with workflow (push is not blocking)
- Tell user they may need to push manually

### 10.5 Log to progress.txt

Append to `.harness/progress.txt`:

```
[timestamp] Session [N] - Feature feat-001 completed
  Issue: LINEAR-123 - [Feature Title]
  Files: X modified, Y created
  Tests: All passed
  Commit: [commit hash]
```

## Code Step 11: Update Linear

```
mcp__linear-server__update_issue with {
  id: "[issue-id]",
  state: "Done"
}
```

Add implementation comment to feature issue.

## Code Step 12: Update META and End Session

**CRITICAL: The META ticket MUST be updated with session progress!**

### 12.1 Get META Issue ID

Read from session.json:
```bash
cd "$(git rev-parse --show-toplevel)"
cat .harness/session.json | grep linearMetaIssueId
```

The `linearMetaIssueId` field contains the META tracking issue ID.

### 12.2 Update META Issue (REQUIRED)

**This step is MANDATORY - do NOT skip!**

Add session summary comment to the META issue:

```
mcp__linear-server__create_comment with {
  issueId: "[linearMetaIssueId from session.json]",
  body: "## Session [N] Progress Update

### Feature Completed
- **Issue**: [LINEAR-ID] - [Feature Title]
- **Commit**: `[commit hash]`
- **Files Changed**: [list of files]

### Test Results
- ✅ Type check passed
- ✅ Unit tests passed (X/Y)
- ✅ Browser verification: [PASS/SKIP/N/A]

### Session Summary
- Started: [timestamp]
- Duration: ~[X] minutes
- Status: Complete

### Next Steps
- Remaining features: [N]
- Next priority: [LINEAR-ID] - [Title]

---
*Session tracked by Feature Harness*"
}
```

### 12.3 Update session.json

```bash
cd "$(git rev-parse --show-toplevel)"
```

Update session.json:
```json
{
  "sessionNumber": [N+1],
  "status": "ready",
  "completedAt": "[timestamp]",
  "lastCompletedFeature": "[LINEAR-ID]",
  "lastCommitHash": "[hash]"
}
```

### 12.4 Kill Dev Server (MANDATORY CLEANUP)

**CRITICAL: Always clean up dev servers at session end to prevent port accumulation!**

```bash
echo "🧹 Cleaning up dev servers at session end..."

# Kill by stored PID first (most reliable)
if [ -f .harness/.dev_server_pid ]; then
  kill $(cat .harness/.dev_server_pid) 2>/dev/null || true
  rm .harness/.dev_server_pid
fi

# Kill any processes on dev ports 3000-3003 as backup
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:3002 | xargs kill -9 2>/dev/null || true
lsof -ti:3003 | xargs kill -9 2>/dev/null || true

# Also kill any node processes running nuxt as final backup
pkill -f "nuxt dev" 2>/dev/null || true

echo "✅ Dev server cleanup complete"
```

**Why this matters**: Without cleanup, each session starts a new dev server on an incrementing port (3000 → 3001 → 3002). This wastes resources and can cause confusion when testing.

### 12.5 Check for More Features

**Check for more features:**
- If pending features remain AND turn budget allows → loop back to Step 5
- Otherwise → end session with summary

### 12.6 Output to User

```
🎉 Session [N] Complete!

✅ Implemented: [X] feature(s)
✅ All tests passed
✅ Git commits created
✅ META ticket updated
✅ Dev server stopped

📊 Progress: [X] of [Y] features complete

🔄 Next: Run /feature-harness again to continue
```

---

# ERROR HANDLING

## If Linear MCP unavailable:
- Skip Linear steps gracefully
- Log to progress.txt
- Continue with local artifact tracking

## If Playwright MCP fails:
- Create checkpoint
- Log issue with specific Playwright error
- Tell user manual browser testing may be needed
- Continue with automated tests (Step 9) if possible

## If feature-implementer gets stuck:
- Create checkpoint
- Preserve partial work
- Clear guidance for resume

## If init.sh missing:
- Fall back to `pnpm dev` or detected package manager
- Log warning

---

# ARGUMENTS

**--specs-dir <path>**
- Override default specs directory
- Default: `specs/features/`
- Example: `/feature-harness --specs-dir custom/specs/`

Parse and pass to workflow steps.

---

# RELATED COMMANDS

- `/write-spec` - Create feature specifications
- `/feature-status` - Check progress
- `/feature-stop` - Graceful stop with checkpoint

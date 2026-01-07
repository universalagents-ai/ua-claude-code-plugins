---
description: "Main Feature Harness command - detects session state and launches appropriate agent (Initializer for Session 1, Coder for Session 2+)"
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
└── Agent coordination:
    ├── codebase-scanner → Autonomous codebase analysis
    ├── browser-tester → Playwright verification (POC)
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

elif session.status == "ready" OR "completed":
  → CODING WORKFLOW (Session 2+)

else:
  → Report error (unknown status)
```

---

# INITIALIZATION WORKFLOW (Session 1)

Execute when `.harness/session.json` does NOT exist.

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

**For each feature, create issue:**

```
mcp__linear-server__create_issue with {
  team: "[team]",
  project: "[project]",
  title: "[Feature Title]",
  description: "[Full description with acceptance criteria]",
  priority: [1-4]
}
```

**Create granular tickets** - each should fit in a single context window:
- Break complex features into sub-issues if needed
- Aim for 1-2 hours of coding work per ticket
- Clear acceptance criteria that can be tested

**Set dependencies:**
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

Execute when `.harness/session.json` exists and status is "ready" or "completed".

## Code Step 1: Environment Check

**Command does directly:**
1. Create todo list
2. Verify directory
3. Read session.json, features.json, progress.txt
4. Read codebase-inventory.json for context

## Code Step 2: Review Linear Status

**Command queries Linear:**
```
mcp__linear-server__list_issues with {
  project: "[from .linear_project.json]"
}
```

Read META issue for session history.

## Code Step 3: Start Dev Server

**Use init.sh:**
```bash
chmod +x .harness/init.sh
.harness/init.sh dev &
```

Verify server running on port 3000.

## Code Step 4: Regression Testing (via browser-tester agent)

**For 1-2 completed features, launch browser-tester:**

```
Task: {
  subagent_type: "feature-harness:browser-tester",
  description: "Regression test completed features",
  prompt: "Verify these completed features still work:

  1. [Feature 1]: URL [url], check [criteria]
  2. [Feature 2]: URL [url], check [criteria]

  Navigate to each, take snapshots, verify functionality, check console/network for errors.
  Return: PASS (all working) or FAIL (with details of what's broken)"
}
```

**NOTE**: This is a proof-of-concept. If browser-tester can't access Playwright MCP, this step may need adjustment.

**If FAIL:** Stop coding workflow, fix regression first.
**If PASS:** Continue to Step 5.

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

**PARALLEL IMPLEMENTATION**: Launch up to 3 feature-implementer agents simultaneously for non-conflicting features.

**Check for parallelizable features:**
1. No shared file dependencies
2. No blocking relationships
3. Different areas of codebase

```
Task: {
  subagent_type: "feature-harness:feature-implementer",
  description: "Implement [Feature 1]",
  prompt: "Implement this feature:

  Title: [title]
  Description: [description]
  Acceptance Criteria:
  - [criterion 1]
  - [criterion 2]

  Related components: [from codebase-inventory]
  Implementation strategy: [promote_prototype | build_new]
  Patterns to follow: [from CLAUDE.md]

  Files to create/modify: [list]

  Return: SUCCESS with files changed, or BLOCKED with reason"
}
```

**For parallel execution (if 3 non-conflicting features available):**

```
// Launch all 3 in single message
Task: feature-implementer for Feature A
Task: feature-implementer for Feature B
Task: feature-implementer for Feature C
```

Wait for all to complete.

## Code Step 8: Browser Verification (via browser-tester agent)

```
Task: {
  subagent_type: "feature-harness:browser-tester",
  description: "Verify new feature implementation",
  prompt: "Verify this newly implemented feature:

  Feature: [title]
  URL: [url to test]

  Test cases:
  - [test 1]
  - [test 2]

  Take screenshots, check console, verify interactions work.
  Return: PASS or FAIL with details"
}
```

## Code Step 9: Run Automated Tests

**Command runs tests:**
```bash
pnpm test:all
```

**If tests FAIL:**
- Create checkpoint in `.harness/checkpoints/[timestamp].json`
- Update session.json to status: "checkpoint"
- Add Linear comment
- Tell user about checkpoint
- **STOP workflow**

**If tests PASS:** Continue.

## Code Step 10: Commit Changes

**Only execute if tests passed in Step 9**

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

Add session summary to META issue:
```
mcp__linear-server__create_comment with {
  issueId: "[meta-id]",
  body: "## Session [N] Summary..."
}
```

Update session.json:
```json
{
  "sessionNumber": [N+1],
  "status": "ready",
  "completedAt": "[timestamp]"
}
```

**Check for more features:**
- If pending features remain AND turn budget allows → loop back to Step 5
- Otherwise → end session with summary

**Output to user:**
```
🎉 Session [N] Complete!

✅ Implemented: [X] feature(s)
✅ All tests passed
✅ Git commits created

📊 Progress: [X] of [Y] features complete

🔄 Next: Run /feature-harness again to continue
```

---

# ERROR HANDLING

## If Linear MCP unavailable:
- Skip Linear steps gracefully
- Log to progress.txt
- Continue with local artifact tracking

## If browser-tester fails (POC limitation):
- Create checkpoint
- Log issue
- Tell user manual testing may be needed

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

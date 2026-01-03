---
description: "This skill should be used when the user asks about the Feature Harness system, how to use it, how it works, what commands are available, or needs guidance on autonomous feature development workflow. Examples: 'How do I use the feature harness?', 'What does the harness do?', 'Guide me through feature development', 'What are the harness commands?'"
---

# Feature Harness Guide

Comprehensive guide to using the Feature Harness system for autonomous feature development with multi-session context management, Linear integration, and automated testing.

## Overview

**Feature Harness** is an autonomous feature development system that:
- Helps you design feature specifications
- Implements features autonomously following specs
- Maintains context across multiple sessions
- Integrates with Linear for project tracking
- Runs automated tests (Playwright + unit tests)
- Manages git commits and workflow
- Handles failures gracefully with checkpoints

## Quick Start

### 1. Design Your Features

Use the spec-writer agent to create feature specifications:

```
/write-spec
```

**What happens:**
- Agent asks what feature you want to build
- Discovers your codebase patterns
- Asks clarifying questions
- Designs architecture with you
- Writes comprehensive spec to `specs/features/[name].md`

**Output:** Feature specifications ready for implementation

### 2. Initialize the Harness (Session 1)

Run the main command to initialize:

```
/feature-harness
```

**What happens:**
- Initializer agent launches
- Discovers codebase components and patterns
- Generates init.sh environment bootstrap script
- Reads all feature specs from `specs/features/`
- Creates Linear project and issues (with your approval)
- Generates `.harness/` artifacts
- Commits initialization to git

**Output:** System ready for autonomous implementation

### 3. Implement Features (Session 2+)

Run the command again to implement features:

```
/feature-harness
```

**What happens each session:**
- Coder agent launches
- Validates 1-2 previously completed features (regression testing)
- Selects highest priority pending feature
- Implements feature following spec
- Runs Playwright browser tests
- Runs automated test suite
- Commits if all tests pass
- Updates Linear issue status
- Returns control to you

**Output:** 1-2 features implemented and tested per session

### 4. Repeat Until Complete

Keep running `/feature-harness` until all features are done:

```
/feature-harness  # Feature 1 ✓
/feature-harness  # Feature 2 ✓
/feature-harness  # Feature 3 ✓
...
/feature-harness  # All done! 🎉
```

## System Architecture

### Agents

**Four specialized agents:**

1. **Spec-Writer Agent**
   - Triggered by: `/write-spec`
   - Purpose: Design feature specifications
   - Output: `specs/features/[name].md`

2. **Initializer Agent**
   - Triggered by: `/feature-harness` (Session 1)
   - Purpose: Discover codebase, create Linear issues, generate artifacts
   - Output: `.harness/` directory with all artifacts

3. **Coder Agent**
   - Triggered by: `/feature-harness` (Session 2+)
   - Purpose: Implement features autonomously
   - Output: Implemented features, git commits, updated Linear

4. **Resume Agent**
   - Triggered by: `/feature-harness` (when checkpoint exists)
   - Purpose: Recover from failures
   - Output: Resolved checkpoint, updated artifacts

### Artifacts

**All state is stored in `.harness/` directory:**

| File | Purpose |
|------|---------|
| `session.json` | Current session number and status |
| `features.json` | All features with status and Linear IDs |
| `codebase-inventory.json` | Discovered components and patterns |
| `progress.txt` | Human-readable audit log |
| `init.sh` | Environment bootstrap script |
| `.linear_project.json` | Cached Linear project (30-day TTL) |
| `checkpoints/` | Checkpoint files for failure recovery |

**These artifacts preserve full context across sessions** - you can close the context window after each session and resume later.

### Commands

| Command | Purpose |
|---------|---------|
| `/write-spec` | Create feature specifications |
| `/feature-harness` | Main command (detects state, launches agent) |
| `/feature-status` | Show current progress |
| `/feature-stop` | Gracefully stop and checkpoint |

## Complete Workflow

### Phase 1: Specification (One-Time)

**Create feature specs for everything you want to build:**

```
/write-spec
```

**Repeat for each major feature:**
- User authentication
- User profile
- Social feed
- Notifications
- Payment integration
- etc.

**Output:** `specs/features/` directory with all feature specs

**Reference:** See `references/spec-writing-guide.md` for spec templates

### Phase 2: Initialization (Session 1)

**Initialize the harness:**

```
/feature-harness
```

**Initializer workflow:**
1. ✅ Discovers codebase (components, pages, API routes, etc.)
2. ✅ Generates init.sh (package manager detection, dev server management)
3. ✅ Reads all feature specs
4. ✅ Asks you to select/create Linear project
5. ✅ Creates Linear issues for each feature (with dependencies)
6. ✅ Creates META tracking issue
7. ✅ Generates all `.harness/` artifacts
8. ✅ Commits initialization

**Duration:** ~10-15 minutes
**Output:** Ready for implementation

### Phase 3: Implementation (Sessions 2+)

**Implement features one at a time:**

```
/feature-harness
```

**Coder workflow (per session):**
1. ✅ Reads artifacts to restore context
2. ✅ Starts dev server with init.sh
3. ✅ **Regression test:** Validates 1-2 completed features first
4. ✅ Selects next highest-priority pending feature
5. ✅ Updates Linear issue to "In Progress"
6. ✅ Implements feature following spec
7. ✅ Tests with Playwright browser automation
8. ✅ Runs automated test suite (`pnpm test:all`)
9. ✅ Commits if tests pass (using commit-commands plugin)
10. ✅ Updates Linear issue to "Done"
11. ✅ Updates META issue with session summary
12. ✅ Tells you session is complete

**Duration:** ~20-35 minutes per feature
**Output:** 1-2 features implemented, tested, committed

**Repeat until all features are done.**

### Phase 4: Recovery (As Needed)

**If a session fails (tests fail, browser stuck, etc.):**

```
/feature-harness
```

**Resume workflow:**
1. ✅ Reads checkpoint details
2. ✅ Explains what went wrong
3. ✅ Asks you how to proceed:
   - **Retry:** Fix applied, try again
   - **Skip:** Move to next feature
   - **Abort:** Stop for manual investigation
4. ✅ Updates artifacts based on your choice
5. ✅ Clears checkpoint

**Then continue with `/feature-harness` as normal**

**Reference:** See `references/checkpoint-recovery.md` for recovery patterns

## Key Features

### 1. Regression Testing

**CRITICAL:** Before implementing any new feature, the Coder Agent validates 1-2 previously completed features.

**What it checks:**
- ✅ UI renders correctly
- ✅ Interactive elements work
- ✅ No console errors
- ✅ No visual glitches
- ✅ Data persists correctly

**If regression found:**
- Stops implementing new features
- Updates Linear issue back to "In Progress"
- Fixes the regression immediately
- Re-tests and commits fix

**Why this matters:**
- Prevents cascading bugs
- Maintains quality throughout development
- Catches breaking changes early

### 2. Init.sh Environment Bootstrap

**Automatically generated script for environment management:**

```bash
./.harness/init.sh dev        # Start dev server
./.harness/init.sh test       # Run tests
./.harness/init.sh build      # Build project
./.harness/init.sh install    # Install dependencies
```

**Features:**
- Detects package manager (pnpm/npm/yarn)
- Analyzes project-specific scripts
- Handles port conflicts (kills process on port 3000)
- Checks Node.js version
- Adaptive to your project structure

**Coder Agent uses this** to bootstrap environment before implementation.

### 3. Comprehensive Testing

**Every feature is tested before commit:**

**Browser Testing (Playwright):**
- Navigate to feature
- Test user interactions (clicks, forms, etc.)
- Take screenshots for documentation
- Check console for errors
- Verify network requests
- Validate visual rendering

**Automated Testing:**
- Runs `pnpm test:all`
- All tests must pass
- Creates checkpoint if any fail (no auto-fix)

**Only commits if BOTH pass.**

### 4. Linear Integration

**Full project management integration:**

**Setup:**
- Asks you to select/create Linear project
- Caches selection (30-day TTL)
- Creates one issue per feature
- Sets up dependencies between features
- Creates META issue for session tracking

**During Implementation:**
- Updates issue status: Todo → In Progress → Done
- Adds implementation comments
- Updates META issue with session summaries
- References Linear IDs in git commits

**On Checkpoint:**
- Adds checkpoint comment
- Moves to Backlog if skipped

### 5. Checkpoint Recovery System

**Graceful failure handling with human-in-the-loop:**

**Checkpoint Reasons:**
- `test_failure`: Automated tests failed
- `playwright_browser_stuck`: Browser unresponsive
- `unclear_spec`: Specification ambiguous
- `dependency_missing`: Required feature not done
- `manual_stop`: User paused intentionally

**Recovery Options:**
- **Retry:** Fix applied, attempt again
- **Skip:** Mark "needs-manual", move to next
- **Abort:** Stop for investigation

**Never auto-fixes failures** - always asks you how to proceed.

## Best Practices

### Writing Good Specs

**Use `/write-spec` for all features:**
- Let the agent ask clarifying questions
- Provide clear acceptance criteria
- Define success metrics
- Include edge cases
- Specify dependencies

**Reference:** `references/spec-writing-guide.md`

### Session Management

**One feature per session:**
- Don't try to implement everything at once
- Let each session complete fully
- Review Linear between sessions
- Check `/feature-status` frequently

**Close context window after each session:**
- Artifacts preserve all context
- Fresh start for next session
- No context window overflow

### Handling Checkpoints

**When tests fail:**
- Don't try to fix yourself initially
- Let Coder create checkpoint
- Review test output carefully
- Fix the issue
- Run `/feature-harness` to retry

**Common fixes:**
- Update failing tests (if spec changed)
- Fix implementation bug
- Close browser processes
- Update unclear specs

### Linear Workflow

**Let the harness manage Linear:**
- Don't manually update issue status
- Review META issue for progress
- Use Linear for prioritization
- Check issue comments for implementation details

**You can still:**
- Add comments manually
- Change priority
- Add labels
- Link related issues

## Troubleshooting

### "Session stuck at checkpoint"

**Problem:** Checkpoint exists but you want to start fresh

**Solution:**
```bash
# Archive current checkpoint
mv .harness/checkpoints/*.json .harness/checkpoints/archived/

# Update session status
# Edit .harness/session.json: change "status" to "ready"

# Resume
/feature-harness
```

### "Coder keeps implementing wrong feature"

**Problem:** Features have unclear priority

**Solution:**
1. Check Linear issue priority
2. Update priorities in Linear
3. Run `/feature-harness` again
4. Coder selects highest priority

### "Tests keep failing"

**Problem:** Test expectations don't match implementation

**Solution:**
1. Review failing test output
2. Check if spec requirements changed
3. Either:
   - Fix implementation to match tests
   - Update tests to match new requirements
4. Run `/feature-harness` to retry

**Reference:** See `troubleshooting` skill for more issues

### "Linear integration not working"

**Problem:** Linear MCP not configured

**Solution:**
1. Check `.mcp.json` has linear-server config
2. Verify Linear MCP is available (HTTP, no auth needed)
3. Test: Try `mcp__linear-server__list_projects`
4. Re-initialize if needed

### "Dev server conflicts"

**Problem:** Port 3000 already in use

**Solution:**
- Init.sh handles this automatically
- Kills existing process and restarts
- If still stuck, manually: `kill -9 $(lsof -ti:3000)`

## Advanced Usage

### Custom Specs Directory

**Use custom location for specs:**

```
/feature-harness --specs-dir custom/path/to/specs
```

### Manual Checkpoints

**Create checkpoint intentionally:**

```
/feature-stop --reason "End of day, continuing tomorrow"
```

**Resume later:**

```
/feature-harness
```

### Detailed Status

**See full session history:**

```
/feature-status --detailed
```

### Skip Features

**When checkpoint occurs:**
1. Run `/feature-harness`
2. Resume Agent explains issue
3. Choose "Skip" option
4. Feature marked "needs-manual"
5. Coder implements next feature instead

## Integration with Other Plugins

**Feature Harness works with:**

**feature-dev plugin:**
- Spec-writer uses Explorer and Architect agents
- Coder can invoke for complex tasks

**frontend-design plugin:**
- Coder references for UI implementation
- Ensures polished, non-generic aesthetics

**commit-commands plugin:**
- Coder uses for all git commits
- Consistent format, Linear linking, attribution

**code-review plugin:**
- Optional post-implementation review
- Quality checks before PR

## Files and Directories

### Input Files

**You create:**
- `specs/features/*.md` - Feature specifications (via `/write-spec`)

### Output Files

**Harness creates:**
```
.harness/
├── session.json              # Session state
├── features.json             # Feature tracking
├── codebase-inventory.json   # Discovered patterns
├── progress.txt              # Audit log
├── init.sh                   # Environment bootstrap
├── .linear_project.json      # Linear project cache
└── checkpoints/              # Checkpoint files
    ├── [timestamp].json
    ├── resolved/
    ├── skipped/
    └── archived/
```

**In codebase:**
- Implemented features (components, pages, API routes, etc.)
- Git commits (one per feature)
- Test files (updated as needed)

## Tips and Tricks

**Maximize efficiency:**
- Write all specs first, implement all at once
- Let harness run during breaks (each session ~20-30 min)
- Review Linear META issue for progress tracking
- Use `/feature-status` to check progress anytime

**Maintain quality:**
- Trust regression testing to catch breaking changes
- Don't skip failed tests - always fix and retry
- Review Playwright screenshots in Linear comments
- Use checkpoints for manual intervention when needed

**Optimize workflow:**
- Write clear, detailed specs upfront
- Keep features small and focused
- Define dependencies explicitly
- Prioritize in Linear before starting

**Collaborate:**
- Share Linear META issue with team
- Review session summaries
- Use git commits for code review
- Manual PR creation when all done

## Summary

**Feature Harness enables autonomous feature development:**

1. **Design** features with `/write-spec`
2. **Initialize** with `/feature-harness` (Session 1)
3. **Implement** by running `/feature-harness` repeatedly
4. **Recover** from failures with checkpoints
5. **Track** progress in Linear and `/feature-status`

**Key benefits:**
- ✅ Multi-session context preservation
- ✅ Autonomous implementation with oversight
- ✅ Regression testing prevents breaking changes
- ✅ Comprehensive automated testing
- ✅ Linear integration for project management
- ✅ Graceful failure handling
- ✅ Professional git workflow

**Start building features autonomously today!**

---

## Additional Resources

**Reference guides:**
- `references/spec-writing-guide.md` - Feature spec templates
- `references/checkpoint-recovery.md` - Recovery patterns
- `references/linear-integration.md` - Linear workflow details
- `references/testing-strategy.md` - Testing approach

**Example workflows:**
- `examples/full-workflow.md` - Complete example from spec to commit
- `examples/checkpoint-recovery-example.md` - Recovery scenario

**Troubleshooting:**
- Use `troubleshooting` skill for common issues
- Check `.harness/progress.txt` for audit log
- Review Linear META issue for session history

**Questions?**
Ask about any aspect of the Feature Harness system - I'm here to help!

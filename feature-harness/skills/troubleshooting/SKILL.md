---
description: "This skill should be used when the user encounters problems with the Feature Harness system, gets errors, sees unexpected behavior, or asks for help debugging issues. Examples: 'Why isn't the harness working?', 'Tests keep failing', 'Checkpoint won't resolve', 'Linear integration broken', 'Help debug this issue'"
---

# Feature Harness Troubleshooting Guide

Comprehensive troubleshooting guide for common Feature Harness issues, errors, and unexpected behaviors.

## Quick Diagnostics

### Run Health Check

**Check all critical files and state:**

```bash
# Verify .harness/ exists
ls -la .harness/

# Check session state
cat .harness/session.json

# Check features
cat .harness/features.json

# Check for checkpoints
ls -la .harness/checkpoints/

# Verify init.sh exists and is executable
ls -la .harness/init.sh
```

**Expected output:**
- ✅ `.harness/` directory exists
- ✅ `session.json` is valid JSON
- ✅ `features.json` has feature list
- ✅ `init.sh` exists and is executable (755)

**If any missing:**
- System may not be initialized
- Run `/feature-harness` to initialize (Session 1)

## Common Issues

### 1. "Feature Harness not initialized"

**Symptoms:**
- Command shows "not initialized" error
- `.harness/` directory doesn't exist
- No session.json file

**Cause:**
Never ran initialization (Session 1)

**Solution:**
```
/feature-harness
```

This launches Initializer Agent to set up the system.

**Verify fixed:**
```bash
ls .harness/
# Should show: session.json, features.json, etc.
```

---

### 2. Tests Keep Failing

**Symptoms:**
- Coder Agent creates checkpoint for `test_failure`
- Same tests fail repeatedly after retry
- Error message unclear or confusing

**Possible causes and solutions:**

#### 2a. Test expectations don't match implementation

**Diagnose:**
```bash
# See what tests failed
pnpm test:all

# Read test file
# Look for test assertions
```

**Solution:**
- If implementation is correct: Update test expectations
- If implementation is wrong: Fix the code
- If spec changed: Update both tests and code

**Then retry:**
```
/feature-harness
# Choose "Retry" when Resume Agent asks
```

#### 2b. Test environment issue

**Diagnose:**
```bash
# Check if dev server running
lsof -i :3000

# Check node version
node --version

# Check dependencies
pnpm install
```

**Solution:**
```bash
# Kill conflicting processes
kill -9 $(lsof -ti:3000)

# Reinstall dependencies
pnpm install

# Restart dev server
./.harness/init.sh dev
```

#### 2c. Flaky tests (timing issues)

**Diagnose:**
- Tests pass sometimes, fail other times
- Errors mention timeouts or "element not found"
- Playwright tests especially

**Solution:**
1. Add wait conditions to tests
2. Increase timeouts
3. Use Playwright's auto-waiting features
4. Ensure data is loaded before assertions

**Example fix:**
```typescript
// Before (flaky)
await page.click('.submit-button')

// After (stable)
await page.waitForSelector('.submit-button', { state: 'visible' })
await page.click('.submit-button')
```

---

### 3. Playwright Browser Stuck

**Symptoms:**
- Checkpoint reason: `playwright_browser_stuck`
- Browser window frozen or unresponsive
- Tests hang indefinitely

**Causes:**
- Browser process still running from previous session
- Port conflict
- Dev server crashed during testing

**Solution:**

**Step 1: Close all browser processes**
```bash
# Find Playwright processes
ps aux | grep playwright
ps aux | grep chromium

# Kill them
pkill -9 chromium
pkill -9 playwright
```

**Step 2: Clear port 3000**
```bash
# Kill process on port 3000
kill -9 $(lsof -ti:3000)
```

**Step 3: Restart dev server**
```bash
./.harness/init.sh dev
```

**Step 4: Retry**
```
/feature-harness
# Choose "Retry"
```

**Prevent future occurrences:**
- Init.sh should handle this automatically
- If keeps happening, check init.sh logic
- May need to add browser cleanup to init.sh

---

### 4. Linear Integration Not Working

**Symptoms:**
- Linear MCP tools fail
- Issues not created
- Issues not updated
- "Linear not configured" messages

**Possible causes and solutions:**

#### 4a. Linear MCP not configured

**Diagnose:**
```
Read: .mcp.json
```

**Check for:**
```json
{
  "mcpServers": {
    "linear-server": {
      "type": "http",
      "url": "https://mcp.linear.app/mcp"
    }
  }
}
```

**Solution:**
If missing, add Linear MCP configuration to `.mcp.json`

#### 4b. Linear MCP connection failed

**Diagnose:**
```bash
# Test Linear MCP directly
# (Claude will try to call Linear MCP tool)
```

**Try:**
```
mcp__linear-server__list_projects
```

**If fails:**
- Linear MCP server may be down
- Network issue
- Check Linear status page

**Temporary workaround:**
- Harness can work without Linear
- Updates just won't sync
- Manually update Linear issues

#### 4c. Linear project not selected

**Diagnose:**
```
Read: .harness/.linear_project.json
```

**If file missing or corrupted:**

**Solution:**
```bash
# Delete cached project
rm .harness/.linear_project.json

# Reinitialize (will prompt for project)
# Or manually create file:
{
  "teamId": "your-team-id",
  "projectId": "your-project-id",
  "projectName": "Feature Harness",
  "createdAt": "2026-01-02T12:00:00Z",
  "cachedAt": "2026-01-02T12:00:00Z",
  "ttl": 2592000
}
```

---

### 5. Checkpoint Won't Resolve

**Symptoms:**
- Resume Agent runs but checkpoint persists
- Can't get back to "ready" status
- Stuck in checkpoint loop

**Causes:**
- Checkpoint file not archived after resolution
- Session.json not updated correctly
- Multiple checkpoints exist

**Solution:**

**Step 1: Check for multiple checkpoints**
```bash
ls -la .harness/checkpoints/
```

**If multiple files:**
```bash
# Archive all but most recent
mv .harness/checkpoints/*.json .harness/checkpoints/archived/
# (Keep the one you want to resolve)
```

**Step 2: Manually update session.json**
```
Read: .harness/session.json
```

Change status from "checkpoint" to "ready":
```json
{
  "sessionNumber": 2,
  "status": "ready",
  "lastUpdated": "2026-01-02T15:00:00Z",
  "checkpointReason": null
}
```

**Step 3: Archive checkpoint**
```bash
mkdir -p .harness/checkpoints/resolved
mv .harness/checkpoints/*.json .harness/checkpoints/resolved/
```

**Step 4: Continue**
```
/feature-harness
```

---

### 6. Coder Implementing Wrong Feature

**Symptoms:**
- Coder selects feature you don't want next
- Skips important features
- Implements in wrong order

**Cause:**
Priority not set correctly in Linear

**Solution:**

**Step 1: Check current feature selection**
```
Read: .harness/features.json
```

**Step 2: Update priorities in Linear**
- Open Linear project
- Set priority on issues:
  - Urgent (priority: 1) - implement first
  - High (priority: 2)
  - Normal (priority: 3)
  - Low (priority: 4)

**Step 3: Manually update features.json (if needed)**
```
Read: .harness/features.json
```

Reorder features by priority or add `priority` field:
```json
{
  "id": "feat-001",
  "name": "User Authentication",
  "priority": 1,
  "status": "pending"
}
```

**Step 4: Run harness**
```
/feature-harness
```

Coder will select highest priority pending feature.

---

### 7. Dev Server Won't Start

**Symptoms:**
- Init.sh fails to start dev server
- Port 3000 conflict not resolved
- "Address already in use" error

**Solution:**

**Step 1: Check what's using port 3000**
```bash
lsof -i :3000
```

**Step 2: Kill the process**
```bash
kill -9 $(lsof -ti:3000)
```

**Step 3: Try init.sh again**
```bash
./.harness/init.sh dev
```

**If still fails:**

**Step 4: Check init.sh logic**
```
Read: .harness/init.sh
```

Should have port conflict handling:
```bash
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
  lsof -ti:3000 | xargs kill -9 2>/dev/null || true
fi
```

**If missing, regenerate init.sh:**
- Delete `.harness/init.sh`
- Run `/feature-harness` (will recreate during initialization)

---

### 8. Session State Corrupted

**Symptoms:**
- `session.json` is invalid JSON
- Parse errors when reading session state
- Harness shows "corrupted" errors

**Solution:**

**Step 1: Backup current state**
```bash
cp .harness/session.json .harness/session.json.backup
```

**Step 2: Try to fix JSON**
```
Read: .harness/session.json
```

Look for:
- Missing commas
- Extra commas
- Unmatched braces
- Invalid characters

**Step 3: If unfixable, reset to known good state**
```json
{
  "sessionNumber": 1,
  "status": "ready",
  "lastUpdated": "2026-01-02T12:00:00Z",
  "lastFeatureId": null
}
```

**Adjust sessionNumber based on progress:**
- Check git log to see how many features completed
- Check Linear issues
- Set appropriate session number

**Step 4: Continue**
```
/feature-harness
```

---

### 9. Regression Tests Failing

**Symptoms:**
- Coder Agent detects regression in Step 4
- Previously completed feature now broken
- Coder stops before implementing new feature

**Cause:**
Recent change broke existing functionality

**Solution:**

**Step 1: Understand what broke**
- Coder explains which feature regressed
- Reviews Playwright test output
- Identifies specific functionality that failed

**Step 2: Review recent changes**
```bash
git log --oneline -5
git diff HEAD~1
```

**Step 3: Fix the regression**
- Update the broken feature code
- Or update the test if requirements changed
- Manually test the feature

**Step 4: Commit fix**
```bash
git add .
git commit -m "fix: Resolve regression in [feature-name]"
```

**Step 5: Continue**
```
/feature-harness
```

Coder will re-validate, confirm fix, then continue.

**Why this happens:**
- New feature inadvertently breaks old feature
- Shared component modified
- Global state or routing changed

**Regression testing catches this early!**

---

### 10. Codebase Inventory Stale

**Symptoms:**
- Coder can't find recently added components
- References outdated patterns
- Misses new API routes or pages

**Cause:**
Codebase changed significantly since initialization

**Solution:**

**Step 1: Check inventory freshness**
```
Read: .harness/codebase-inventory.json
```

Look at `discoveredAt` timestamp.

**Step 2: Force re-scan**
```bash
# Delete inventory
rm .harness/codebase-inventory.json

# Next agent run will regenerate
```

**Step 3: Continue**
```
/feature-harness
```

**Or manually trigger Initializer:**
```bash
# Backup current session
mv .harness/session.json .harness/session.json.backup

# Run initializer (will regenerate inventory)
/feature-harness

# Restore session
mv .harness/session.json.backup .harness/session.json
```

---

### 11. Features.json Out of Sync with Linear

**Symptoms:**
- Linear shows feature complete
- features.json shows "pending"
- Or vice versa

**Cause:**
Manual Linear updates outside harness

**Solution:**

**Step 1: Decide source of truth**
- If Linear is correct: Update features.json
- If features.json is correct: Update Linear

**Step 2: Sync features.json to Linear**
```
Read: .harness/features.json
```

For each feature, check:
```
mcp__linear-server__get_issue with id: [feature.linearIssueId]
```

Update `status` field in features.json to match Linear.

**Step 3: Or sync Linear to features.json**
```
For each feature in features.json:
mcp__linear-server__update_issue with:
  id: [feature.linearIssueId]
  state: [map status to Linear state]
```

**Status mapping:**
- `pending` → "Todo"
- `in_progress` → "In Progress"
- `completed` → "Done"
- `needs-manual` → "Backlog"

---

## Advanced Troubleshooting

### Reset Harness Completely

**Use only as last resort:**

```bash
# Backup current state
mv .harness .harness.backup

# Reinitialize
/feature-harness
```

**Warning:** Loses all session history and progress tracking.

### Recover from Git Issues

**If init.sh or Coder made bad commits:**

```bash
# View recent commits
git log --oneline -10

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Or revert specific commit
git revert [commit-hash]
```

### Debug Agent Execution

**To understand what agents are doing:**

1. **Check progress.txt:**
   ```
   Read: .harness/progress.txt
   ```
   Shows full audit log of all agent actions

2. **Check Linear comments:**
   - Open Linear META issue
   - Review session summaries
   - Check individual feature issue comments

3. **Review git commits:**
   ```bash
   git log --oneline --all
   ```
   Shows implementation history

### MCP Configuration Issues

**If MCP tools not working:**

**Check `.mcp.json` is valid:**
```
Read: .mcp.json
```

**Should have:**
- linear-server (HTTP)
- playwright (stdio)
- github (stdio, optional)

**Test each MCP:**
```
# Linear
mcp__linear-server__list_projects

# Playwright
mcp__playwright__browser_navigate with url: "https://example.com"

# GitHub
mcp__github__search_code with query: "test"
```

**If any fail:**
- Check plugin is loaded
- Verify MCP server URLs
- Check network connectivity
- Restart Claude Code

## Error Messages Reference

### "Cannot read .harness/session.json"

**Meaning:** Session file missing or unreadable

**Fix:** Initialize harness or restore from backup

### "Checkpoint file not found"

**Meaning:** Resume Agent can't find checkpoint file

**Fix:** Check `.harness/checkpoints/` directory, may need to manually update session.json to "ready"

### "Linear project not configured"

**Meaning:** No `.linear_project.json` file

**Fix:** Delete file if corrupted, reinitialize to re-prompt for project selection

### "Dev server failed to start"

**Meaning:** Init.sh couldn't start dev server

**Fix:** Check port conflicts, verify init.sh logic, check package.json scripts

### "Playwright browser timeout"

**Meaning:** Browser didn't respond within timeout

**Fix:** Close browser processes, restart dev server, increase timeouts in tests

### "Test suite failed"

**Meaning:** `pnpm test:all` returned non-zero exit code

**Fix:** Run tests manually to see errors, fix failing tests or code

### "Feature spec not found"

**Meaning:** Expected spec file doesn't exist

**Fix:** Check `specs/features/` directory, create spec with `/write-spec`

## Prevention Best Practices

**Avoid issues by:**

1. **Write clear specs first**
   - Use `/write-spec` for all features
   - Include acceptance criteria
   - Define dependencies

2. **Review status regularly**
   - Run `/feature-status` frequently
   - Check Linear META issue
   - Review git commits

3. **Fix checkpoints promptly**
   - Don't let checkpoints accumulate
   - Address test failures immediately
   - Keep context fresh

4. **Keep artifacts clean**
   - Don't manually edit `.harness/` files unless necessary
   - Use commands (`/feature-stop`, `/feature-status`)
   - Let agents manage state

5. **Sync with Linear**
   - Let harness update Linear automatically
   - Don't manually change issue status
   - Use Linear for prioritization only

6. **Trust regression testing**
   - Let Coder validate completed features
   - Fix regressions immediately
   - Don't skip regression checks

## Getting Help

**If issue not covered here:**

1. **Check artifacts:**
   - Read `.harness/progress.txt` for history
   - Check `.harness/session.json` for state
   - Review checkpoint files for errors

2. **Check Linear:**
   - Review META issue comments
   - Check feature issue comments
   - Look for error messages

3. **Check git:**
   - Review recent commits
   - Check for failed commits
   - Look at diff for recent changes

4. **Ask for help:**
   - Describe the issue clearly
   - Share relevant error messages
   - Include session state and checkpoint info
   - I can help debug!

## Quick Reference

| Issue | Quick Fix |
|-------|-----------|
| Not initialized | `/feature-harness` |
| Tests failing | Fix tests/code, `/feature-harness` → Retry |
| Browser stuck | `pkill chromium`, `/feature-harness` → Retry |
| Linear not working | Check `.mcp.json`, test MCP tools |
| Checkpoint stuck | Archive checkpoint, update session.json to "ready" |
| Wrong feature | Update Linear priorities |
| Dev server won't start | `kill -9 $(lsof -ti:3000)`, `./.harness/init.sh dev` |
| Session corrupted | Fix JSON or reset to known good state |
| Regression failing | Fix regression, commit, `/feature-harness` |
| Inventory stale | Delete `codebase-inventory.json`, reinitialize |
| Out of sync with Linear | Sync features.json ↔ Linear manually |

---

**Most issues are fixable without losing progress.** The harness preserves state in `.harness/` artifacts - you can always recover!

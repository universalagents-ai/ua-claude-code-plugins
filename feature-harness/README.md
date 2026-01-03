# Feature Harness - Autonomous Feature Implementation System

**Version**: 1.0.0
**Status**: ✅ Production Ready (Phases 1-7 Complete)
**Ticket**: [SPR-89](https://linear.app/sprocket-ux-limited/issue/SPR-89)

---

## Overview

Feature Harness is a Claude Code plugin that provides an autonomous system for designing, implementing, and tracking features across multiple development sessions. It combines AI-powered codebase discovery, feature specification generation, autonomous implementation, automated testing, and Linear project management into a cohesive workflow.

### What It Does

- **📝 Spec Writing**: Guides you through feature design (discovery, exploration, architecture)
- **🔍 Codebase Discovery**: Automatically discovers components, patterns, and architecture
- **🎯 Linear Integration**: Creates and tracks issues with project association
- **🤖 Autonomous Implementation**: Implements features following specs and conventions
- **🔄 Regression Testing**: Validates 1-2 completed features BEFORE implementing new ones
- **⚙️ Init.sh Environment**: Auto-generates environment bootstrap script with port conflict handling
- **🧪 Automated Testing**: Playwright browser automation with comprehensive dev server management
- **✅ Git Automation**: Uses commit-commands plugin for consistent commits with Linear references
- **💾 Multi-Session Context**: Preserves state across sessions via artifact files
- **🔧 Checkpoint Recovery**: Graceful failure handling with human-in-the-loop decision making

### Architecture

**Pure Plugin Design**: Uses Claude Code's Task tool to spawn autonomous agents. Each agent reads/writes artifacts in `.harness/` directory for context preservation across sessions.

**Agents**:
- `spec-writer` - Feature specification generation (phases 1-4 from feature-dev)
- `initializer` - Session 1: Setup, planning, Linear issue creation
- `coder` - Session 2+: Feature implementation with testing
- `resume` - Checkpoint recovery and error handling

---

## Installation

### Prerequisites

1. **Claude Code** (latest version)
2. **Node.js** v22+ and pnpm v9+
3. **Playwright** (for browser automation):
   ```bash
   npx playwright install chromium
   ```

### Install Plugin

The plugin is located in the repository at `.claude-plugins/feature-harness/`.

Claude Code will auto-discover it when:
- You're in the repository root
- The plugin directory exists at `.claude-plugins/feature-harness/`

### Configure MCP Servers

The plugin uses these MCP servers (configured in `.mcp.json`):

#### Linear MCP (Required)
- **Type**: HTTP
- **URL**: `https://mcp.linear.app/mcp`
- **Auth**: OAuth via Claude Code (no API key needed)
- **Setup**: Ensure Linear MCP is authenticated in Claude Code settings

#### Playwright MCP (Required)
- **Type**: stdio
- **Command**: `npx @playwright/mcp@latest --headless --browser=chromium`
- **Setup**: Install Chromium: `npx playwright install chromium`

#### GitHub MCP (Optional)
- **Type**: stdio
- **Command**: `npx -y @modelcontextprotocol/server-github`
- **Setup**: Configure GitHub token in Claude Code MCP settings

### Configure Project Settings

1. Copy the settings template to your project root:
   ```bash
   cp .claude-plugins/feature-harness/settings-template.md .claude/feature-harness.local.md
   ```

2. Edit `.claude/feature-harness.local.md` if needed (defaults usually work)

3. Add to `.gitignore`:
   ```gitignore
   # Feature Harness artifacts
   .harness/
   .claude/*.local.md
   ```

### Enable Auto-Approval (Optional, Recommended)

For fully autonomous operation:

1. Open Claude Code Settings
2. Navigate to: **Tool Use** > **Auto-approve tools**
3. Add:
   - Read, Write, Edit, Bash, Glob, Grep
   - Linear MCP (all tools)
   - Playwright MCP (all tools)
   - GitHub MCP (all tools, if using)

⚠️ Only enable in trusted development environments.

---

## Quick Start

### Workflow Overview

```
1. Design Features    → /write-spec (creates specs in specs/features/)
2. Initialize Harness → /feature-harness (creates Linear issues, artifacts)
3. Implement Features → /feature-harness (autonomous implementation loop)
4. Check Progress     → /feature-status
5. Resume on Errors   → /feature-resume
```

### Example: Build Multiple Features

#### Step 1: Design Features (Spec Writing)

```bash
# Start spec-writing workflow for first feature
/write-spec

# Agent will:
# - Discover codebase patterns
# - Ask clarifying questions
# - Design architecture
# - Generate spec in specs/features/feature-name.md

# Repeat for additional features
/write-spec
```

After writing all specs, you'll have:
```
specs/features/
├── user-authentication.md
├── dashboard-widgets.md
└── data-export.md
```

#### Step 2: Initialize Harness

```bash
# Initialize Feature Harness (Session 1)
/feature-harness
```

The initializer agent will:
1. Discover codebase (if not already done by spec-writer)
2. Read all specs from `specs/features/`
3. Prompt you to select/create Linear project
4. Create Linear issues (one per feature)
5. Create META tracking issue
6. Generate artifacts in `.harness/`

After initialization:
```
.harness/
├── session.json              # Session 1
├── features.json             # 3 features (pending)
├── progress.txt              # Audit log
├── .linear_project.json      # Cached project
└── codebase-inventory.json   # Discovered patterns
```

#### Step 3: Implement Features

```bash
# Continue harness (Session 2)
/feature-harness
```

The coder agent will:
1. Read artifacts to resume context
2. Select highest priority pending feature
3. Implement following spec
4. Kill/restart dev server if needed
5. Run Playwright tests
6. Commit if tests pass (or checkpoint if fail)
7. Update Linear issue status
8. Return to user

Repeat `/feature-harness` for each feature:
```bash
# Feature 1 complete ✓
/feature-harness

# Feature 2 complete ✓
/feature-harness

# Feature 3 complete ✓
# All done!
```

#### Step 4: Handle Failures

If a feature implementation fails (tests fail, unclear spec, etc.):

```bash
# Check what happened
/feature-status

# Shows checkpoint details:
# - Reason: test_failure
# - Feature: dashboard-widgets
# - Session: 4

# Fix the issue manually, then:
/feature-resume

# Agent will ask:
# - Retry implementation?
# - Skip feature (mark blocked)?
# - Modify spec and retry?
```

---

## Commands

### `/write-spec`
**Purpose**: Generate feature specification
**Arguments**: `[--feature-name <name>]`

Launches spec-writer agent to guide you through:
1. Discovery - What feature to build?
2. Codebase exploration - Existing patterns
3. Clarifying questions - Requirements
4. Architecture design - Component structure

Outputs spec to `specs/features/[name].md`

### `/feature-harness`
**Purpose**: Main entry point (initialize or continue)
**Arguments**: `[--specs-dir <path>]`

Auto-detects session:
- **Session 1** (no artifacts): Launches initializer agent
- **Session 2+** (artifacts exist): Launches coder agent

### `/feature-status`
**Purpose**: Show progress and current state
**Arguments**: `[--detailed]`

Displays:
- Session number and status
- Features: total, completed, pending, in-progress
- Current feature details
- Checkpoint info (if exists)
- With `--detailed`: Full session history, artifact files, Linear links

### `/feature-resume`
**Purpose**: Resume from checkpoint (same as `/feature-harness` when checkpoint exists)
**Arguments**: None

Launches resume agent to:
- Read checkpoint details
- Analyze failure reason (test_failure, playwright_browser_stuck, etc.)
- Ask user for action (retry/skip/abort)
- Update artifacts based on choice
- Archive checkpoint file

### `/feature-stop`
**Purpose**: Gracefully stop and create manual checkpoint
**Arguments**: `[--reason <message>]` `[--force]`

Creates manual checkpoint:
- Asks for stop reason (end of session, need to investigate, etc.)
- Preserves current state in checkpoint file
- Updates session.json to "checkpoint" status
- Optionally updates Linear issue with pause comment
- Tells user how to resume later

---

## Artifacts (.harness/ Directory)

The `.harness/` directory contains all session state:

### Core Artifacts

| File | Purpose | Format |
|------|---------|--------|
| `session.json` | Current session state | JSON |
| `features.json` | Feature list with status | JSON |
| `progress.txt` | Human-readable audit log | Text |
| `init.sh` | Environment bootstrap script | Bash |

### Cached Data

| File | Purpose | TTL |
|------|---------|-----|
| `.linear_project.json` | Linear project metadata | 30 days |
| `codebase-inventory.json` | Component/pattern discovery | Validated each run |

### Recovery Data

| Directory/File | Purpose |
|----------------|---------|
| `checkpoints/` | Active checkpoint files |
| `checkpoints/resolved/` | Successfully retried checkpoints |
| `checkpoints/skipped/` | Skipped feature checkpoints |
| `checkpoints/archived/` | Manual checkpoint archives |

### Example session.json

```json
{
  "sessionNumber": 3,
  "status": "ready",
  "lastUpdated": "2026-01-02T15:30:00Z",
  "currentFeatureId": "feat-002"
}
```

### Example features.json

```json
{
  "features": [
    {
      "id": "feat-001",
      "title": "User Authentication",
      "status": "completed",
      "linearIssueId": "SPR-100",
      "specPath": "specs/features/user-authentication.md",
      "completedAt": "2026-01-02T14:00:00Z"
    },
    {
      "id": "feat-002",
      "title": "Dashboard Widgets",
      "status": "in_progress",
      "linearIssueId": "SPR-101",
      "specPath": "specs/features/dashboard-widgets.md",
      "startedAt": "2026-01-02T15:00:00Z"
    }
  ],
  "lastUpdated": "2026-01-02T15:30:00Z"
}
```

---

## Skills

Invoke skills for guidance (or trigger naturally):

### `harness-guide`
Complete workflow guide, system architecture, best practices

**Triggers**:
- "how to use feature harness"
- "feature harness workflow"
- "what is feature harness"
- "guide me through feature development"
- "explain the harness system"

**Provides**:
- Complete workflow (spec → init → implement → recover)
- System architecture overview
- Artifact explanations
- Best practices and tips
- Integration with official plugins
- Reference guides and examples

### `troubleshooting`
Comprehensive troubleshooting for common issues

**Triggers**:
- "feature harness error"
- "why isn't harness working"
- "tests keep failing"
- "checkpoint won't resolve"
- "linear integration broken"
- "help debug this issue"
- "playwright error"

**Provides**:
- Quick diagnostics checklist
- 11 common issues with solutions
- Error message reference
- Advanced troubleshooting
- Prevention best practices
- Quick reference table

---

## Integration with Official Plugins

Feature Harness enhances functionality when these plugins are installed:

| Plugin | Usage | Required? |
|--------|-------|-----------|
| **feature-dev** | Spec-writer uses discovery patterns | Recommended |
| **frontend-design** | Coder references for UI components | Optional |
| **commit-commands** | Git commit operations | Optional |
| **code-review** | Quality checks before completion | Optional |
| **pr-review-toolkit** | PR review after features done | Optional |

Enable in `.claude/settings.json`:
```json
{
  "enabledPlugins": {
    "feature-dev@claude-plugins-official": true,
    "frontend-design@claude-plugins-official": true,
    "commit-commands@claude-plugins-official": true
  }
}
```

---

## Troubleshooting

### "No feature specs found"

**Cause**: `specs/features/` directory empty or wrong path

**Fix**:
1. Run `/write-spec` to create specs
2. Or manually create specs following template (see `/spec-writing` skill)
3. Verify `specsDir` in `.claude/feature-harness.local.md`

### "Linear MCP tools not available"

**Cause**: Linear MCP not authenticated

**Fix**:
1. Check Linear MCP is enabled in Claude Code settings
2. Verify OAuth authentication is active
3. Test with: "List my Linear projects"

### "Playwright browser fails to launch"

**Cause**: Chromium not installed

**Fix**:
```bash
npx playwright install chromium
```

### "Dev server conflict detected"

**Cause**: localhost:3000 already in use

**Fix**: Coder agent will automatically kill and restart. If issues persist:
```bash
# Manually kill process
lsof -ti:3000 | xargs kill -9

# Restart harness
/feature-harness
```

### "Permission denied" errors

**Cause**: Auto-approval not enabled

**Fix**: Enable auto-approval in Claude Code settings (see Installation section)

### "Stale codebase inventory"

**Cause**: Codebase changed significantly since last discovery

**Fix**: Agents automatically validate and update inventory. To force refresh:
```bash
rm .harness/codebase-inventory.json
/feature-harness  # Will re-discover
```

---

## Advanced Usage

### Custom Specs Directory

```bash
/feature-harness --specs-dir custom/specs/path
```

### Manual Artifact Management

```bash
# Initialize artifacts manually
bash .claude-plugins/feature-harness/scripts/init-artifacts.sh

# Reset harness (start over)
rm -rf .harness/
/feature-harness
```

### Skip Auto-Commit

Set in `.claude/feature-harness.local.md`:
```yaml
---
autoCommit: false
---
```

Coder agent will implement and test but not commit. You review and commit manually.

---

## Architecture Details

### Agent Coordination

```
User → /write-spec → spec-writer agent
                        ↓
                   specs/features/[name].md

User → /feature-harness → initializer agent (Session 1)
                              ↓
                         .harness/artifacts + Linear issues

User → /feature-harness → coder agent (Session 2+)
                              ↓
                         Implement → Test → Commit
                              ↓
                         Update artifacts

User → /feature-status → Read artifacts directly

User → /feature-resume → resume agent
                             ↓
                        Handle checkpoint → coder agent
```

### Multi-Session Context Flow

1. **Session 1**: Initializer writes artifacts
2. **Session 2**: Coder reads artifacts, implements feature, updates artifacts
3. **Session 3**: New Coder invocation reads updated artifacts, continues
4. **Session N**: Pattern repeats until all features complete

**Key insight**: Artifacts enable context preservation across independent Task tool invocations.

### Linear Project Caching

First initialization:
```
User → Initializer → Linear MCP: list_projects
                       ↓
                  AskUserQuestion: Select project
                       ↓
              .harness/.linear_project.json (cache 30 days)
```

Subsequent sessions:
```
User → Initializer/Coder → Read .linear_project.json
                               ↓
                          Use cached project ID
```

Cache expires after 30 days → re-prompts user.

---

## Development

### Plugin Structure

```
.claude-plugins/feature-harness/
├── .claude-plugin/
│   └── plugin.json
├── .mcp.json
├── agents/
│   ├── spec-writer.md
│   ├── initializer.md
│   ├── coder.md
│   └── resume.md
├── commands/
│   ├── write-spec.md
│   ├── feature-harness.md
│   ├── feature-status.md
│   ├── feature-resume.md
│   └── feature-stop.md
├── skills/
│   ├── harness-guide/
│   ├── spec-writing/
│   ├── troubleshooting/
│   └── frontend-patterns/
├── scripts/
│   └── init-artifacts.sh
└── README.md (this file)
```

### Adding New Features

See Linear ticket [SPR-89](https://linear.app/sprocket-ux-limited/issue/SPR-89) for development roadmap.

---

## References

- **Linear Ticket**: [SPR-89](https://linear.app/sprocket-ux-limited/issue/SPR-89) - Production Plugin Build
- **MVP Validation**: [SPR-87](https://linear.app/sprocket-ux-limited/issue/SPR-87) - MCP Access Test
- **Architecture Spec**: [specs/plugin-design/full-architecture.md](../../specs/plugin-design/full-architecture.md)
- **Anthropic Quickstart**: Autonomous Coding Agent patterns
- **Cole Medin Pattern**: Linear Coding Agent Harness

---

## License

Private - Part of Interplay monorepo
Copyright © 2026 Sprocket UX Limited

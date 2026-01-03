# Feature Harness Settings Template

Copy this file to `.claude/feature-harness.local.md` in your project root to configure Feature Harness for your repository.

```markdown
---
specsDir: specs/features
harnessDir: .harness
autoCommit: true
---

# Feature Harness Configuration

This file configures the Feature Harness plugin for this project.

## Directory Configuration

- **Specs Directory**: `specs/features/` - Where feature specifications are stored
- **Harness Directory**: `.harness/` - Where session artifacts and state are stored

## Linear Integration

Linear project selection is cached in `.harness/.linear_project.json` after first initialization.
Cache expires after 30 days and will prompt for re-selection.

No environment variables required - Linear MCP uses OAuth authentication via Claude Code.

## Playwright Browser Automation

- **Browser**: Chromium (headless)
- **Installation**: Run `npx playwright install chromium` before first use
- **Dev Server**: Coder agent automatically manages localhost:3000 lifecycle

## GitHub Integration (Optional)

If using GitHub MCP for PR automation:
- Configure GitHub token via Claude Code MCP settings
- OAuth authentication recommended

## Auto-Commit Behavior

When `autoCommit: true`, the Coder agent will:
- Create git commits automatically after successful feature implementation
- Use format: `feat: [Feature name] [LINEAR-123]`
- Only commit when all tests pass
- Create checkpoints instead of commits when tests fail

Set to `false` to review changes before committing manually.

## Autonomous Mode Setup

For fully autonomous operation without permission prompts, configure Claude Code settings:

1. Open Claude Code Settings
2. Navigate to: Tool Use > Auto-approve tools
3. Add these tools:
   - Read
   - Write
   - Edit
   - Bash
   - Glob
   - Grep
   - Linear MCP (all tools)
   - Playwright MCP (all tools)
   - GitHub MCP (all tools, if using)

⚠️ **Security Note**: Only enable auto-approval in trusted development environments.

## Optional Plugin Dependencies

Feature Harness integrates with these official Anthropic plugins if installed:

- **feature-dev** - Used by spec-writer for discovery patterns (RECOMMENDED)
- **frontend-design** - Referenced by coder for UI component guidance
- **commit-commands** - Used for git operations
- **code-review** - Optional quality checks
- **pr-review-toolkit** - Optional PR review

Install these plugins for enhanced capabilities:
```bash
# Enable in .claude/settings.json or via Claude Code UI
```

## Troubleshooting

See `/harness-guide` skill or `.claude-plugins/feature-harness/README.md` for:
- Common setup issues
- Permission configuration
- Linear authentication
- Playwright browser setup
- Dev server conflicts
```

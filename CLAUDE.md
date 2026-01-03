# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a Claude Code plugin marketplace repository containing custom plugins for the Universal Agents team. The primary plugin is `prototype-mode`, which creates a safe prototyping environment for frontend UI/UX development with mock data.

## Architecture

### Plugin Structure
Each plugin follows this structure:
```
plugin-name/
├── .claude-plugin/
│   └── plugin.json         # Plugin metadata
├── skills/                 # Skill implementations
│   └── skill-name/
│       ├── SKILL.md       # Skill definition (frontmatter + content)
│       ├── examples/      # Code examples
│       └── references/    # Additional documentation
├── commands/              # Command implementations (.md files)
├── agents/                # Agent definitions (.md files)
├── hooks/
│   └── hooks.json        # Hook configurations
└── README.md             # Plugin documentation
```

### Plugin Components

**Skills**: Provide specialized guidance through markdown files with YAML frontmatter
- Defined in `skills/*/SKILL.md`
- Frontmatter includes: `name`, `description`, `version`
- Content provides comprehensive instructions and examples
- Auto-invoked when user requests match description patterns

**Commands**: User-invocable actions (e.g., `/prototype-mode`)
- Defined as `.md` files in `commands/` directory
- Provide structured workflows and automation

**Agents**: Specialized autonomous agents for complex tasks
- Defined as `.md` files in `agents/` directory
- Launched via `/prototype-feature` or similar commands

**Hooks**: Intercept and control tool execution
- Configured in `hooks/hooks.json`
- Types: `PreToolUse` (before tool execution)
- Matchers: Regex patterns for which tools to intercept (e.g., `"Write|Edit|Bash"`)
- Can `allow` or block operations with custom messages

## Key Conventions

### File Naming
- Plugin metadata: `.claude-plugin/plugin.json`
- Skills: `skills/skill-name/SKILL.md` (YAML frontmatter required)
- Commands: `commands/command-name.md`
- Agents: `agents/agent-name.md`
- Hooks: `hooks/hooks.json`

### YAML Frontmatter Format
All skills must include frontmatter:
```yaml
---
name: Skill Name
description: When this skill should be used and what it does
version: 0.1.0
---
```

### Hook Configuration Schema
```json
{
  "PreToolUse": [
    {
      "name": "hook-name",
      "description": "What this hook does",
      "matcher": "ToolName|OtherTool",
      "hooks": [
        {
          "type": "prompt",
          "prompt": "Instructions for hook execution...",
          "timeout": 30
        }
      ]
    }
  ]
}
```

## Available Plugins

### feature-harness Plugin

**Purpose**: Production-ready autonomous feature implementation system with multi-session context management, Linear integration, and Playwright testing.

### Core Components

**4 Agents**:
1. `spec-writer` - Feature specification generation (discovery, exploration, architecture)
2. `initializer` - Session 1: Setup, planning, Linear issue creation
3. `coder` - Session 2+: Autonomous implementation with testing
4. `resume` - Checkpoint recovery and error handling

**5 Commands**:
1. `/write-spec` - Launch spec-writer for feature design
2. `/feature-harness` - Main entry (auto-detects session 1 vs 2+)
3. `/feature-status` - Show progress and current state
4. `/feature-resume` - Resume from checkpoint
5. `/feature-stop` - Graceful stop with manual checkpoint

**2 Skills**:
1. `harness-guide` - Complete workflow guide and architecture
2. `troubleshooting` - Common issues and solutions

**Artifacts**: Context preserved in `.harness/` directory:
- `session.json` - Current session state
- `features.json` - Feature list with status
- `progress.txt` - Human-readable audit log
- `init.sh` - Environment bootstrap script
- `.linear_project.json` - Cached Linear project

**MCP Servers**:
- Linear MCP (required) - OAuth authentication
- Playwright MCP (required) - Browser automation
- GitHub MCP (optional) - Repository integration

### Workflow

```
1. /write-spec         → Design feature, create spec
2. /feature-harness    → Initialize (Session 1): Linear issues, artifacts
3. /feature-harness    → Implement (Session 2+): Code, test, commit
4. /feature-status     → Check progress
5. /feature-resume     → Handle failures
```

---

### prototype-mode Plugin

**Purpose**: Safe frontend prototyping environment that blocks backend operations, database access, and external API calls while enabling rapid UI/UX development with mock data.

### Core Components

**3 Skills**:
1. `prototyping-best-practices` - Mock data patterns, frontend-first development
2. `user-journey-design` - UX patterns, flow design, frontend-design integration
3. `external-code-interpretation` - Convert code from Lovable, v0, Replit, Gemini to Vue/Nuxt

**3 Commands**:
1. `/prototype-mode` - Enter safe prototyping environment
2. `/exit-prototype` - Exit with cleanup and handoff notes
3. `/prototype-feature` - Launch guided feature development

**1 Agent**:
- `feature-guide` - Step-by-step feature prototyping with requirements gathering

**1 Hook**:
- `prototype-mode-safety-enforcer` - Blocks unsafe operations (Write/Edit/Bash on backend files)

### Safety Architecture

The hook reads `.claude/prototyping-mode.local.md` to determine:
- `allowed_directories`: Frontend dirs (components/, pages/, mocks/)
- `blocked_directories`: Backend dirs (server/, api/, supabase/)
- `allowed_mcps`: Design tools (figma, playwright, screenshot)
- `blocked_mcps`: Data tools (supabase, postgres, mysql)

Operations are **hard blocked** (not warned) when prototype mode is active.

## Development Guidelines

### Creating New Skills
1. Create directory: `skills/new-skill-name/`
2. Add `SKILL.md` with YAML frontmatter
3. Include clear `description` with trigger phrases
4. Organize supporting content:
   - `examples/` - Working code examples
   - `references/` - Detailed documentation

### Creating New Commands
1. Create `commands/command-name.md`
2. Define command trigger (e.g., `/command-name`)
3. Provide step-by-step instructions
4. Include usage examples

### Creating New Hooks
1. Add hook definition to `hooks/hooks.json`
2. Define `matcher` pattern for tool interception
3. Write prompt with decision logic
4. Return JSON: `{"allow": true}` or `{"allow": false, "message": "..."}`

### Hook Prompt Pattern
Hooks should:
- Check activation state (read config file)
- Parse configuration (allowed/blocked lists)
- Analyze tool call parameters
- Apply safety rules
- Return JSON-only response
- Provide helpful error messages when blocking

## Best Practices

### Skill Descriptions
Write descriptions that match user intent:
- Include natural language phrases users might say
- Cover multiple trigger variations
- Be specific about when skill applies

Example:
```yaml
description: This skill should be used when the user asks to "design a user journey", "map the user flow", "design the feature flow", or mentions user journeys, UX design, user experience patterns, or interface workflows.
```

### Hook Matchers
Use pipe-separated tool names:
```json
"matcher": "Write|Edit|Bash"
```

### Documentation
- Keep README.md comprehensive for users
- Include installation, usage, examples, troubleshooting
- Document all components (skills, commands, agents, hooks)
- Provide workflow examples

### Safety Philosophy
When building safety features:
- **Hard block** unsafe operations (don't just warn)
- Provide clear explanations why blocked
- Suggest how to proceed (exit mode, fix issue)
- Use specific error messages referencing actual file/command

## Testing Plugins

### Local Development
Test plugin before publishing:
```bash
cc --plugin-dir /path/to/plugin-directory
```

### Project-Specific Installation
Copy to project's `.claude-plugin/` directory:
```bash
cp -r plugin-name /path/to/project/.claude-plugin/
```

### Marketplace Installation
When published:
```bash
/plugin marketplace add universalagents-ai/ua-claude-code-plugins
/plugin install prototype-mode@ua-plugins
```

## Common Patterns

### Skill Auto-Invocation
Skills are automatically invoked when user messages match description patterns. Write descriptions that capture user intent naturally.

### Command Workflows
Commands should:
1. Check prerequisites (branch status, file existence)
2. Scan project structure
3. Create configuration files
4. Activate features (hooks, modes)
5. Provide feedback to user

### Agent Workflows
Agents should:
1. Gather requirements through questions
2. Guide step-by-step through process
3. Invoke other skills as needed
4. Provide summaries and next steps

### Hook Decision Logic
```
1. Check if feature is active (read config)
2. If not active → allow
3. If active → parse config
4. Analyze tool parameters
5. Apply rules (file paths, commands, MCPs)
6. Return {"allow": boolean, "message": string}
```

## File References

- Plugin metadata: `.claude-plugin/plugin.json`
- Main documentation: `README.md` (per plugin)
- Repository docs: Root `README.md`

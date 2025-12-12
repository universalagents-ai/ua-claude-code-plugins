# Prototype Mode Plugin

A Claude Code plugin that creates a safe prototyping environment for designers, engineers, product managers, and strategists to build frontend UI/UX prototypes without risking backend code or data exposure.

## Overview

Prototype Mode focuses exclusively on frontend development with mock data, blocking all backend operations, database access, and unsafe external integrations. It enables rapid prototyping through natural conversation while maintaining strict safety boundaries.

## Features

- **Safe Environment**: Hard blocks backend file modifications, database operations, and sensitive API calls
- **Branch Protection**: Automatically creates a prototyping branch if on main/master
- **Mock Data First**: Enforces mock data usage throughout prototyping workflow
- **Design Integration**: Works seamlessly with frontend-design plugin and Figma Dev Mode MCP
- **External Code Interpretation**: Adapts code from Lovable, v0, Replit, and Gemini to your project structure
- **Guided Feature Development**: Step-by-step feature prototyping with UX best practices
- **Smart Cleanup**: Saves prototype work and mock data when exiting mode

## Installation

### Local Development
```bash
cc --plugin-dir /Users/ollie/Documents/Repositories/interplay/ua-plugins/prototype-mode
```

### Project-Specific
Copy the plugin to your project's `.claude-plugin/` directory:
```bash
cp -r ua-plugins/prototype-mode /path/to/your/project/.claude-plugin/
```

## Usage

### Enter Prototype Mode
```
/prototype-mode
```

This command:
1. Checks if you're on main/master branch (creates prototyping branch if needed)
2. Scans project structure to determine allowed/blocked directories
3. Creates `.claude/prototyping-mode.local.md` with configuration
4. Activates safety hooks to prevent backend modifications

### Exit Prototype Mode
```
/exit-prototype
```

This command:
1. Saves all prototype work and mock data
2. Provides summary of changes made
3. Generates handoff notes for development team
4. Deactivates prototype mode

### Build a Guided Feature
```
/prototype-feature [optional: feature name]
```

Launches the Feature Guide Agent which walks you through:
- Feature requirements and user needs
- User journey and flow design
- KPI definition and success metrics
- Component placement in interface
- Step-by-step implementation with mock data

### Natural Conversation

When prototype mode is active, simply describe what you want to build:
- "Design a user dashboard showing activity metrics"
- "Create a checkout flow with payment steps"
- "Build a profile settings page"

The plugin skills automatically activate to guide frontend-focused development.

## What's Allowed in Prototype Mode

✅ **Frontend Files**
- `components/`, `pages/`, `layouts/`, `assets/`, `styles/`
- Any UI-related directories in your project

✅ **Mock Data**
- `mocks/`, `fixtures/`, `__mock__/`, `data/`
- JSON files with sample data

✅ **Design MCPs**
- Figma Dev Mode (design import)
- Playwright (viewing existing interfaces)
- Screenshot analysis

✅ **Frontend Tools**
- npm/pnpm package installation (UI libraries only)
- Tailwind CSS styling
- shadcn/ui component library

## What's Blocked in Prototype Mode

❌ **Backend Files**
- `server/`, `api/`, `supabase/`, `database/`
- Any server-side code

❌ **Sensitive Configuration**
- `.env`, `credentials.json`, API keys
- Environment variables

❌ **Database Operations**
- Supabase, PostgreSQL, MySQL MCPs
- Any database queries

❌ **External APIs**
- REST clients, GraphQL endpoints
- Third-party API integrations

❌ **Dangerous Bash Commands**
- `psql`, `mysql`, `docker`, `supabase` CLI
- `curl` for API calls

## Configuration

The plugin creates `.claude/prototyping-mode.local.md` when activated:

```yaml
---
enabled: true
framework: nuxt
allowed_mcps:
  - figma
  - playwright
  - screenshot
blocked_mcps:
  - supabase
  - postgres
  - mysql
allowed_directories:
  - components/
  - pages/
  - layouts/
  - assets/
  - mocks/
blocked_directories:
  - server/
  - api/
  - supabase/
---

# Prototyping Mode Active

Mode activated on: 2025-12-05
Branch: prototyping
```

**⚠️ Warning**: Do NOT manually edit this file while prototype mode is active. Exit prototype mode first, make changes, then re-enter.

## Components

### Skills (3)
1. **Prototyping Best Practices** - Mock data patterns, frontend-first development
2. **User Journey & Feature Flow** - UX patterns, frontend-design integration
3. **External Code Interpretation** - Convert code from Lovable, v0, Replit, Gemini

### Commands (3)
1. `/prototype-mode` - Enter safe prototyping environment
2. `/exit-prototype` - Exit with cleanup and handoff notes
3. `/prototype-feature` - Guided feature development

### Agents (1)
1. **Feature Guide Agent** - Step-by-step feature prototyping with requirements gathering

### Hooks (1)
1. **Safety Enforcer** - PreToolUse hook that blocks unsafe operations with helpful messages

## Workflow Example

```bash
# Start prototyping
/prototype-mode

# Build a feature with guidance
/prototype-feature "user dashboard"

# Or work naturally
> "Create a navigation component with mock user data"
> "Add a settings page with form validation"
> "Import this design from Figma"

# When done
/exit-prototype
```

## Integration with Other Tools

### frontend-design Plugin
Prototype mode automatically invokes the frontend-design skill for UI generation, ensuring high-quality, production-ready interfaces.

### Figma Dev Mode MCP
Use Figma Dev Mode to pull designs directly into your prototype while maintaining safety boundaries.

### shadcn/ui
The plugin checks for shadcn/ui installation and prompts to install if needed for rapid component prototyping.

## Safety Philosophy

Prototype mode uses **hard blocking** to prevent mistakes:
- Operations are blocked entirely, not just warned
- Clear messages explain why and how to proceed
- Must exit prototype mode to perform blocked operations
- Prevents accidental data exposure or backend changes

This is intentional to protect non-technical users (designers, PMs) from making harmful changes.

## Troubleshooting

**"I need to modify a server file"**
Exit prototype mode with `/exit-prototype`, make your changes, then re-enter if needed.

**"The plugin blocked a safe operation"**
The settings file may need adjustment. Exit prototype mode, manually edit `.claude/prototyping-mode.local.md`, then re-enter.

**"Mock data isn't loading"**
Ensure mock data files are in allowed directories (`mocks/`, `fixtures/`, etc.) and properly imported in components.

**"Can't install a package"**
Backend packages may be blocked. If it's a UI library, the plugin should allow it. Report false positives.

## Development

To modify or extend this plugin:

1. Skills are in `skills/` directory
2. Commands are in `commands/` directory
3. Agent definition in `agents/` directory
4. Hook configuration in `hooks/hooks.json`

See individual component documentation for details.

## License

MIT

# UA Claude Code Plugins

Custom Claude Code plugins for Universal Agents team.

## Available Plugins

- **prototype-mode**: Safe prototyping environment for frontend UI/UX development
- **feature-harness**: Production-ready autonomous feature implementation system with multi-session context management, Linear integration, and Playwright testing
- **feature-harness-mvp**: MVP validation plugin (deprecated - use feature-harness)

## Installation

```bash
/plugin marketplace add universalagents-ai/ua-claude-code-plugins
/plugin install prototype-mode@ua-plugins
/plugin install feature-harness@ua-plugins
```

## Feature Harness Overview

The Feature Harness plugin provides:
- **📝 Spec Writing**: Guided feature design workflow
- **🔍 Codebase Discovery**: Automatic pattern and architecture detection
- **🎯 Linear Integration**: Issue creation and tracking
- **🤖 Autonomous Implementation**: Multi-session feature development
- **🧪 Playwright Testing**: Automated browser testing
- **💾 Context Preservation**: Artifacts persist across sessions

### Quick Start

```bash
# Design a feature
/write-spec

# Initialize and implement
/feature-harness

# Check progress
/feature-status
```

See [feature-harness/README.md](feature-harness/README.md) for complete documentation.

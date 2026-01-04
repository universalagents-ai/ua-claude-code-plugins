---
description: "Guide user through feature specification generation via discovery, codebase exploration, clarifying questions, and architecture design"
argument-hint: "[--feature-name <name>]"
allowed-tools:
  - Task
  - Read
  - Write
  - AskUserQuestion
---

# Write Feature Specification Command

You have been invoked via the `/write-spec` command.

Your role is to launch the spec-writer agent to guide the user through creating a comprehensive feature specification.

## STEP 1: Parse Arguments

Check if `--feature-name` argument was provided:
- If provided: Use as suggested feature name
- If not provided: Agent will ask user for feature name in Phase 1

## STEP 2: Launch Spec-Writer Agent

Use the Task tool to spawn the spec-writer agent:

```
Use Task tool:
- description: "Generate feature specification"
- subagent_type: "feature-harness:spec-writer"
- prompt: "Guide the user through feature specification generation. [If feature name provided: Focus on feature: <name>]"
- model: opus
```

## STEP 3: Monitor Execution

The spec-writer agent will:
1. **Phase 1**: Discovery - Understand what feature to build
2. **Phase 2**: Codebase Exploration - Discover patterns, validate/create inventory
3. **Phase 3**: Clarifying Questions - Resolve ambiguities
4. **Phase 4**: Architecture Design - Design technical architecture
5. **Phase 5**: Spec Generation - Write spec to `specs/features/[name].md`

The agent will use:
- feature-dev plugin agents (Explorer, Architect) for discovery patterns
- AskUserQuestion to resolve ambiguities
- Codebase inventory validation/creation

## STEP 4: Agent Completion

When the agent completes:
1. Spec will be written to `specs/features/[feature-name].md`
2. Codebase inventory updated if needed
3. User informed of next steps

## STEP 5: Inform User

After agent completes, tell user:

```
✅ Feature specification complete!

Spec location: specs/features/[filename]

Next steps:
1. Review the spec and make any adjustments if needed
2. Run /write-spec again to design additional features (optional)
3. When ready to implement all specs: Run /feature-harness

The Feature Harness workflow:
- /write-spec: Design features (this command)
- /feature-harness: Initialize and implement features
- /feature-status: Check progress
- /feature-resume: Handle checkpoints
```

## EXAMPLE USAGE

**Design single feature**:
```
User: /write-spec
Agent: Launches spec-writer, asks "What feature do you want to design?"
User provides requirements, agent guides through 5 phases
Result: specs/features/user-authentication.md
```

**Design feature with name hint**:
```
User: /write-spec --feature-name dashboard-widgets
Agent: Launches spec-writer with focus on dashboard widgets
Agent guides through 5 phases
Result: specs/features/dashboard-widgets.md
```

**Design multiple features** (sequential):
```
User: /write-spec
Result: specs/features/feature-1.md

User: /write-spec
Result: specs/features/feature-2.md

User: /write-spec
Result: specs/features/feature-3.md

User: /feature-harness
Initializer reads all 3 specs, creates Linear issues, begins implementation
```

## NOTES

- Each `/write-spec` invocation designs ONE feature
- Specs are read by Feature Harness initializer during `/feature-harness` initialization
- User can design all features first, then implement in batch
- This enables better planning and prevents context pollution

---

**Remember**: Your job is to launch the agent and monitor. The spec-writer agent handles all the workflow phases autonomously.

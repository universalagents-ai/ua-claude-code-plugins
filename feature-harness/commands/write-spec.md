---
description: "Guide user through feature specification generation - orchestrates discovery, codebase scanning, clarifying questions, architecture design, and spec writing"
argument-hint: "[--feature-name <name>]"
---

# Write Feature Specification Command

You are the **orchestrator** for feature specification generation. You guide the user through a 5-phase workflow, invoking focused agents for autonomous tasks and handling all human interaction directly.

## Architecture Overview

```
YOU (this command) - The Orchestrator
├── Phase 1: Discovery         → YOU handle (AskUserQuestion)
├── Phase 2: Codebase Scan     → codebase-scanner agent
├── Phase 3: Clarifying Qs     → YOU handle (AskUserQuestion)
├── Phase 4: Architecture      → spec-architect agent
└── Phase 5: Spec Generation   → YOU handle (Write tool)
```

**Key principle**: YOU handle all human interaction. Agents execute autonomously and return results.

---

## PHASE 1: Discovery

**Goal**: Understand what feature the user wants to build.

### Step 1.1: Create Todo List

Use TodoWrite to create a tracking list:
1. Phase 1: Discovery
2. Phase 2: Codebase Exploration
3. Phase 3: Clarifying Questions
4. Phase 4: Architecture Design
5. Phase 5: Spec Generation

### Step 1.2: Get Feature Description

Check if `--feature-name` argument was provided:
- If yes: Use as starting point, but still ask for details
- If no: Ask user for feature description

Use AskUserQuestion:
```
Question: "What feature would you like to design?"
Header: "Feature"
Options:
- "Let me describe it" (user types description)
```

### Step 1.3: Gather Requirements

Ask follow-up questions using AskUserQuestion to understand the full scope:

**Question 1 - Problem**:
```
Question: "What problem does this feature solve?"
Header: "Problem"
Options: [Free text response expected]
```

**Question 2 - Functionality**:
```
Question: "What should this feature do? (Key behaviors and functionality)"
Header: "Behaviors"
Options: [Free text response expected]
```

**Question 3 - Constraints**:
```
Question: "Are there any constraints or requirements? (Tech limitations, dependencies, timeline)"
Header: "Constraints"
Options:
- "No specific constraints"
- "Let me describe constraints" (free text)
```

**Question 4 - Priority**:
```
Question: "What's the priority of this feature?"
Header: "Priority"
Options:
- "High - Blocker for other work"
- "Medium - Important but not blocking"
- "Low - Nice to have"
```

### Step 1.4: Summarize Intent

Output a feature intent summary:
```
## Feature Intent

**Title**: [Feature name]
**Problem**: [What it solves]
**Key Behaviors**: [What the feature should do]
**Constraints**: [Any limitations or requirements, or "None"]
**Priority**: [High/Medium/Low]
```

Ask user to confirm before proceeding:
```
Question: "Does this capture your feature correctly? Ready for Phase 2?"
Header: "Confirm"
Options:
- "Yes, proceed to codebase scan"
- "No, let me clarify"
```

**Mark Phase 1 complete in todos.**

---

## PHASE 2: Codebase Exploration

**Goal**: Scan codebase to understand existing patterns and components, leveraging any existing inventory.

### Step 2.1: Check for Existing Codebase Inventory

Before invoking the scanner agent, check if a codebase inventory already exists:

```
Use Read tool to check: .harness/codebase-inventory.json
```

**If inventory exists**:
- Output: `📋 Found existing codebase inventory (last updated: [timestamp from file])`
- Parse the inventory to extract:
  - Component count, page count, API route count, store count
  - Architecture summary
  - Known patterns and conventions
- This context will be passed to the codebase-scanner agent

**If inventory doesn't exist**:
- Output: `📋 No existing codebase inventory found. Will create new inventory.`
- Ensure `.harness/` directory exists: `mkdir -p .harness`

### Step 2.2: Invoke Codebase Scanner Agent

Use Task tool to launch the codebase-scanner agent WITH existing inventory context:

```
Use Task tool:
- description: "Scan codebase structure"
- subagent_type: "feature-harness:codebase-scanner"
- prompt: |
    Scan the codebase and return a structured inventory. The user is designing a feature for: [FEATURE DESCRIPTION]. Focus on identifying relevant patterns and reusable components.

    [IF EXISTING INVENTORY EXISTS, INCLUDE:]
    ## Existing Inventory Context
    The previous inventory (from [timestamp]) showed:
    - Components: [count]
    - Pages: [count]
    - API Routes: [count]
    - Stores: [count]
    - Architecture: [summary]

    Please validate this against current codebase state and report any:
    - **Additions**: New files/patterns not in previous inventory
    - **Removals**: Files/patterns that no longer exist
    - **Changes**: Significant structural changes

    [END IF]
- model: sonnet
```

### Step 2.3: Process Scanner Results and Update Inventory

When agent returns:

1. **Output the codebase context to user**:
   ```
   ## Codebase Context

   [Agent's inventory output]

   [If differences found:]
   ### Inventory Changes Detected
   - Additions: [list]
   - Removals: [list]
   ```

2. **Update the codebase inventory file**:
   Use Write tool to save/update `.harness/codebase-inventory.json` with the agent's structured output:
   ```json
   {
     "lastUpdated": "[ISO timestamp]",
     "componentCount": [N],
     "pageCount": [N],
     "apiRouteCount": [N],
     "storeCount": [N],
     "architecture": { ... },
     "patterns": { ... },
     "reusableComponents": [ ... ]
   }
   ```

3. **Confirm before proceeding**:
   ```
   Question: "Codebase scan complete. Ready to proceed to clarifying questions?"
   Header: "Proceed"
   Options:
   - "Yes, proceed to Phase 3"
   - "No, explore more areas first"
   ```

**Mark Phase 2 complete in todos.**

---

## PHASE 3: Clarifying Questions

**Goal**: Resolve all ambiguities before architecture design.

**⚠️ MANDATORY**: You MUST ask at least 3 clarifying questions using AskUserQuestion before proceeding to Phase 4. This is not optional.

### Step 3.1: Identify Questions

Based on the feature intent and codebase context, identify 3-5 key decisions that need user input. Common areas:

- **UI/UX**: Where should this feature live? Modal, page, sidebar?
- **Data**: How should data be stored? Server-side, client-side?
- **Integration**: Which existing components to reuse?
- **Error handling**: How should errors be displayed?
- **Authentication**: Does this require login?
- **Validation**: What input validation is needed?
- **Performance**: Any specific performance requirements?

### Step 3.2: Ask Questions (Minimum 3 Required)

Use AskUserQuestion for each decision point. **You MUST ask at least 3 questions** - do not proceed until you have asked and received answers to 3+ questions.

**Example questions**:

```
Question: "Where should the [feature] UI live?"
Header: "UI Location"
Options:
- "Dedicated page at /[route]"
- "Modal/dialog overlay"
- "Inline within existing page"
- "Sidebar panel"
```

```
Question: "How should [feature] data be stored?"
Header: "Data Storage"
Options:
- "Server-side with API endpoint"
- "Client-side local storage"
- "Pinia store with server sync"
```

```
Question: "Should this feature require authentication?"
Header: "Auth"
Options:
- "Yes, must be logged in"
- "No, publicly accessible"
- "Optional - enhanced for logged-in users"
```

### Step 3.3: Summarize Decisions

Output a summary of all decisions:
```
## Clarified Requirements

- **UI Location**: [answer]
- **Data Storage**: [answer]
- **Authentication**: [answer]
- [Additional decisions...]
```

Confirm before proceeding:
```
Question: "Ready to proceed to architecture design?"
Header: "Proceed"
Options:
- "Yes, design the architecture"
- "No, I have more to clarify"
```

**Mark Phase 3 complete in todos.**

---

## PHASE 4: Architecture Design

**Goal**: Design technical architecture for the feature.

### Step 4.1: Invoke Spec Architect Agent

Use Task tool to launch the spec-architect agent:

```
Use Task tool:
- description: "Design feature architecture"
- subagent_type: "feature-harness:spec-architect"
- prompt: |
    Design the architecture for this feature:

    ## Feature Requirements
    [Feature intent from Phase 1]

    ## Codebase Context
    [Inventory from Phase 2]

    ## Clarified Decisions
    [Decisions from Phase 3]

    Design a complete architecture with components, APIs, database schema (if needed), and build sequence.
- model: sonnet
```

### Step 4.2: Present Architecture

When agent returns, present the architecture to user:
```
## Architecture Design

[Agent's architecture output]
```

Confirm before proceeding:
```
Question: "Does this architecture look good? Ready to generate the spec?"
Header: "Architecture"
Options:
- "Yes, generate the specification"
- "No, I want to adjust something"
```

If user wants adjustments, discuss and re-invoke architect if needed.

**Mark Phase 4 complete in todos.**

---

## PHASE 5: Spec Generation

**Goal**: Generate and write the feature specification file.

### Step 5.1: Create Directory

```bash
mkdir -p specs/features
```

### Step 5.2: Generate Spec Content

Combine all gathered information into a spec using this template:

```markdown
# Feature: [Feature Name]

**Status**: Not Started
**Priority**: [High/Medium/Low]
**Created**: [ISO timestamp]
**Estimated Complexity**: [Simple/Moderate/Complex]

---

## Overview

[Brief description - 2-3 sentences]

## Problem Statement

[What problem does this feature solve?]

## Goals

- [Goal 1]
- [Goal 2]
- [Goal 3]

## Success Criteria

- [ ] [Testable criterion 1]
- [ ] [Testable criterion 2]
- [ ] [Testable criterion 3]

## Technical Design

[Architecture from Phase 4 - components, APIs, database, state management]

## Build Sequence

[Step-by-step implementation order from architecture]

## Test Cases

### Test Case 1: [Scenario]
**Given**: [Initial state]
**When**: [Action]
**Then**: [Expected outcome]

[Repeat for 5-10 scenarios]

## Codebase Context

**Relevant patterns**: [From Phase 2]
**Reusable components**: [From Phase 2]

---

**Generated by**: Feature Harness /write-spec command
**For implementation**: Run `/feature-harness` to begin autonomous implementation
```

### Step 5.3: Write Spec File

Use Write tool to save the spec:
- Filename: `specs/features/[kebab-case-feature-name].md`
- Report: "Spec written to specs/features/[filename]"

### Step 5.4: Inform User

Output completion message:
```
## Specification Complete

**File created**: specs/features/[filename]

### Next Steps

1. Review the spec and make any adjustments
2. Run `/write-spec` again for additional features (optional)
3. When ready to implement: Run `/feature-harness`

The Feature Harness workflow:
- `/write-spec` - Design features (this command)
- `/feature-harness` - Initialize and implement features
- `/feature-status` - Check progress
```

**Mark Phase 5 complete in todos. Mark all todos complete.**

---

## Error Handling

### If codebase-scanner agent fails:
- Report error to user
- Offer to proceed with manual context gathering
- Use Glob/Grep directly to get basic file counts

### If spec-architect agent fails:
- Report error to user
- Offer to design architecture manually with user input
- Use simpler component-by-component approach

### If user is unclear:
- Ask more specific questions
- Provide examples of what you need
- Don't proceed until requirements are clear

---

## Important Notes

- **YOU are the orchestrator** - don't delegate orchestration to agents
- **Agents are autonomous** - they execute and return, no multi-turn conversation
- **Human interaction is YOUR job** - all AskUserQuestion calls happen in this command
- **Be patient with phases** - don't rush through, ensure each phase completes properly
- **Track progress** - update todos as you complete each phase

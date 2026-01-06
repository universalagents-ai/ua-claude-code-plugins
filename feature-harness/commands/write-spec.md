---
description: "Guide user through feature specification generation - orchestrates discovery, parallel codebase scanning, clarifying questions, parallel architecture design, and spec writing"
argument-hint: "[--feature-name <name>]"
---

# Write Feature Specification Command

You are the **orchestrator** for feature specification generation. You guide the user through a 5-phase workflow, invoking focused agents for autonomous tasks and handling all human interaction directly.

## Architecture Overview

```
YOU (this command) - The Orchestrator
├── Phase 1: Discovery              → YOU handle (AskUserQuestion)
├── Phase 2: Codebase Scan          → 3 codebase-scanner agents IN PARALLEL
│   ├── Agent 1: Component & UI Patterns
│   ├── Agent 2: State & Data Flow
│   └── Agent 3: Architecture & Dependencies
├── Phase 3: Clarifying Questions   → YOU handle (AskUserQuestion)
├── Phase 4: Architecture Design    → 3 spec-architect agents IN PARALLEL
│   ├── Agent 1: Minimal Changes Approach
│   ├── Agent 2: Clean Architecture Approach
│   └── Agent 3: Validation Perspective
└── Phase 5: Spec Generation        → YOU handle (Write tool + skill)
```

**Key principles**:
- YOU handle all human interaction
- Agents execute autonomously and return results
- **Launch agents in parallel** for efficiency (use multiple Task tool calls in single message)

---

## PHASE 1: Discovery

**Goal**: Understand what feature the user wants to build.

### Step 1.1: Create Todo List

Use TodoWrite to create a tracking list:
1. Phase 1: Discovery
2. Phase 2: Codebase Exploration (Parallel Scan)
3. Phase 3: Clarifying Questions
4. Phase 4: Architecture Design (Parallel Perspectives)
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

## PHASE 2: Codebase Exploration (Parallel Scan)

**Goal**: Scan codebase using 3 parallel agents with different focus areas for comprehensive coverage.

### Step 2.1: Check for Existing Codebase Inventory

Before invoking scanner agents, check if inventory files exist:

```
Use Read tool to check:
- .harness/codebase-inventory.json
- .harness/codebase-inventory.md
```

**If inventory exists**:
- Output: `📋 Found existing codebase inventory (last updated: [timestamp from file])`
- Parse the inventory to extract context for scanner agents
- Pass this context to all 3 scanner agents

**If inventory doesn't exist**:
- Output: `📋 No existing codebase inventory found. Will create new inventory.`
- Ensure `.harness/` directory exists: `mkdir -p .harness`

### Step 2.2: Launch 3 Codebase Scanner Agents IN PARALLEL

**CRITICAL**: Launch all 3 agents in a SINGLE message with multiple Task tool calls. This runs them concurrently for faster results.

```
Use Task tool (ALL 3 IN PARALLEL in same message):

Agent 1 - Component & UI Patterns:
- description: "Scan UI patterns"
- subagent_type: "feature-harness:codebase-scanner"
- prompt: |
    FOCUS AREA: Component & UI Patterns

    The user is designing a feature: [FEATURE DESCRIPTION]

    Analyze the codebase focusing on:
    - Component structure and naming conventions
    - Reusable UI patterns
    - Styling conventions (Tailwind classes)
    - Prop/emit patterns
    - Slot usage patterns

    [IF EXISTING INVENTORY: Include context from previous inventory]

    Return structured findings for your focus area.
- model: sonnet
- run_in_background: true

Agent 2 - State & Data Flow:
- description: "Scan data patterns"
- subagent_type: "feature-harness:codebase-scanner"
- prompt: |
    FOCUS AREA: State & Data Flow

    The user is designing a feature: [FEATURE DESCRIPTION]

    Analyze the codebase focusing on:
    - Pinia stores structure and patterns
    - Composables and their usage
    - API integration patterns
    - Data fetching strategies
    - Error handling approaches

    [IF EXISTING INVENTORY: Include context from previous inventory]

    Return structured findings for your focus area.
- model: sonnet
- run_in_background: true

Agent 3 - Architecture & Dependencies:
- description: "Scan architecture"
- subagent_type: "feature-harness:codebase-scanner"
- prompt: |
    FOCUS AREA: Architecture & Dependencies

    The user is designing a feature: [FEATURE DESCRIPTION]

    Analyze the codebase focusing on:
    - Project structure and module organization
    - Nuxt configuration and layers
    - Dependencies and their usage
    - Build configuration
    - CLAUDE.md conventions

    [IF EXISTING INVENTORY: Include context from previous inventory]

    Return structured findings for your focus area.
- model: sonnet
- run_in_background: true
```

### Step 2.3: Collect and Merge Results

Use TaskOutput to collect results from all 3 agents:

```
Wait for all 3 agents to complete using TaskOutput with block=true
```

Merge the findings into a comprehensive codebase context:

```
## Codebase Context (Merged from 3 parallel scans)

### Component & UI Patterns
[Results from Agent 1]

### State & Data Flow
[Results from Agent 2]

### Architecture & Dependencies
[Results from Agent 3]
```

### Step 2.4: Update BOTH Inventory Files

**Reference**: See `codebase-inventory` skill for complete format documentation.

**IMPORTANT**: Create/update BOTH `.json` AND `.md` inventory files following the `codebase-inventory` skill format.

1. **Write `.harness/codebase-inventory.json`** (machine-readable)
   - Must include: lastUpdated, componentCount, pageCount, apiRouteCount, storeCount, composableCount
   - Must include: architecture object, patterns object
   - Optional: reusableComponents array, protoComponents object

2. **Write `.harness/codebase-inventory.md`** (human-readable)
   - Must include: Header with lastUpdated and scanned by
   - Must include: Summary, File Counts table, Architecture list, Key Patterns sections
   - Optional: Reusable Components table, Conventions, Recommendations, Gaps

**If existing inventory was found in Step 2.1**, include comparison:
```markdown
## Changes Since Last Scan

| Metric | Previous | Current | Change |
|--------|----------|---------|--------|
| Components | [prev] | [curr] | +/-N |
| Pages | [prev] | [curr] | +/-N |
```

### Step 2.5: Confirm Before Proceeding

```
Question: "Codebase scan complete (3 parallel scans merged). Ready to proceed to clarifying questions?"
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

## PHASE 4: Architecture Design (Parallel Perspectives)

**Goal**: Design technical architecture using 3 parallel agents with different perspectives.

### Step 4.1: Launch 3 Spec Architect Agents IN PARALLEL

**CRITICAL**: Launch all 3 agents in a SINGLE message with multiple Task tool calls.

```
Use Task tool (ALL 3 IN PARALLEL in same message):

Agent 1 - Minimal Changes Approach:
- description: "Design minimal architecture"
- subagent_type: "feature-harness:spec-architect"
- prompt: |
    PERSPECTIVE: Minimal Changes Approach

    Design architecture that achieves the feature with LEAST modification to existing code.

    ## Feature Requirements
    [Feature intent from Phase 1]

    ## Codebase Context
    [Merged inventory from Phase 2]

    ## Clarified Decisions
    [Decisions from Phase 3]

    Focus on:
    - Reusing existing components
    - Minimal new code
    - Conservative changes
    - Low risk approach
- model: sonnet
- run_in_background: true

Agent 2 - Clean Architecture Approach:
- description: "Design clean architecture"
- subagent_type: "feature-harness:spec-architect"
- prompt: |
    PERSPECTIVE: Clean Architecture Approach

    Design the IDEAL implementation as if starting fresh.

    ## Feature Requirements
    [Feature intent from Phase 1]

    ## Codebase Context
    [Merged inventory from Phase 2]

    ## Clarified Decisions
    [Decisions from Phase 3]

    Focus on:
    - Best practices
    - Optimal component structure
    - Future-proof design
    - Clean separation of concerns
- model: sonnet
- run_in_background: true

Agent 3 - Validation Perspective:
- description: "Validate architecture"
- subagent_type: "feature-harness:spec-architect"
- prompt: |
    PERSPECTIVE: Validation

    Validate the proposed feature against codebase reality.

    ## Feature Requirements
    [Feature intent from Phase 1]

    ## Codebase Context
    [Merged inventory from Phase 2]

    ## Clarified Decisions
    [Decisions from Phase 3]

    Focus on:
    - Path accuracy (do files exist?)
    - Naming conflicts
    - Type compatibility
    - CSS/Tailwind compliance
    - API contract compatibility
- model: sonnet
- run_in_background: true
```

### Step 4.2: Collect and Synthesize Results

Use TaskOutput to collect results from all 3 agents.

Present a synthesized architecture:

```
## Architecture Design (Synthesized from 3 perspectives)

### Recommended Approach
[Choose between Minimal or Clean based on trade-offs]

### From Minimal Changes Agent
[Key points from Agent 1]

### From Clean Architecture Agent
[Key points from Agent 2]

### Validation Results
[Findings from Agent 3]

### Final Component Inventory
| Component | Action | Path | Purpose |
|-----------|--------|------|---------|
| ... | ... | ... | ... |

### Final Build Sequence
1. [Step 1]
2. [Step 2]
...
```

### Step 4.3: Confirm Architecture

```
Question: "Does this architecture look good? Ready to generate the spec?"
Header: "Architecture"
Options:
- "Yes, generate the specification"
- "No, I want to adjust something"
```

If user wants adjustments, discuss and re-invoke relevant architect if needed.

**Mark Phase 4 complete in todos.**

---

## PHASE 5: Spec Generation

**Goal**: Generate and write the feature specification file.

### Step 5.1: Load Spec Writing Skill

**IMPORTANT**: Reference the `spec-writing-best-practices` skill for consistent spec formatting.

The skill provides guidance on:
- Spec structure and required sections
- Decisive language (avoid "could", "might", "consider")
- Exact file paths with line references
- Table format for component inventory
- Atomic build sequence steps
- Given/When/Then test cases

### Step 5.2: Create Directory

```bash
mkdir -p specs/features
```

### Step 5.3: Generate Spec Content

Combine all gathered information following the spec-writing-best-practices skill guidance:

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

### Component Inventory

| Component | Action | Path | Purpose |
|-----------|--------|------|---------|
| [Name] | Create | [full path] | [purpose] |
| [Name] | Modify | [full path] | [what changes] |

### Components to Create

[Detailed component specifications from architecture]

### Components to Modify

[Detailed modification specifications]

### API Endpoints (if applicable)

[API specifications]

### State Management (if applicable)

[Store specifications]

## Build Sequence

1. **[Step Title]** - [What to build]
   - Files: [specific files]
   - Test: [how to verify]

[Continue for 8-16 atomic steps]

## Test Cases

### Test Case 1: [Happy Path Scenario]
**Given**: [Initial state]
**When**: [User action]
**Then**:
- [Expected outcome 1]
- [Expected outcome 2]

[Repeat for 5-10 scenarios including edge cases]

## Codebase Context

**Relevant patterns**: [From Phase 2]
**Reusable components**: [From Phase 2]

## Out of Scope

- [Explicit boundaries]
- [What NOT to change]

---

**Generated by**: Feature Harness /write-spec command
**For implementation**: Run `/feature-harness` to begin autonomous implementation
```

### Step 5.4: Write Spec File

Use Write tool to save the spec:
- Filename: `specs/features/[kebab-case-feature-name].md`
- Report: "Spec written to specs/features/[filename]"

### Step 5.5: Inform User

Output completion message:
```
## Specification Complete

**File created**: specs/features/[filename]

### Inventory Files Updated
- `.harness/codebase-inventory.json` (machine-readable)
- `.harness/codebase-inventory.md` (human-readable)

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

### If a scanner agent fails:
- Report which agent failed
- Continue with results from successful agents
- Note incomplete coverage in inventory

### If an architect agent fails:
- Report which perspective failed
- Continue with results from successful agents
- Note missing perspective in synthesis

### If user is unclear:
- Ask more specific questions
- Provide examples of what you need
- Don't proceed until requirements are clear

---

## Important Notes

- **YOU are the orchestrator** - don't delegate orchestration to agents
- **Launch agents IN PARALLEL** - use multiple Task tool calls in single message
- **Agents execute autonomously** - they return results, no multi-turn conversation
- **Human interaction is YOUR job** - all AskUserQuestion calls happen in this command
- **Update BOTH inventory files** - .json AND .md formats
- **Reference the spec-writing skill** - for consistent spec quality
- **Track progress** - update todos as you complete each phase

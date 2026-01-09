---
description: "Guide user through feature specification generation - orchestrates discovery, parallel codebase scanning, clarifying questions, parallel architecture design, and spec writing"
argument-hint: "[--feature-name <name>]"
---

# Write Feature Specification Command

You are the **orchestrator** for feature specification generation. You guide the user through a **3-SESSION workflow** with persistent artifacts, preventing context compaction issues.

## Three-Session Architecture

```
SESSION 1: Discovery & Exploration
├── Requirements gathering (AskUserQuestion)
├── Playwright browser exploration (conditional - ask user first)
└── OUTPUT: .harness/spec-drafts/{feature}/
    ├── discovery.json (structured data)
    └── discovery.md (narrative description)

SESSION 2: Codebase Analysis & Architecture
├── Codebase scanning (3 parallel agents - MANDATORY if inventory >24h)
├── Clarifying questions (minimum 3)
├── Architecture design (3 parallel architect agents)
└── OUTPUT: .harness/spec-drafts/{feature}/
    ├── architecture.json (structured data)
    └── architecture.md (narrative description)

SESSION 3: Spec Generation
├── Read ALL artifacts from Sessions 1 & 2 (both JSON + MD)
├── Generate final spec with build sequence (4-8 vertical slices)
└── OUTPUT: specs/features/{feature}.md
```

**Key principles**:
- Each session writes persistent artifacts (dual format: JSON + MD)
- Session state tracked in `.harness/spec-session.json`
- YOU handle all human interaction
- Agents execute autonomously and return results
- **Launch agents in parallel** for efficiency

---

## SESSION DETECTION ROUTER

**FIRST**: Check session state and route to the correct workflow.

### Step 0.1: Check Session State

Use Read tool to check for `.harness/spec-session.json`:

**IF file does NOT exist**:
→ Output: "Starting new spec workflow. Session 1 of 3."
→ **Go to SESSION 1 WORKFLOW**

**ELIF `status` == "completed"**:
→ Use AskUserQuestion:
```
Question: "Previous spec completed. Start a new feature specification?"
Header: "New Spec"
Options:
- "Yes, start a new spec" (archive old session, go to SESSION 1)
- "No, I'm done for now" (exit gracefully)
```

**ELIF `sessions.session1.status` != "completed"**:
→ Output: "Resuming Session 1 (Discovery)."
→ **Go to SESSION 1 WORKFLOW**

**ELIF `sessions.session2.status` != "completed"**:
→ Output: "Session 1 complete. Starting Session 2 (Codebase Analysis & Architecture)."
→ **Go to SESSION 2 WORKFLOW**

**ELIF `sessions.session3.status` != "completed"**:
→ Output: "Sessions 1 & 2 complete. Starting Session 3 (Spec Generation)."
→ **Go to SESSION 3 WORKFLOW**

---

## SESSION 1 WORKFLOW: Discovery & Exploration

**Goal**: Understand what feature the user wants to build, optionally explore existing features with Playwright.

### Step 1.1: Initialize Session State

Create `.harness/spec-session.json` (if new) or update it:

```json
{
  "currentSession": 1,
  "status": "in_progress",
  "feature": {
    "id": "",
    "title": "",
    "priority": ""
  },
  "sessions": {
    "session1": {
      "status": "in_progress",
      "startedAt": "[ISO timestamp]",
      "artifacts": {
        "json": "",
        "md": ""
      }
    },
    "session2": {
      "status": "not_started",
      "artifacts": {
        "json": "",
        "md": ""
      }
    },
    "session3": {
      "status": "not_started",
      "artifacts": {
        "spec": ""
      }
    }
  },
  "createdAt": "[ISO timestamp]",
  "lastUpdatedAt": "[ISO timestamp]"
}
```

### Step 1.2: Create Todo List

Use TodoWrite to create a tracking list:
1. Session 1: Discovery & Exploration
2. Session 2: Codebase Analysis & Architecture
3. Session 3: Spec Generation

### Step 1.3: Get Feature Description

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

### Step 1.4: Gather Requirements

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

### Step 1.5: Playwright Exploration Decision

Use AskUserQuestion to determine if Playwright exploration is needed:

```
Question: "Does this feature build on or relate to existing functionality?"
Header: "Existing"
Options:
- "Yes, let me provide URLs to explore" (proceed to Playwright exploration)
- "No, this is a greenfield feature" (skip Playwright)
```

**IF user chooses "Yes"**:
1. Ask for URLs to explore:
   ```
   Question: "What URLs should I explore? (Enter comma-separated URLs)"
   Header: "URLs"
   Options: [Free text]
   ```

2. **Explore directly using Playwright MCP tools** (do NOT use browser-tester subagent):

   For each URL provided:

   a. **Navigate to the URL**:
   ```
   mcp__playwright__browser_navigate: { url: "[URL]" }
   ```

   b. **Take a screenshot** (save to screenshots directory):
   ```
   mcp__playwright__browser_take_screenshot: {
     filename: ".harness/spec-drafts/{feature-slug}/screenshots/[page-name]-initial.png",
     fullPage: true
   }
   ```

   c. **Capture accessibility snapshot** to identify components:
   ```
   mcp__playwright__browser_snapshot: {}
   ```
   Parse the snapshot to identify:
   - Vue components visible (buttons, forms, interactive elements)
   - Navigation links
   - Page structure and layout patterns

   d. **Check network requests** to discover APIs:
   ```
   mcp__playwright__browser_network_requests: {}
   ```
   Document any API endpoints called.

   e. **Interact with key elements** if needed to discover more functionality

3. **Document findings** for the discovery artifact:
   - Screenshots captured
   - Components identified from accessibility tree
   - Routes discovered from navigation links
   - APIs discovered from network requests
   - UI patterns observed

**IF user chooses "No"**:
- Skip Playwright exploration
- Note in artifact: `playwrightFindings.executed: false`

### Step 1.6: Summarize Intent

Output a feature intent summary:
```
## Feature Intent

**Title**: [Feature name]
**Problem**: [What it solves]
**Key Behaviors**: [What the feature should do]
**Constraints**: [Any limitations or requirements, or "None"]
**Priority**: [High/Medium/Low]
```

Generate kebab-case feature ID from title (e.g., "Quick Start Flow Redesign" → "quick-start-flow-redesign").

Ask user to confirm before proceeding:
```
Question: "Does this capture your feature correctly?"
Header: "Confirm"
Options:
- "Yes, save and end Session 1"
- "No, let me clarify"
```

### Step 1.7: Write Discovery Artifacts (DUAL FORMAT)

Create directory and write BOTH files:

```bash
mkdir -p .harness/spec-drafts/{feature-slug}
mkdir -p .harness/spec-drafts/{feature-slug}/screenshots
```

**Write `.harness/spec-drafts/{feature-slug}/discovery.json`**:
```json
{
  "sessionNumber": 1,
  "createdAt": "[ISO timestamp]",
  "featureIntent": {
    "title": "[Feature Title]",
    "problem": "[Problem statement]",
    "keyBehaviors": ["behavior 1", "behavior 2"],
    "constraints": "[Any constraints]",
    "priority": "high|medium|low"
  },
  "userDecisions": {
    "hasExistingFeatures": true|false,
    "existingFeatureUrls": ["http://localhost:3000/page"],
    "playwrightExplorationRequested": true|false
  },
  "playwrightFindings": {
    "executed": true|false,
    "urls": ["http://localhost:3000/page"],
    "screenshots": [
      {"path": "screenshots/initial-state.png", "description": "Page load state"}
    ],
    "componentInventory": ["Component.vue"],
    "routesDiscovered": ["/route"],
    "apisDiscovered": ["/api/endpoint"]
  }
}
```

**Write `.harness/spec-drafts/{feature-slug}/discovery.md`**:
```markdown
# Feature Discovery: {Feature Title}

**Session**: 1 of 3 | **Created**: {date} | **Priority**: {priority}

---

## Problem Statement

{Detailed narrative of the problem this feature solves. Written conversationally.}

## Key Behaviors

{Bullet points with context and reasoning for each behavior:}
- **Behavior 1**: Description and why it matters
- **Behavior 2**: Description and edge cases to consider

## Constraints & Requirements

{Any technical limitations, timeline pressures, or integration requirements.}

---

## User Decisions Captured

| Decision Point | User Response |
|----------------|---------------|
| Existing features to reference? | Yes/No + URLs |
| Playwright exploration? | Yes/No |

---

## Playwright Exploration Findings

**URLs Explored**: {list or "None - greenfield feature"}

### Screenshots Captured
| Screenshot | Description |
|------------|-------------|
| `initial-state.png` | Shows current page load... |

### Existing Components Discovered
- `Component.vue` - Description of what it does, how it might be reused

### Technical Observations
- Routes: What pages exist
- APIs: What endpoints are available
- Patterns: What UI/UX patterns are already established

### Key Insights for Architecture
{Summary of what the architecture session should consider based on discoveries}

---

*Generated by Feature Harness /write-spec Session 1*
```

### Step 1.8: Update Session State

Update `.harness/spec-session.json`:
```json
{
  "currentSession": 2,
  "feature": {
    "id": "{feature-slug}",
    "title": "{Feature Title}",
    "priority": "{priority}"
  },
  "sessions": {
    "session1": {
      "status": "completed",
      "completedAt": "[ISO timestamp]",
      "artifacts": {
        "json": ".harness/spec-drafts/{feature-slug}/discovery.json",
        "md": ".harness/spec-drafts/{feature-slug}/discovery.md"
      }
    },
    "session2": {
      "status": "not_started"
    }
  },
  "lastUpdatedAt": "[ISO timestamp]"
}
```

### Step 1.9: Session 1 Complete

**Mark Session 1 todo complete.**

Output:
```
## Session 1 Complete: Discovery

**Artifacts saved:**
- `.harness/spec-drafts/{feature-slug}/discovery.json`
- `.harness/spec-drafts/{feature-slug}/discovery.md`

**Next**: Run `/write-spec` again to start Session 2 (Codebase Analysis & Architecture).

This session boundary prevents context compaction. Your discovery data is safely persisted.
```

**STOP HERE** - Do not proceed to Session 2 in the same session.

---

## SESSION 2 WORKFLOW: Codebase Analysis & Architecture

**Goal**: Scan codebase, ask clarifying questions, design architecture with 3 parallel agents.

### Step 2.1: Load Discovery Artifacts

Read BOTH discovery files:
- `.harness/spec-drafts/{feature-slug}/discovery.json`
- `.harness/spec-drafts/{feature-slug}/discovery.md`

Parse feature context from these artifacts.

### Step 2.2: Check Codebase Inventory Freshness (MANDATORY)

**CRITICAL**: Check `.harness/codebase-inventory.json` for `lastUpdated` field.

```
IF inventory file does NOT exist:
  → MUST run codebase-scanner agents
  → Output: "No codebase inventory found. Running full scan..."

ELIF lastUpdated > 24 hours ago:
  → MUST run codebase-scanner agents
  → Output: "Codebase inventory stale (last updated: {date}). Running fresh scan..."

ELSE:
  → Output: "Codebase inventory fresh (last updated: {date}). Using cached context."
  → Read existing inventory for context
  → Still run scanners but in "validation" mode (lighter scan)
```

### Step 2.3: Launch 3 Codebase Scanner Agents IN PARALLEL

**CRITICAL**: Launch all 3 agents in a SINGLE message with multiple Task tool calls.

```
Use Task tool (ALL 3 IN PARALLEL in same message):

Agent 1 - Component & UI Patterns:
- description: "Scan UI patterns"
- subagent_type: "feature-harness:codebase-scanner"
- prompt: |
    FOCUS AREA: Component & UI Patterns
    FRESHNESS CHECK: [fresh|stale|new] inventory

    Feature being designed: {from discovery.json}

    Analyze focusing on:
    - Component structure and naming conventions
    - Reusable UI patterns
    - Styling conventions (Tailwind classes)
    - Prop/emit patterns

    [IF EXISTING INVENTORY: Include context, validate against current state]

    Return structured findings for architecture artifact.
- model: sonnet
- run_in_background: true

Agent 2 - State & Data Flow:
- description: "Scan data patterns"
- subagent_type: "feature-harness:codebase-scanner"
- prompt: |
    FOCUS AREA: State & Data Flow
    FRESHNESS CHECK: [fresh|stale|new] inventory

    Feature being designed: {from discovery.json}

    Analyze focusing on:
    - Pinia stores structure and patterns
    - Composables and their usage
    - API integration patterns
    - Data fetching strategies

    Return structured findings for architecture artifact.
- model: sonnet
- run_in_background: true

Agent 3 - Architecture & Dependencies:
- description: "Scan architecture"
- subagent_type: "feature-harness:codebase-scanner"
- prompt: |
    FOCUS AREA: Architecture & Dependencies
    FRESHNESS CHECK: [fresh|stale|new] inventory

    Feature being designed: {from discovery.json}

    Analyze focusing on:
    - Project structure and module organization
    - Nuxt configuration and layers
    - Dependencies and their usage
    - CLAUDE.md conventions

    Return structured findings for architecture artifact.
- model: sonnet
- run_in_background: true
```

### Step 2.4: Collect and Merge Scanner Results (MANDATORY)

**⚠️ CRITICAL**: You MUST update the codebase inventory files after collecting scanner results.

Use TaskOutput to collect results from all 3 agents.

**Reference the `codebase-inventory` skill** for file formats and schemas.

**MANDATORY ACTIONS**:

1. **Merge scanner outputs** - Combine findings from all 3 agents:
   - UI Patterns agent → componentCount, protoComponents, cssTokens, reusableComponents
   - State & Data Flow agent → storeCount, composableCount, stores, composables
   - Architecture agent → architecture, patterns, packages, gridSystem

2. **Update `.harness/codebase-inventory.json`** following the schema in `codebase-inventory` skill:
   ```json
   {
     "lastUpdated": "[current ISO timestamp]",
     "componentCount": [merged count],
     "pageCount": [count],
     "apiRouteCount": [count],
     "storeCount": [count],
     "composableCount": [count],
     "architecture": { ... },
     "patterns": { ... },
     "reusableComponents": [ ... ],
     "previousScan": { "date": "[previous date]", "componentCount": [old count] },
     "changesSincePrevious": { "componentsDelta": "+N (old → new)" }
   }
   ```

3. **Update `.harness/codebase-inventory.md`** following the schema in `codebase-inventory` skill:
   - Header with `**Last Updated**: [ISO timestamp]`
   - Summary (2-3 sentences)
   - File Counts table
   - Architecture section
   - Key Patterns section (with code examples)
   - Reusable Components table
   - Composables table
   - Changes Since Previous Scan table

4. **Verify both files exist and are updated** before proceeding to step 2.5.

**Output after update**:
```
Codebase inventory updated:
- `.harness/codebase-inventory.json` (updated: [timestamp])
- `.harness/codebase-inventory.md` (updated: [timestamp])

Changes: +[N] components, +[N] composables, +[N] stores
```

### Step 2.5: Ask Clarifying Questions (MINIMUM 3 REQUIRED)

**⚠️ MANDATORY**: You MUST ask at least 3 clarifying questions before architecture design.

Based on feature intent and codebase context, identify 3-5 key decisions:

- **UI/UX**: Where should this feature live? Modal, page, sidebar?
- **Data**: How should data be stored? Server-side, client-side?
- **Integration**: Which existing components to reuse?
- **Error handling**: How should errors be displayed?
- **Authentication**: Does this require login?

Use AskUserQuestion for each. Record all answers.

### Step 2.6: Launch 3 Spec Architect Agents IN PARALLEL

**CRITICAL**: Launch all 3 agents in a SINGLE message.

```
Use Task tool (ALL 3 IN PARALLEL):

Agent 1 - Minimal Changes Approach:
- description: "Design minimal architecture"
- subagent_type: "feature-harness:spec-architect"
- prompt: |
    PERSPECTIVE: Minimal Changes

    ## Discovery Artifact (from Session 1)
    [Include full content from discovery.json + key points from discovery.md]

    ## Codebase Context
    [Merged scanner findings]

    ## Clarified Decisions
    [User answers from Step 2.5]

    Design architecture with LEAST modification to existing code.
    Reference `testable-increment-patterns` skill for chunking.
    Target 4-8 vertical slices, NOT 14+ file-level steps.
- model: sonnet
- run_in_background: true

Agent 2 - Clean Architecture Approach:
- description: "Design clean architecture"
- subagent_type: "feature-harness:spec-architect"
- prompt: |
    PERSPECTIVE: Clean Architecture

    ## Discovery Artifact (from Session 1)
    [Include full content from discovery.json + key points from discovery.md]

    ## Codebase Context
    [Merged scanner findings]

    ## Clarified Decisions
    [User answers from Step 2.5]

    Design the IDEAL implementation as if starting fresh.
    Reference `testable-increment-patterns` skill for chunking.
    Target 4-8 vertical slices, NOT 14+ file-level steps.
- model: sonnet
- run_in_background: true

Agent 3 - Validation Perspective:
- description: "Validate architecture"
- subagent_type: "feature-harness:spec-architect"
- prompt: |
    PERSPECTIVE: Validation

    ## Discovery Artifact (from Session 1)
    [Include full content from discovery.json + key points from discovery.md]

    ## Codebase Context
    [Merged scanner findings]

    ## Clarified Decisions
    [User answers from Step 2.5]

    Validate proposed paths, naming, types, CSS compliance.
    Check that build sequence has 4-8 testable increments.
- model: sonnet
- run_in_background: true
```

### Step 2.7: Synthesize Architecture

Collect results from all 3 architects. Present synthesized design:

```
## Architecture Design (Synthesized from 3 perspectives)

### Recommended Approach: [Minimal Changes | Clean Architecture]

**Reasoning**: [Why this approach was chosen]

### Component Inventory
| Component | Action | Path | Purpose |
|-----------|--------|------|---------|

### Build Sequence (4-8 Testable Increments)
1. [Step 1 with Playwright test]
2. [Step 2 with Playwright test]
...

### Validation Results
[Findings from validation agent]
```

Confirm with user:
```
Question: "Does this architecture look good?"
Header: "Architecture"
Options:
- "Yes, save and end Session 2"
- "No, I want to adjust something"
```

### Step 2.8: Write Architecture Artifacts (DUAL FORMAT)

**Write `.harness/spec-drafts/{feature-slug}/architecture.json`**:
```json
{
  "sessionNumber": 2,
  "createdAt": "[ISO timestamp]",
  "codebaseContext": {
    "scannedAt": "[ISO timestamp]",
    "inventoryFreshness": "fresh|stale|new",
    "scannerOutputs": {
      "uiPatterns": {},
      "dataFlow": {},
      "architecture": {}
    }
  },
  "clarifyingQuestions": [
    {"question": "...", "answer": "..."}
  ],
  "architectDesigns": {
    "minimalChanges": {},
    "cleanArchitecture": {},
    "validation": {}
  },
  "recommendedApproach": "minimal-changes|clean-architecture",
  "reasoning": "...",
  "componentInventory": [],
  "buildSequence": []
}
```

**Write `.harness/spec-drafts/{feature-slug}/architecture.md`**:
```markdown
# Architecture Design: {Feature Title}

**Session**: 2 of 3 | **Created**: {date}

---

## Codebase Context

**Inventory Status**: {fresh/stale} - scanned at {date}

### UI Patterns Discovered
{Narrative description}

### State & Data Flow
{Description of Pinia usage, API patterns}

### Architecture Overview
{Framework versions, layer structure}

---

## Clarifying Questions & Answers

| # | Question | User Answer | Implication |
|---|----------|-------------|-------------|

---

## Architecture Perspectives

### Minimal Changes Approach
{Summary and component inventory}

### Clean Architecture Approach
{Summary and component inventory}

### Validation Findings
{Path accuracy, naming conflicts, etc.}

---

## Recommended Approach: {Minimal Changes | Clean Architecture}

**Reasoning**: {Why this approach}

### Final Component Inventory
| Component | Action | Path | Purpose |
|-----------|--------|------|---------|

### Final Build Sequence (Vertical Slices)
| # | User Capability | Files | Playwright Test |
|---|-----------------|-------|-----------------|

---

*Generated by Feature Harness /write-spec Session 2*
```

### Step 2.9: Update Session State

Update `.harness/spec-session.json`:
```json
{
  "currentSession": 3,
  "sessions": {
    "session1": { "status": "completed" },
    "session2": {
      "status": "completed",
      "completedAt": "[ISO timestamp]",
      "artifacts": {
        "json": ".harness/spec-drafts/{feature-slug}/architecture.json",
        "md": ".harness/spec-drafts/{feature-slug}/architecture.md"
      }
    },
    "session3": { "status": "not_started" }
  },
  "lastUpdatedAt": "[ISO timestamp]"
}
```

### Step 2.10: Session 2 Complete

**Mark Session 2 todo complete.**

Output:
```
## Session 2 Complete: Architecture

**Artifacts saved:**
- `.harness/spec-drafts/{feature-slug}/architecture.json`
- `.harness/spec-drafts/{feature-slug}/architecture.md`

**Codebase inventory updated:**
- `.harness/codebase-inventory.json` (updated: {timestamp})
- `.harness/codebase-inventory.md` (updated: {timestamp})
- Changes: +{N} components, +{N} composables, +{N} stores

**Next**: Run `/write-spec` again to start Session 3 (Spec Generation).

This session boundary prevents context compaction. Your architecture data is safely persisted.
```

**STOP HERE** - Do not proceed to Session 3 in the same session.

---

## SESSION 3 WORKFLOW: Spec Generation

**Goal**: Read all artifacts and generate the final feature specification.

### Step 3.1: Load ALL Artifacts

Read all 4 artifact files:
- `.harness/spec-drafts/{feature-slug}/discovery.json`
- `.harness/spec-drafts/{feature-slug}/discovery.md`
- `.harness/spec-drafts/{feature-slug}/architecture.json`
- `.harness/spec-drafts/{feature-slug}/architecture.md`

Parse and combine all context.

### Step 3.2: Load Spec Writing Skills

**Reference these skills** for consistent spec formatting:

1. **`spec-writing-best-practices`** - Spec structure and formatting
2. **`testable-increment-patterns`** - Vertical slice chunking

### Step 3.3: Create Directory

```bash
mkdir -p specs/features
```

### Step 3.4: Generate Spec Content

Combine all gathered information following the spec-writing-best-practices skill guidance:

```markdown
# Feature: [Feature Name]

**Status**: Not Started
**Priority**: [High/Medium/Low]
**Created**: [ISO timestamp]
**Estimated Complexity**: [Simple/Moderate/Complex]

---

## Overview

[Brief description - 2-3 sentences from discovery.md]

## Problem Statement

[From discovery.json/md]

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
| [From architecture.json] |

### Components to Create

[From architecture artifacts]

### Components to Modify

[From architecture artifacts]

### API Endpoints (if applicable)

[From architecture artifacts]

### State Management (if applicable)

[From architecture artifacts]

## Build Sequence

**Reference**: `testable-increment-patterns` skill for vertical slice guidance.
**Target**: 4-8 testable increments.

<!-- Ticket 1: [Ticket Title] -->
### 1. [User Capability Title] - [What user can DO]

**Files:**
| File | Action | Purpose |
|------|--------|---------|

**Playwright Test:**
```
browser_navigate('/path')
browser_snapshot() -> verify [expectation]
```

**Acceptance:** [Testable criterion]

[Continue for 4-8 testable increments]

## Test Cases

### Test Case 1: [Happy Path Scenario]
**Given**: [Initial state]
**When**: [User action]
**Then**:
- [Expected outcome 1]
- [Expected outcome 2]

[5-10 scenarios including edge cases]

## Codebase Context

**Relevant patterns**: [From Session 2]
**Reusable components**: [From Session 2]

## Out of Scope

- [Explicit boundaries]
- [What NOT to change]

---

**Generated by**: Feature Harness /write-spec command (3 sessions)
**Source artifacts**:
- `.harness/spec-drafts/{feature-slug}/discovery.json`
- `.harness/spec-drafts/{feature-slug}/discovery.md`
- `.harness/spec-drafts/{feature-slug}/architecture.json`
- `.harness/spec-drafts/{feature-slug}/architecture.md`
**For implementation**: Run `/feature-harness` to begin autonomous implementation
```

### Step 3.5: Write Spec File

Use Write tool to save the spec:
- Filename: `specs/features/{feature-slug}.md`

### Step 3.6: Update Session State

Update `.harness/spec-session.json`:
```json
{
  "currentSession": 3,
  "status": "completed",
  "sessions": {
    "session1": { "status": "completed" },
    "session2": { "status": "completed" },
    "session3": {
      "status": "completed",
      "completedAt": "[ISO timestamp]",
      "artifacts": {
        "spec": "specs/features/{feature-slug}.md"
      }
    }
  },
  "lastUpdatedAt": "[ISO timestamp]"
}
```

### Step 3.7: Session 3 Complete - Workflow Done

**Mark all todos complete.**

Output:
```
## Specification Complete

**Spec created**: `specs/features/{feature-slug}.md`

### All Artifacts Preserved
- `.harness/spec-drafts/{feature-slug}/discovery.json`
- `.harness/spec-drafts/{feature-slug}/discovery.md`
- `.harness/spec-drafts/{feature-slug}/architecture.json`
- `.harness/spec-drafts/{feature-slug}/architecture.md`
- `.harness/spec-session.json` (session state)

### Codebase Inventory Updated
- `.harness/codebase-inventory.json`
- `.harness/codebase-inventory.md`

### Next Steps

1. Review the spec and make any adjustments
2. Run `/write-spec` for additional features (will ask "Start new spec?")
3. When ready to implement: Run `/feature-harness`

The Feature Harness workflow:
- `/write-spec` - Design features (this command)
- `/feature-harness` - Initialize and implement features
- `/feature-status` - Check progress
```

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

### If artifacts are missing/corrupted:
- Report which artifacts are affected
- Offer to restart from that session
- Don't proceed with incomplete data

---

## Important Notes

- **3 SESSIONS, NOT 1** - Each session ends with artifacts and a stop
- **STOP at session boundaries** - Do not continue to next session automatically
- **Dual format artifacts** - Always write BOTH .json AND .md files
- **Session state tracking** - Always update `.harness/spec-session.json`
- **Launch agents IN PARALLEL** - Use multiple Task tool calls in single message
- **Mandatory inventory check** - Session 2 MUST check >24h freshness
- **Minimum 3 clarifying questions** - Do not skip this in Session 2
- **Reference skills** - Use spec-writing and testable-increment-patterns skills
- **Track progress** - Update todos as you complete each phase

---
name: linear-ticket-implementation
description: |
  This skill should be used when "implementing a Linear ticket", "starting coding workflow", "reading a ticket before implementation", or during Feature Harness Code Step 7. Provides workflow for reading tickets, understanding spec context, and single-ticket-per-session implementation.
---

# Linear Ticket Implementation

This skill defines how to **implement a Linear ticket** within the Feature Harness workflow. The goal is thorough understanding before coding, with a single-ticket-per-session approach for quality.

## Core Principles

1. **Read Before Code** - Fully understand ticket and spec before writing any code
2. **Single Ticket Focus** - One ticket per session, done well
3. **Clarify First** - Ask questions before starting, not during
4. **Follow the Spec** - The ticket references the spec; the spec is the source of truth

---

## Pre-Implementation Workflow

### Step 1: Read the Full Ticket

Use Linear MCP to get complete ticket details:

```
mcp__linear-server__get_issue with {
  id: "[issue-id]"
}
```

Extract and note:
- **Title**: What capability this delivers
- **Spec Reference**: The `specs/features/file.md:lines (Section)` reference
- **Files List**: All files to create/modify
- **Playwright Test**: What to verify after implementation
- **Acceptance Criteria**: Specific requirements to meet

### Step 2: Read the Referenced Spec Section

The ticket's spec reference tells you exactly where to look:

```
Spec Reference: specs/features/phase-3.md:45-78 (Build Sequence, Step 2)
```

**Actions:**
1. Read the full spec file for overall context
2. Focus on the specific line range referenced
3. Understand how this ticket fits in the overall workflow
4. Note any dependencies mentioned in the spec

```
Read: specs/features/phase-3.md
```

Pay attention to:
- What comes BEFORE this step (dependencies)
- What comes AFTER this step (what you're enabling)
- Specific implementation details in the spec
- Any code examples or patterns mentioned

### Step 3: Understand Context

Before coding, you should be able to answer:

1. **What does this ticket deliver?** (user-facing capability)
2. **Where does it fit?** (which feature, which phase)
3. **What exists already?** (components to reuse, APIs to call)
4. **What patterns to follow?** (from codebase-inventory, CLAUDE.md)
5. **How will I verify it?** (Playwright test from ticket)

### Step 4: Ask Clarifying Questions (If Needed)

If the ticket is unclear or has loose ends, ask BEFORE coding:

```
AskUserQuestion: {
  questions: [{
    question: "[Specific clarification needed]",
    header: "Clarify",
    multiSelect: false,
    options: [
      { label: "Option A", description: "[What this means]" },
      { label: "Option B", description: "[What this means]" }
    ]
  }]
}
```

**Good clarification questions:**
- "The ticket mentions 'follow existing patterns' - should I use CardA or CardB as the reference?"
- "The spec shows two approaches for state management - which do you prefer?"
- "This ticket depends on API X which isn't implemented yet - should I use mock data?"

**Don't ask:**
- Vague questions ("Is this okay?")
- Questions answered in the spec
- Implementation details you should decide

### Step 5: Check for Blockers

Before proceeding, verify:

- [ ] Regression tests from previous tickets still pass
- [ ] Dependencies from this ticket are complete
- [ ] No conflicting work in progress
- [ ] Dev server is running and accessible

If blockers exist, document and report them before attempting implementation.

---

## Implementation Approach

### Single-Ticket-Per-Session Philosophy

**Why one ticket at a time?**
- Reduces context switching
- Ensures thorough testing
- Makes commits atomic and reviewable
- Easier to debug if something breaks

**What this means:**
- Implement all files in the ticket's file list
- Run the Playwright test specified
- Commit with proper attribution
- Update Linear status
- Then stop (or continue to next ticket in new "session")

### Following the Files List

The ticket specifies exactly which files to touch:

```markdown
## Files
| File | Action | Purpose |
|------|--------|---------|
| types/Block.type.ts | Create | Block type definitions |
| stores/useBlockStore.ts | Create | Block state management |
| components/proto/BlockCard.vue | Create | Card component |
| pages/block-proto.vue | Modify | Display cards in grid |
```

**Rules:**
1. Create/modify ONLY the files listed
2. Follow the stated purpose
3. If you need a file not listed, that's a signal the ticket is incomplete
4. Keep changes focused - don't refactor adjacent code

### Using Codebase Context

Reference the codebase-inventory for:
- Similar components to follow
- Naming conventions
- API patterns
- State management approaches

```
Read: .harness/codebase-inventory.md
```

### Quality Standards

Before considering implementation complete:

1. **TypeScript** - No type errors (`pnpm type-check`)
2. **Linting** - No lint errors (`pnpm lint:fix`)
3. **Patterns** - Follows existing codebase conventions
4. **Acceptance** - All criteria from ticket met
5. **Browser** - Playwright test passes

---

## Post-Implementation Checklist

After implementation, verify:

- [ ] All files from ticket's file list created/modified
- [ ] TypeScript compiles without errors
- [ ] Lint passes
- [ ] Playwright test from ticket description passes
- [ ] All acceptance criteria met
- [ ] No unintended side effects on existing features

---

## Handling Issues

### If Ticket is Incomplete

The ticket may be missing information. Signs:
- Files list doesn't include an obviously needed file
- Spec reference points to non-existent section
- Acceptance criteria are vague

**Action:** Ask clarifying question or report back to orchestrator.

### If Blocked by Dependencies

A ticket may depend on work not yet complete.

**Action:**
1. Document the blocker
2. Check if dependency ticket exists
3. Report to orchestrator for prioritization

### If Implementation Differs from Spec

Sometimes the spec's approach doesn't work in practice.

**Action:**
1. Document why the spec approach doesn't work
2. Propose alternative
3. If significant deviation, ask for confirmation
4. Update spec if approved (or note discrepancy)

### If Tests Fail

After implementation, if tests fail:

1. Check if it's your change or pre-existing
2. Fix if caused by your implementation
3. If pre-existing, document and continue (don't get blocked)

---

## Example Implementation Session

```markdown
## Ticket: SPR-123 - Block Card Grid Display

### 1. Read Ticket
- Title: Block Card Grid Display
- Spec: specs/features/phase-3.md:45-89 (Build Sequence, Step 1-2)
- Files: 4 files (types, store, component, page)
- Test: Navigate to /block-proto, verify grid with 3+ cards

### 2. Read Spec
- Overall feature: Block prototype canvas
- This step: First visual implementation
- Context: Foundation for overlay system (next ticket)
- Patterns: Follow StatCard.vue structure

### 3. Context Check
✓ What: User sees block cards in grid
✓ Where: Phase 3, Step 1-2 of block-proto feature
✓ Existing: StatCard.vue for reference, Tailwind grid patterns
✓ Patterns: Vue 3 composition API, Pinia stores
✓ Verify: Playwright test in ticket

### 4. No Clarifications Needed
Ticket is clear, spec is detailed, no blockers.

### 5. Implement
- Created types/Block.type.ts
- Created stores/useBlockStore.ts with mock data
- Created components/proto/BlockCard.vue
- Modified pages/block-proto.vue to import and display

### 6. Verify
✓ pnpm type-check - passed
✓ pnpm lint:fix - passed
✓ Playwright test - passed (3 cards visible, hover works)
✓ All acceptance criteria met

### 7. Complete
Ready for commit and Linear status update.
```

---

## References

See [implementation-checklist.md](references/implementation-checklist.md) for a printable checklist.

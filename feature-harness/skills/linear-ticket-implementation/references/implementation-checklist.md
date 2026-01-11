# Implementation Checklist

Use this checklist before, during, and after implementing a Linear ticket.

---

## Pre-Implementation

### Ticket Understanding
- [ ] Read full ticket via `mcp__linear-server__get_issue`
- [ ] Noted the spec reference (file:lines + section name)
- [ ] Listed all files to create/modify
- [ ] Understood the Playwright test to run
- [ ] Reviewed all acceptance criteria

### Spec Context
- [ ] Read the referenced spec section
- [ ] Understand what comes before this ticket
- [ ] Understand what this ticket enables
- [ ] Noted any specific patterns/approaches mentioned

### Codebase Context
- [ ] Reviewed codebase-inventory.md for similar components
- [ ] Read CLAUDE.md for project conventions
- [ ] Identified patterns to follow

### Blockers Check
- [ ] Regression tests passing
- [ ] Dependencies complete
- [ ] Dev server running
- [ ] No conflicting work

### Clarifications
- [ ] All ambiguities resolved
- [ ] Questions asked BEFORE starting (not during)

---

## During Implementation

### File-by-File
For each file in the ticket's file list:

- [ ] File 1: `___________________`
  - [ ] Created/modified as specified
  - [ ] Follows existing patterns
  - [ ] TypeScript types complete

- [ ] File 2: `___________________`
  - [ ] Created/modified as specified
  - [ ] Follows existing patterns
  - [ ] TypeScript types complete

- [ ] File 3: `___________________`
  - [ ] Created/modified as specified
  - [ ] Follows existing patterns
  - [ ] TypeScript types complete

- [ ] File 4: `___________________`
  - [ ] Created/modified as specified
  - [ ] Follows existing patterns
  - [ ] TypeScript types complete

### Quality Gates
- [ ] Only touched files listed in ticket
- [ ] No unrelated refactoring
- [ ] Consistent with codebase style

---

## Post-Implementation

### Automated Checks
- [ ] `pnpm type-check` passes
- [ ] `pnpm lint:fix` passes
- [ ] No console errors in browser

### Browser Verification
- [ ] Playwright test from ticket executed
- [ ] All assertions pass
- [ ] Screenshot captured for evidence

### Acceptance Criteria
- [ ] Criterion 1: `___________________` ✓
- [ ] Criterion 2: `___________________` ✓
- [ ] Criterion 3: `___________________` ✓
- [ ] Criterion 4: `___________________` ✓

### Final Verification
- [ ] Feature works as described in ticket
- [ ] No regression in existing features
- [ ] Ready for commit

---

## Quick Reference

### Linear MCP Commands

```
# Get full ticket details
mcp__linear-server__get_issue with { id: "SPR-123" }

# Update status to In Progress
mcp__linear-server__update_issue with { id: "[id]", state: "In Progress" }

# Update status to Done
mcp__linear-server__update_issue with { id: "[id]", state: "Done" }

# Add implementation comment
mcp__linear-server__create_comment with {
  issueId: "[id]",
  body: "## Implementation Complete\n\n..."
}
```

### Playwright MCP Commands

```
# Navigate to page
mcp__playwright__browser_navigate with { url: "/path" }

# Get page structure
mcp__playwright__browser_snapshot

# Click element
mcp__playwright__browser_click with { element: "description", ref: "ref" }

# Take screenshot
mcp__playwright__browser_take_screenshot with { filename: "evidence.png" }

# Check console errors
mcp__playwright__browser_console_messages with { level: "error" }
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Ticket missing file | Ask clarifying question |
| Spec reference invalid | Check line numbers, ask if unclear |
| Dependency not ready | Report blocker, don't proceed |
| Test fails | Fix if your change, document if pre-existing |
| Pattern unclear | Reference codebase-inventory, similar components |

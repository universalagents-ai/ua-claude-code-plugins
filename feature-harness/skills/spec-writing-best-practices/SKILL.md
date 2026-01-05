---
name: spec-writing-best-practices
description: |
  This skill should be used when the user asks to "write a feature spec", "create a specification", "generate a spec file", "update the spec", "format the spec", or when the write-spec command is generating specification documents. Provides guidance on structuring feature specifications for optimal implementation.
---

# Feature Specification Best Practices

This skill provides guidance for writing high-quality feature specifications that lead to successful autonomous implementation.

## Spec Structure

Follow this structure for all feature specifications:

### Required Sections

1. **Metadata Header** - Status, priority, created date, complexity
2. **Overview** - 2-3 sentence summary
3. **Problem Statement** - What problem this solves
4. **Goals** - 3-5 clear goals
5. **Success Criteria** - Testable checkboxes
6. **Technical Design** - Architecture details
7. **Build Sequence** - Step-by-step implementation order
8. **Test Cases** - Given/When/Then scenarios
9. **Codebase Context** - Relevant patterns and reusable components

### Metadata Format

```markdown
# Feature: [Feature Name]

**Status**: Not Started | In Progress | Complete
**Priority**: High | Medium | Low
**Created**: [ISO timestamp]
**Estimated Complexity**: Simple | Moderate | Complex
```

## Writing Quality Specs

### Be Decisive, Not Optional

Specs must make clear architectural decisions. Avoid phrases like:
- "Could use either X or Y" (instead: "Use X")
- "Might need" (instead: "Requires")
- "Consider" (instead: "Implement")

### Specify Exact Paths

Always include complete file paths:

```markdown
**Good:**
- Create: apps/web/components/blocks/ProtoBlockCard.vue
- Modify: apps/web/pages/block-proto.vue:42-60

**Bad:**
- Create a new component for block cards
- Update the proto page
```

### Use Tables for Component Inventory

Document components systematically:

| Component | Action | Path | Purpose |
|-----------|--------|------|---------|
| ProtoBlockCard | Create | apps/web/components/blocks/ProtoBlockCard.vue | Card display |
| ProtoEllipsisMenu | Create | apps/web/components/blocks/ProtoEllipsisMenu.vue | Hover menu |
| MainContent | Modify | apps/web/components/proto/MainContent.vue | Add grid layout |

### Build Sequence Rules

Each step must be:
1. **Atomic** - Completable in isolation
2. **Testable** - Has clear success criteria
3. **Ordered** - Dependencies come first
4. **Sized** - Roughly equal effort per step

```markdown
**Good Build Sequence:**
1. Create ProtoBlockCard.vue component with props interface
2. Add hover state and ellipsis menu trigger
3. Create ProtoEllipsisMenu.vue with menu items
4. Integrate card into MainContent grid
5. Add Playwright tests for card interactions

**Bad Build Sequence:**
1. Build the whole UI (too vague, not atomic)
2. Add tests (too late, not specific)
```

### Document What NOT to Change

Explicitly state boundaries:

```markdown
## Out of Scope

- Do NOT modify authentication flows
- Do NOT change the database schema
- Preserve existing API contracts in /api/chat
```

### Test Cases Format

Use Given/When/Then structure:

```markdown
### Test Case 1: Block Card Selection
**Given**: User is on block-proto page with 3 block cards
**When**: User clicks on middle card
**Then**:
- Card shows selected state (border highlight)
- Other cards show deselected state
- Canvas updates to show selected block
```

## Technical Design Sections

### Components Section

For each component include:
- **Path**: Exact file location
- **Purpose**: What it does (one sentence)
- **Props**: TypeScript interface
- **Emits**: Event definitions
- **Key Logic**: Implementation notes

### API Endpoints Section

For each endpoint include:
- **Route**: Method + path (e.g., `POST /api/blocks`)
- **Request**: TypeScript interface
- **Response**: TypeScript interface
- **Errors**: Status codes and meanings

### State Management Section

If using Pinia stores:
- **Store Path**: Location of store file
- **State Shape**: TypeScript interface
- **Actions**: List with descriptions
- **Getters**: Computed properties

## Validation Checklist

Before finalizing a spec, verify:

- [ ] All file paths are absolute and complete
- [ ] Component inventory uses table format
- [ ] Build sequence has 8-16 atomic steps
- [ ] Test cases cover happy path + 2-3 edge cases
- [ ] Success criteria are checkbox format
- [ ] Out of scope section exists
- [ ] No ambiguous language ("maybe", "could", "consider")

## Common Spec Anti-Patterns

### Anti-Pattern 1: Vague Components

```markdown
❌ Bad: "Add some UI components for the feature"
✅ Good: "Create ProtoBlockCard.vue at apps/web/components/blocks/"
```

### Anti-Pattern 2: Missing Dependencies

```markdown
❌ Bad: Build sequence doesn't show component dependencies
✅ Good: "Step 1: Create base Card, Step 2: Create Menu (depends on Card)"
```

### Anti-Pattern 3: Untestable Criteria

```markdown
❌ Bad: "Feature should feel fast"
✅ Good: "Page load under 500ms on 3G network"
```

### Anti-Pattern 4: Scope Creep

```markdown
❌ Bad: Spec includes "nice to have" features mixed with requirements
✅ Good: Clear separation of MVP vs future enhancements
```

## Additional Resources

For detailed patterns and examples, consult:
- **`references/spec-template.md`** - Complete spec template to copy

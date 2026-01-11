---
name: linear-ticket-creation
description: |
  This skill should be used when "creating Linear tickets from specs", "chunking features into build steps", "designing build sequences", "planning feature implementation", or when generating feature specs for the Feature Harness workflow. Provides comprehensive ticket templates with spec references and vertical-slice patterns.
---

# Linear Ticket Creation

This skill defines how to create **high-quality Linear tickets** from feature specifications. Each ticket must include spec references, implementation details, and be independently verifiable via Playwright.

## Core Principles

1. **Spec-Linked Tickets** - Every ticket references exact spec locations
2. **Vertical Slices** - Each ticket delivers testable user capability
3. **Complete Details** - File lists, acceptance criteria, Playwright tests
4. **Proper Granularity** - 3-6 hours of work per ticket

---

## Linear Ticket Structure

Every ticket created from a spec MUST follow this structure:

```markdown
## Spec Reference
`specs/features/[file].md:[start-line]-[end-line] ([Section Name])`

## What User Can Do After This
[1-2 sentences describing the user-facing capability delivered]

## Files
| File | Action | Purpose |
|------|--------|---------|
| [path/to/file.ts] | Create | [Brief purpose] |
| [path/to/file.vue] | Modify | [What changes] |

## Implementation Approach
[2-3 sentences on how to implement, patterns to follow]

## Playwright Test
```
browser_navigate('/path')
browser_snapshot() -> verify [specific expectation]
browser_click('[element]')
browser_snapshot() -> verify [state change]
```

## Acceptance Criteria
- [ ] [Specific, testable criterion 1]
- [ ] [Specific, testable criterion 2]
- [ ] Browser verification passes
```

---

## Spec Reference Format

**CRITICAL**: Every ticket MUST include a spec reference in this exact format:

```
specs/features/[filename].md:[start]-[end] ([Section Name])
```

### Examples

Good references:
- `specs/features/phase-3.md:45-78 (Build Sequence, Step 2)`
- `specs/features/block-canvas.md:120-156 (Component Architecture)`
- `specs/features/chat-integration.md:89-102 (API Endpoints)`

Bad references (avoid):
- `See the spec` (too vague)
- `specs/features/phase-3.md` (no line numbers)
- `Line 45` (no file, no section name)

### How to Create Spec References

1. Read the spec file to understand the full feature
2. Identify the specific section relevant to this ticket
3. Note the line numbers (use your editor or `grep -n`)
4. Include the section name for human readability

---

## Vertical Slice Patterns

### Why Vertical Slices?

Layer-based work (types → store → components → page) creates untestable intermediate states. Vertical slices deliver testable capability at each step.

### Layer-Based (AVOID)

```
Step 1: Create TypeScript types         -> Can't test visually
Step 2: Create Pinia store              -> Can't test visually
Step 3: Create Component A              -> Can't test visually
Step 4: Wire together                   -> Can't test visually
Step 5: Add page                        -> FINALLY testable!
```

**Result**: 5 tickets before anything is testable.

### Vertical Slice (USE THIS)

```
Step 1: Block Card Grid          -> TEST: Cards appear on canvas
Step 2: Block Overlay System     -> TEST: Click card, see overlay
Step 3: State Integration        -> TEST: Selection persists
```

**Result**: Each ticket produces something testable in the browser.

---

## Ticket Granularity

### Target: 4-7 Tickets Per Feature

Each ticket should represent **3-6 hours of focused work** with a browser-verifiable outcome.

### Grouping Rules

1. **Each ticket = 1 testable milestone** (not 1 file)
2. **Include all layers** for that capability (types + store + component)
3. **Browser-verifiable outcome** REQUIRED in acceptance criteria
4. **Include Playwright test** in ticket description

### Spec Annotations for Ticket Grouping

Use HTML comments in spec files to pre-define ticket boundaries:

```markdown
## Build Sequence

<!-- Ticket 1: Block Card Grid -->
### Step 1: Create BlockCard Component
...

### Step 2: Add Grid Layout to Canvas
...

<!-- Ticket 2: Block Overlay System -->
### Step 3: Create BlockOverlay Modal
...
```

If annotations exist, respect them. If not, group by testable capability.

---

## Grouping Patterns

### Pattern 1: Component Bundle

Group all files needed for a single UI capability:

```markdown
## Spec Reference
`specs/features/canvas.md:45-89 (BlockCard Component)`

## What User Can Do After This
User sees block cards displayed in a grid on the canvas page.

## Files
| File | Action | Purpose |
|------|--------|---------|
| types/block.types.ts | Create | Block type definitions |
| stores/useBlockStore.ts | Create | Block state management |
| components/blocks/BlockCard.vue | Create | Card component |
| pages/canvas.vue | Modify | Import and display cards |

## Playwright Test
```
browser_navigate('/canvas')
browser_snapshot() -> verify BlockCard elements present
```
```

### Pattern 2: Feature Vertical

Group by complete user journey:

```markdown
## Spec Reference
`specs/features/overlay.md:20-67 (Overlay Interaction)`

## What User Can Do After This
User clicks a block card and sees a detailed overlay modal.

## Files
| File | Action | Purpose |
|------|--------|---------|
| components/blocks/BlockOverlay.vue | Create | Overlay modal |
| components/blocks/BlockCard.vue | Modify | Add click handler |
| stores/useBlockStore.ts | Modify | Add overlay state |

## Playwright Test
```
browser_navigate('/canvas')
browser_click('[data-testid="block-card-1"]')
browser_snapshot() -> verify overlay modal visible
```
```

### Pattern 3: Integration Layer

When connecting multiple existing components:

```markdown
## Spec Reference
`specs/features/chat.md:100-134 (Canvas Integration)`

## What User Can Do After This
User can open chat panel from the canvas without losing context.

## Files
| File | Action | Purpose |
|------|--------|---------|
| components/ChatButton.vue | Create | Floating chat trigger |
| components/ChatPanel.vue | Modify | Add canvas context |
| pages/canvas.vue | Modify | Add chat button slot |

## Playwright Test
```
browser_navigate('/canvas')
browser_click('[data-testid="chat-button"]')
browser_snapshot() -> verify chat panel open
```
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Types-Only Ticket

```markdown
# BAD
Title: Create all TypeScript types
Files: types/*.ts
```

Types should be bundled with the component that uses them.

### Anti-Pattern 2: Store-Only Ticket

```markdown
# BAD
Title: Create Pinia store
Files: stores/useFeatureStore.ts
```

Store and components should be in the same ticket if tightly coupled.

### Anti-Pattern 3: No Spec Reference

```markdown
# BAD
## What User Can Do
User sees the feature working.

## Files
...
```

Every ticket MUST have a spec reference with line numbers.

### Anti-Pattern 4: Vague Acceptance Criteria

```markdown
# BAD
## Acceptance Criteria
- [ ] Feature works correctly
- [ ] Code is clean
```

Criteria must be specific and testable.

---

## Ticket Quality Checklist

Before creating each ticket, verify:

- [ ] **Spec reference** includes file:lines AND section name
- [ ] **User capability** clearly states what user can DO
- [ ] **Files table** lists ALL files with Action (Create/Modify)
- [ ] **Playwright test** has specific navigation and assertions
- [ ] **Acceptance criteria** are specific and testable
- [ ] **Work estimate** is ~3-6 hours (not 30 min, not 3 days)
- [ ] **Testable outcome** - can verify in browser without other tickets

---

## Example: Good vs Bad Tickets

### BAD Ticket

```markdown
Title: Create block types and store

## Description
Create the types and store for blocks.

## Acceptance Criteria
- [ ] Types created
- [ ] Store works
```

**Problems**: No spec reference, vague description, no files list, no Playwright test, untestable criteria.

### GOOD Ticket

```markdown
Title: Block Card Grid Display

## Spec Reference
`specs/features/phase-3.md:45-89 (Build Sequence, Step 1-2)`

## What User Can Do After This
User navigates to /block-proto and sees block cards displayed in a responsive grid layout with hover states.

## Files
| File | Action | Purpose |
|------|--------|---------|
| types/Block.type.ts | Create | Block data structure |
| stores/useBlockStore.ts | Create | Block state with mock data |
| components/proto/BlockCard.vue | Create | Individual card component |
| pages/block-proto.vue | Modify | Import grid, display cards |

## Implementation Approach
Follow existing card patterns in components/. Use Tailwind grid for layout. Start with mock data in store, will connect to API in later ticket.

## Playwright Test
```
browser_navigate('/block-proto')
browser_snapshot() -> verify:
  - Grid container present
  - At least 3 BlockCard elements
  - Cards have title text
browser_hover('[data-testid="block-card-1"]')
browser_snapshot() -> verify hover state visible
```

## Acceptance Criteria
- [ ] BlockCard component renders with title, description, icon
- [ ] Grid displays 3+ cards in responsive layout
- [ ] Hover state shows subtle elevation/shadow change
- [ ] TypeScript compiles without errors
- [ ] Browser verification passes
```

---

## References

See [ticket-template.md](references/ticket-template.md) for a complete copy-paste template.

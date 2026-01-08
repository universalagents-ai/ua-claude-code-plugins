---
name: testable-increment-patterns
description: |
  This skill should be used when "chunking features into build steps", "creating Linear tickets from specs", "designing build sequences", "planning feature implementation", or when generating feature specs. Provides patterns for vertical-slice development where each increment is browser-testable.
---

# Testable Increment Patterns

This skill defines how to chunk feature work into **testable increments** rather than file-level steps. Each increment must be independently verifiable in a browser via Playwright.

## Core Concept: Vertical Slices vs Layer-Based

### Layer-Based (AVOID)

Breaking work by technical layer creates steps that can't be tested until the end:

```
Step 1: Create TypeScript types         -> Can't test visually
Step 2: Create Pinia store              -> Can't test visually
Step 3: Create Component A              -> Can't test visually
Step 4: Create Component B              -> Can't test visually
Step 5: Create Component C              -> Can't test visually
Step 6: Wire together                   -> Can't test visually
Step 7: Add page                        -> FINALLY testable!
```

**Result**: 7 commits before anything is testable. Zero Playwright tests run.

### Vertical Slice (USE THIS)

Breaking work by user-testable capability means each step delivers visible functionality:

```
Step 1: Block Card Grid          -> TEST: Cards appear on canvas
Step 2: Block Overlay System     -> TEST: Click card, see overlay
Step 3: State Integration        -> TEST: Selection persists
Step 4: CSS Theme Compliance     -> TEST: Theme tokens applied
Step 5: Chat Integration         -> TEST: Chat icon works
```

**Result**: Each step produces something testable in the browser.

## The Golden Rule

> **Every build step must be independently renderable and Playwright-testable.**

If a step can't be tested with `browser_navigate` + `browser_snapshot` + assertions, it's too granular.

## Grouping Patterns

### Pattern 1: Component Bundle

Group all files needed for a single UI capability:

```markdown
### Step N: [User-Facing Capability]

**Files to create/modify:**
- types/block.types.ts (types needed for this component)
- stores/useBlockStore.ts (state for this component)
- components/blocks/BlockCard.vue (the component itself)

**Playwright Test:**
- Navigate to /block-proto
- Verify BlockCard elements appear
- Take snapshot for regression
```

### Pattern 2: Feature Vertical

Group by complete user journey through the feature:

```markdown
### Step N: User Can [Action]

**What user can do after this step:**
- User sees [UI element]
- User clicks [action]
- User gets [response]

**Files:**
- [All files needed for this vertical slice]

**Test:**
- browser_navigate('/path')
- browser_click('button')
- browser_snapshot() -> verify expected state
```

### Pattern 3: Integration Layer

When connecting multiple components:

```markdown
### Step N: [Integration Name]

**Integration point:**
- Connects: ComponentA -> ComponentB
- Data flow: [describe]

**Files:**
- ComponentA.vue (modify: add emit)
- ComponentB.vue (modify: add listener)
- parent-page.vue (wire together)

**Test:**
- Navigate, interact with A
- Verify B updates correctly
```

## Build Sequence Format

Each step in a build sequence must include:

```markdown
### Step N: [User-Facing Title]

**User capability:** What the user can DO after this step

**Files:**
| File | Action | Purpose |
|------|--------|---------|
| [path] | Create/Modify | [why] |

**Playwright Test:**
```
browser_navigate('/path')
browser_click('element')
browser_snapshot() -> verify [expectation]
```

**Acceptance:**
- [ ] [Testable criterion]
```

## Ticket Grouping for Linear

When creating Linear tickets from a spec's build sequence:

### Target: 4-7 Tickets Per Feature

Each ticket should represent 3-6 hours of work with browser-verifiable outcome.

### Grouping Rules

1. **Each ticket = 1 testable milestone** (not 1 file)
2. **Include all layers** for that capability (types + store + component)
3. **Browser-verifiable outcome required** in acceptance criteria
4. **Include "Test: Navigate to X, verify Y"** in ticket description

### Spec Annotations for Ticket Grouping

Use HTML comments to annotate build sequences for ticket grouping:

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

### Step 4: Wire Card Click to Overlay
...
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Types-Only Step

```markdown
# BAD
Step 1: Create all TypeScript types
```

Types should be bundled with the component that uses them.

### Anti-Pattern 2: Store-Only Step

```markdown
# BAD
Step 1: Create Pinia store
Step 2: Create components that use store
```

Store and components should be in the same step if they're tightly coupled.

### Anti-Pattern 3: Untestable Step

```markdown
# BAD
Step 1: Refactor internal utilities
```

Internal changes should be part of a step that has visible impact.

### Anti-Pattern 4: Mega-Step

```markdown
# BAD
Step 1: Build the entire feature
```

Steps should be ~3-6 hours of work, not entire features.

## Validation Checklist

Before finalizing a build sequence or creating tickets:

- [ ] Each step has a Playwright test description
- [ ] Each step produces visible browser output
- [ ] Steps are 3-6 hours of work (not 30 min, not 3 days)
- [ ] Related files (types + store + component) are grouped together
- [ ] Target 4-7 steps/tickets per feature (not 14+)
- [ ] No layer-only steps (no "create all types" steps)

## Example: Good vs Bad Chunking

### Feature: Canvas Block Management

**BAD (Layer-Based - 14 steps):**
1. Create Block types
2. Create BlockStore
3. Create BlockCard component
4. Create BlockMenu component
5. Create BlockOverlay component
6. Create BlockCanvas component
7. Add hover states
8. Add click handlers
9. Add selection state
10. Add grid layout
11. Wire to page
12. Add CSS styling
13. Add animations
14. Write tests

**GOOD (Vertical-Slice - 5 steps):**
1. **Block Card Grid** - Cards appear on canvas, hover shows menu
   - Files: types, store, BlockCard, BlockMenu, canvas integration
   - Test: Navigate, see cards, hover shows menu

2. **Block Overlay** - Click card opens overlay modal
   - Files: BlockOverlay, card click handler, overlay state
   - Test: Click card, overlay appears, content loads

3. **Selection State** - Multi-select blocks, selection persists
   - Files: selection logic, visual indicators, keyboard shortcuts
   - Test: Select multiple, refresh, selection maintained

4. **CSS Theme Compliance** - All tokens use theme variables
   - Files: CSS audit, token replacements
   - Test: Toggle theme, all components update correctly

5. **Chat Integration** - Floating chat accessible from canvas
   - Files: ChatButton, chat panel, canvas layout adjustment
   - Test: Click chat icon, panel opens, can send message

## References

- **spec-writing-best-practices** skill for spec structure
- **codebase-inventory** skill for understanding existing patterns

# Linear Ticket Template

Copy and fill in this template when creating tickets from a spec.

---

## Template

```markdown
## Spec Reference
`specs/features/[FILENAME].md:[START_LINE]-[END_LINE] ([SECTION_NAME])`

## What User Can Do After This
[Describe the user-facing capability in 1-2 sentences. Start with "User can..." or "User sees..."]

## Files
| File | Action | Purpose |
|------|--------|---------|
| [path/to/file1.ts] | Create | [Brief purpose] |
| [path/to/file2.vue] | Create | [Brief purpose] |
| [path/to/file3.vue] | Modify | [What changes] |

## Implementation Approach
[2-3 sentences describing:
- Which patterns to follow (reference existing components)
- Key architectural decisions
- Any dependencies or prerequisites]

## Playwright Test
```
browser_navigate('[URL]')
browser_snapshot() -> verify [EXPECTATION_1]
browser_click('[ELEMENT_SELECTOR]')
browser_snapshot() -> verify [EXPECTATION_2]
```

## Acceptance Criteria
- [ ] [Specific, measurable criterion 1]
- [ ] [Specific, measurable criterion 2]
- [ ] [Specific, measurable criterion 3]
- [ ] TypeScript compiles without errors
- [ ] Browser verification passes
```

---

## Filled Example

```markdown
## Spec Reference
`specs/features/phase-3.md:45-89 (Build Sequence, Step 1-2)`

## What User Can Do After This
User navigates to /block-proto and sees block cards displayed in a responsive grid layout. Hovering a card shows a subtle elevation effect.

## Files
| File | Action | Purpose |
|------|--------|---------|
| types/Block.type.ts | Create | Block data structure with id, title, description, icon |
| stores/useBlockStore.ts | Create | Block state management with mock data |
| components/proto/BlockCard.vue | Create | Individual card with hover state |
| pages/block-proto.vue | Modify | Import BlockCard, display in grid |

## Implementation Approach
Follow card patterns from components/dashboard/StatCard.vue for structure. Use CSS Grid with Tailwind (grid-cols-3) for layout. Initialize store with 6 mock blocks. Hover effect uses Tailwind's hover:shadow-lg.

## Playwright Test
```
browser_navigate('/block-proto')
browser_snapshot() -> verify:
  - Grid container with class containing 'grid'
  - At least 3 elements with data-testid starting with 'block-card'
  - Each card has visible title text
browser_hover('[data-testid="block-card-1"]')
browser_snapshot() -> verify shadow/elevation change on hovered card
```

## Acceptance Criteria
- [ ] BlockCard displays title, description, and icon
- [ ] Grid shows 3 columns on desktop, 1 on mobile
- [ ] Hover state applies shadow transition
- [ ] Store initializes with mock data on page load
- [ ] TypeScript compiles without errors
- [ ] Browser verification passes
```

---

## Quick Reference: Action Values

| Action | When to Use |
|--------|-------------|
| Create | New file that doesn't exist |
| Modify | Existing file needs changes |
| Delete | File should be removed (rare) |

---

## Quick Reference: Playwright Assertions

```
browser_navigate('/path')           -> Go to URL
browser_snapshot()                  -> Get page structure
browser_click('[selector]')         -> Click element
browser_hover('[selector]')         -> Hover element
browser_type('[selector]', 'text')  -> Type into input
browser_wait_for({ text: 'X' })     -> Wait for text
```

Common snapshot verifications:
- Element exists: `verify [element] present`
- Text content: `verify text "[expected]" visible`
- State change: `verify [element] has [class/attribute]`
- Count: `verify at least N [elements]`

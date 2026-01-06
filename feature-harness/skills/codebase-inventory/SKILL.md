---
name: codebase-inventory
description: |
  This skill should be used when creating or updating "codebase inventory files", ".harness/codebase-inventory.json", ".harness/codebase-inventory.md", "merge scanner results", "inventory file format", "inventory structure", or when the write-spec or feature-harness commands need to check, create, or update inventory files. Provides standardized formats for machine-readable and human-readable codebase inventory.
---

# Codebase Inventory File Formats

This skill defines the standardized formats for `.harness/codebase-inventory.json` and `.harness/codebase-inventory.md` files used throughout the Feature Harness plugin.

## Purpose

Codebase inventory files serve two audiences:

| File | Format | Purpose | Primary Audience |
|------|--------|---------|------------------|
| `codebase-inventory.json` | JSON | Structured counts, paths, patterns | Agents (machine-readable) |
| `codebase-inventory.md` | Markdown | Descriptive with intent, recommendations | Humans + Agents (context-rich) |

**Both files MUST exist** in `.harness/` directory. Create both when initializing, update both when scanning.

## When to Check Existing Inventory

Before launching codebase-scanner agents:

1. **Check if inventory files exist** in `.harness/` directory
2. **Check freshness** - if `lastUpdated` is within 24 hours, consider inventory "fresh"
3. **Pass context to scanners** if inventory exists - scanners should validate against existing state

### Freshness Logic

```
IF .harness/codebase-inventory.json exists:
  Parse lastUpdated timestamp
  IF age < 24 hours:
    → Output: "Using existing inventory (updated: [timestamp])"
    → Pass inventory to scanner agents for validation
  ELSE:
    → Output: "Inventory stale (>24h). Rescanning..."
    → Pass inventory for comparison reference
ELSE:
  → Output: "No inventory found. Creating new..."
  → Full scan without reference
```

## JSON File Structure

The JSON file contains structured, parseable data:

```json
{
  "lastUpdated": "ISO-8601 timestamp",
  "componentCount": number,
  "pageCount": number,
  "apiRouteCount": number,
  "storeCount": number,
  "composableCount": number,
  "architecture": {
    "framework": "string",
    "styling": "string",
    "stateManagement": "string",
    "backend": "string"
  },
  "patterns": {
    "componentNaming": "string",
    "apiRoutes": "string",
    "errorHandling": "string"
  },
  "reusableComponents": [
    { "path": "string", "purpose": "string" }
  ]
}
```

See **`references/schemas.md`** for complete field definitions and validation rules.

## Markdown File Structure

The Markdown file provides human-readable context with explanations:

```markdown
# Codebase Inventory

**Last Updated**: [ISO timestamp]
**Scanned By**: [command name]

## Summary
[2-3 sentences about codebase structure]

## File Counts
| Category | Count |
|----------|-------|
| Components | N |
| Pages | N |
...

## Architecture
- Framework: ...
- Styling: ...

## Key Patterns
### Component Patterns
[Description with examples]

## Reusable Components
| Component | Path | Use For |
...

## Recommendations
[Actionable suggestions based on analysis]
```

See **`references/schemas.md`** for complete section requirements.

## Merging Scanner Results

When 3 parallel codebase-scanner agents return, merge their results:

1. **Extract counts** from each scanner's structured output
2. **Combine patterns** from all focus areas (UI, State, Architecture)
3. **Deduplicate** component listings
4. **Update timestamps** to current time
5. **Write both files** (.json and .md)

### Comparison with Existing Inventory

If existing inventory was passed to scanners, include comparison:

```markdown
## Changes Since Last Scan

| Metric | Previous | Current | Change |
|--------|----------|---------|--------|
| Components | 46 | 48 | +2 |
| Pages | 4 | 5 | +1 |
```

## Output Requirements

When working with inventory files, use clear status indicators:

| Emoji | Meaning |
|-------|---------|
| `Found existing codebase inventory` | Inventory exists |
| `No existing inventory found` | Creating new |
| `Inventory is up-to-date` | Fresh, using as-is |
| `Updating inventory...` | Rescanning |

## Additional Resources

### Reference Files

For detailed field definitions and complete schemas:
- **`references/schemas.md`** - Complete JSON and Markdown schemas with validation rules

### Example Files

Working examples from real projects:
- **`examples/inventory-example.json`** - Complete JSON inventory example
- **`examples/inventory-example.md`** - Complete Markdown inventory example

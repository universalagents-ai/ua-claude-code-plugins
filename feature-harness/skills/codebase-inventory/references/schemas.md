# Codebase Inventory Schemas

Complete field definitions and validation rules for inventory files.

## JSON Schema: codebase-inventory.json

### Required Fields

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `lastUpdated` | string | ISO-8601 timestamp | Must be valid ISO date |
| `componentCount` | number | Total Vue components | >= 0 |
| `pageCount` | number | Pages in pages/ directory | >= 0 |
| `apiRouteCount` | number | Server API routes | >= 0 |
| `storeCount` | number | Pinia stores | >= 0 |
| `composableCount` | number | Composable files | >= 0 |

### Architecture Object (Required)

```json
{
  "architecture": {
    "framework": "Nuxt 4.x + Vue 3",
    "styling": "Tailwind CSS v3",
    "stateManagement": "Pinia v3",
    "testing": "Vitest v3 + Playwright",
    "backend": "Supabase | Prisma | None"
  }
}
```

### Patterns Object (Required)

```json
{
  "patterns": {
    "componentNaming": "PascalCase for components, camelCase for composables",
    "apiRoutes": "defineEventHandler with streamText pattern",
    "errorHandling": "createError for API responses",
    "typescript": "Strict mode, <script setup lang=\"ts\">",
    "protoSystem": "Dedicated /proto namespace for prototypes (if applicable)"
  }
}
```

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `protoComponents` | object | Grouped prototype components by category |
| `uiLibraryComponents` | number | Count of UI library components |
| `pages` | string[] | List of page file names |
| `apiEndpoints` | string[] | List of API route paths |
| `composables` | string[] | List of composable file names |
| `reusableComponents` | array | Components available for reuse |
| `quickStartFlowValidation` | object | Feature-specific validation data |

### Reusable Components Array

```json
{
  "reusableComponents": [
    {
      "path": "apps/web/components/ui/Button.vue",
      "purpose": "Primary action button with variants"
    },
    {
      "path": "apps/web/components/ui/Card.vue",
      "purpose": "Content container with header/footer slots"
    }
  ]
}
```

---

## Markdown Schema: codebase-inventory.md

### Required Sections

1. **Header** (always present)
```markdown
# Codebase Inventory

**Last Updated**: [ISO timestamp]
**Scanned By**: Feature Harness [command name]
```

2. **Summary** (2-3 sentences)
```markdown
## Summary

This Nuxt 4 monorepo uses Vue 3 Composition API with Tailwind CSS for styling. The codebase includes a comprehensive UI library (33 components) and established patterns for authentication and theming.
```

3. **File Counts** (table format)
```markdown
## File Counts

| Category | Count |
|----------|-------|
| Components | 46 |
| Pages | 4 |
| API Routes | 2 |
| Stores | 0 |
| Composables | 2 |
```

4. **Architecture** (bullet list)
```markdown
## Architecture

- **Framework**: Nuxt 4.0.3 + Vue 3
- **Styling**: Tailwind CSS v3 with @tailwindcss/vite plugin
- **State**: Pinia v3 (installed but unused)
- **Testing**: Vitest v3 + Playwright
- **Backend**: Supabase + Vercel AI SDK v4
```

5. **Key Patterns** (with subsections)
```markdown
## Key Patterns

### Component Patterns
- `<script setup lang="ts">` - Composition API with TypeScript
- `defineProps`, `defineEmits` for type-safe component API
- Tailwind CSS for all styling

### State Management Patterns
- Composables for shared logic
- Pinia available but local state preferred
- Local component state with ref/reactive

### API Patterns
- `defineEventHandler(async (event) => { ... })`
- Structured response objects
- Error handling with createError
```

6. **Reusable Components** (table format)
```markdown
## Reusable Components

| Component | Path | Use For |
|-----------|------|---------|
| Button | components/ui/Button.vue | Primary actions |
| Card | components/ui/Card.vue | Content containers |
| Dialog | components/ui/dialog/*.vue | Modal dialogs |
```

### Optional Sections

7. **Conventions from CLAUDE.md**
```markdown
## Conventions (from CLAUDE.md)

- Use `pnpm lint:fix` for linting
- Use `pnpm type-check` for type validation
- Always use Tailwind CSS, never custom CSS
- Use `<script setup lang="ts">` for components
```

8. **Recommendations**
```markdown
## Recommendations

Based on codebase analysis:
1. **Reuse UI Library** - 33 components ready to use
2. **Follow Auth Patterns** - useAuth.ts has established patterns
3. **Theme Integration** - Use existing theme variables
```

9. **Gaps/Opportunities**
```markdown
## Gaps (Opportunities)

1. **No Dashboard** - No dashboard page exists yet
2. **No DatabaseAdapter** - Direct Supabase queries (CLAUDE.md recommends adapter)
3. **Mock Data Inline** - No separate mock data files
```

10. **Feature Component Mapping** (for specific features)
```markdown
## Feature Component Mapping

### [Feature Name]
- **Can Reuse**: Button, Card, Input, Separator
- **Need to Create**: TaskList.vue, TaskItem.vue
- **Patterns to Follow**: interplay-demo.vue for list rendering
```

---

## Validation Rules

### JSON Validation

```typescript
// Minimum valid JSON inventory
interface CodebaseInventoryJSON {
  lastUpdated: string;  // ISO-8601
  componentCount: number;
  pageCount: number;
  apiRouteCount: number;
  storeCount: number;
  composableCount: number;
  architecture: {
    framework: string;
    styling: string;
    stateManagement: string;
    backend: string;
  };
  patterns: {
    componentNaming: string;
    apiRoutes: string;
    errorHandling: string;
  };
}
```

### Markdown Validation

- Must have `# Codebase Inventory` header
- Must have `**Last Updated**:` field
- Must have `## File Counts` section with table
- Must have `## Architecture` section
- Must have `## Key Patterns` section

---

## Freshness Calculation

```typescript
function isInventoryFresh(lastUpdated: string, maxAgeHours: number = 24): boolean {
  const inventoryDate = new Date(lastUpdated);
  const now = new Date();
  const ageMs = now.getTime() - inventoryDate.getTime();
  const ageHours = ageMs / (1000 * 60 * 60);
  return ageHours < maxAgeHours;
}
```

### Freshness Thresholds

| Age | Status | Action |
|-----|--------|--------|
| < 24 hours | Fresh | Use as-is, pass to scanners for validation |
| 24-72 hours | Stale | Rescan, compare with existing |
| > 72 hours | Expired | Full rescan, ignore existing counts |

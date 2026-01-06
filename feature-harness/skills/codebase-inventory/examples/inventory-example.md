# Codebase Inventory

**Last Updated**: 2026-01-04T12:00:00Z
**Scanned By**: Feature Harness /write-spec

## Summary

This Nuxt 4 monorepo demonstrates modular architecture using Nuxt Layers and pnpm workspaces. The codebase includes 46 Vue components (33 from a UI library), established patterns for authentication and theming, and a prototype system for frontend-first development.

## File Counts

| Category | Count |
|----------|-------|
| Components | 46 |
| Pages | 4 |
| API Routes | 2 |
| Stores | 0 |
| Composables | 2 |

## Architecture

- **Framework**: Nuxt 4.0.3 + Vue 3
- **Styling**: Tailwind CSS v3 with @tailwindcss/vite plugin
- **State**: Pinia v3 (installed but unused)
- **Testing**: Vitest v3 + Playwright (configured)
- **Backend**: Supabase + Vercel AI SDK v4

## Key Patterns

### Component Patterns
- `<script setup lang="ts">` - Composition API with TypeScript
- `defineProps`, `defineEmits` for type-safe component API
- Tailwind CSS for all styling
- Responsive design patterns

### State Management Patterns
- Composables for shared logic (useAuth.ts, useTheme.ts)
- Pinia available but local component state preferred
- Local state with ref/reactive

### API Patterns
- `defineEventHandler(async (event) => { ... })`
- Structured response objects
- Error handling with try-catch and `setResponseStatus(event, code)`

### Proto System Patterns
- Dedicated `/proto` namespace for prototyping
- Components in `components/proto/` directory
- Mock data inline in components
- Iterative UI development before backend integration

## Reusable Components

| Component | Path | Use For |
|-----------|------|---------|
| Avatar | components/ui/Avatar.vue | User avatar display |
| Badge | components/ui/Badge.vue | Status indicators |
| Button | components/ui/Button.vue | Primary actions with variants |
| Card | components/ui/Card.vue | Content container with header/footer slots |
| Dialog | components/ui/dialog/*.vue | Modal dialogs with scroll support |
| Input | components/ui/Input.vue | Text input fields |
| Label | components/ui/Label.vue | Form field labels |
| Sheet | components/ui/sheet/*.vue | Slide-out panels |
| Switch | components/ui/Switch.vue | Toggle switches |
| Textarea | components/ui/Textarea.vue | Multiline text input |

## Composables

### useAuth.ts
- **Purpose**: Authentication and user profile management
- **Key Functions**: login, logout, signUp, updateProfile, uploadAvatar, getProfile
- **Integration**: Supabase auth, profiles table, storage bucket
- **Dev Mode**: Supports DEV_AUTH_BYPASS with mock user data

### useTheme.ts
- **Purpose**: Theme management and switching
- **Key Functions**: setTheme(themeName)
- **Themes**: light, dark, interplay

## API Endpoints

### /api/health.ts
- **Method**: GET
- **Purpose**: Health check for deployment monitoring
- **Response**: status, uptime, version, environment, memory metrics

### /api/chat.post.ts
- **Method**: POST
- **Purpose**: AI chat streaming endpoint
- **Pattern**: streamText from Vercel AI SDK

## Conventions (from CLAUDE.md)

- `pnpm lint:fix` for linting
- `pnpm type-check` for TypeScript validation
- `pnpm test:all` for running all tests
- Always use Tailwind CSS, never custom CSS
- Use `<script setup lang="ts">` for all components
- Prefer type imports: `import type { ... }`

## Recommendations

Based on codebase analysis:

1. **Reuse UI Library** - 33 pre-built components available (Avatar, Badge, Button, Card, Dialog, Input, Label, Sheet, Switch, Textarea)
2. **Follow Auth Patterns** - useAuth.ts has established patterns for user management
3. **Theme Integration** - Use existing theme variables from useTheme.ts
4. **Create Demo Pages** - Follow theme-demo.vue, components-demo.vue pattern for prototyping
5. **API Consistency** - Follow health.ts pattern for new endpoints

## Gaps (Opportunities)

1. **No Dashboard** - No dashboard page exists yet
2. **No DatabaseAdapter** - Direct Supabase queries (CLAUDE.md recommends adapter pattern)
3. **Mock Data Inline** - No separate mock data files
4. **Pinia Unused** - State management library installed but not actively used

## Proto Components by Category

### Initializer Flow
- InitializerCanvas.vue
- InitializerFileUpload.vue
- InitializerProcessing.vue
- InitializerRecommendations.vue
- InitializerWelcome.vue
- PersonaCanvas.vue
- ResearchCanvas.vue
- StrategyCanvas.vue
- TaskTypeSelector.vue

### Layout Components
- CanvasPanel.vue
- ChatPanel.vue
- FinalDeliverable.vue
- MainContent.vue

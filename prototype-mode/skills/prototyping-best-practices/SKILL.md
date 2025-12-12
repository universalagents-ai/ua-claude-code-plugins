---
name: Prototyping Best Practices & Mock Data
description: This skill should be used when the user asks to "design the experience", "design the user interface", "design the journey", "create a prototype", "build the UI", "create some mock data", "prototype a feature", or mentions prototyping, mock data, or UI design. Provides guidance for frontend-first development with mock data in a safe prototyping environment.
version: 0.1.0
---

# Prototyping Best Practices & Mock Data

## Purpose

This skill provides essential guidance for building frontend prototypes with mock data in a safe, production-isolated environment. It focuses on rapid UI/UX development without backend dependencies, ensuring designers, product managers, and strategists can visualize features without risking data exposure or backend complexity.

## When to Use This Skill

Use this skill when:
- Building UI prototypes or proof-of-concepts
- Designing user experiences and journeys
- Creating mock data for frontend development
- Working in prototype mode to avoid backend operations
- Rapidly iterating on interface designs
- Demonstrating features to stakeholders

## Core Principles

### Frontend-First Development

Prototype exclusively with frontend code:
- Focus on `components/`, `pages/`, `layouts/`, `assets/` directories
- Build UI components that display mock data
- Implement user flows and state transitions
- Create interactive experiences without backend logic

Never touch backend files (`server/`, `api/`, `supabase/`) in prototype mode.

### Mock Data Strategy

Mock data enables realistic prototypes without external dependencies:

1. **Local JSON files**: Store mock data in dedicated directories
2. **Inline data**: Embed mock data directly in components for simple cases
3. **Mock API responses**: Simulate API structures without real endpoints
4. **Realistic content**: Use plausible names, dates, and values for authenticity

### Safety Boundaries

Prototyping mode enforces strict boundaries:
- No database connections or queries
- No external API calls
- No environment variable access
- No file modifications outside frontend directories
- No exposure of sensitive data or credentials

## Mock Data Patterns

### Directory Structure

Organize mock data for maintainability:

```
mocks/
├── users.json
├── products.json
├── orders.json
└── dashboard-metrics.json

fixtures/
├── user-profiles.json
└── sample-content.json

__mock__/
└── api-responses.json
```

Place mock data in `mocks/`, `fixtures/`, `__mock__/`, or `data/` directories.

### JSON Data Structure

Create structured, realistic mock data:

**Example: User Data**
```json
{
  "users": [
    {
      "id": "usr_001",
      "name": "Alex Chen",
      "email": "alex@example.com",
      "avatar": "https://i.pravatar.cc/150?img=1",
      "role": "admin",
      "createdAt": "2024-01-15T10:30:00Z",
      "preferences": {
        "theme": "dark",
        "notifications": true
      }
    },
    {
      "id": "usr_002",
      "name": "Jordan Taylor",
      "email": "jordan@example.com",
      "avatar": "https://i.pravatar.cc/150?img=2",
      "role": "user",
      "createdAt": "2024-02-20T14:45:00Z",
      "preferences": {
        "theme": "light",
        "notifications": false
      }
    }
  ]
}
```

**Example: Dashboard Metrics**
```json
{
  "metrics": {
    "totalUsers": 1247,
    "activeUsers": 892,
    "revenue": 45230.50,
    "growth": 12.5,
    "period": "Last 30 days"
  },
  "chartData": [
    { "date": "2024-11", "value": 120 },
    { "date": "2024-12", "value": 145 }
  ]
}
```

### Mock Data Guidelines

**Be realistic**: Use plausible values that match production data patterns
- Real-looking names and emails
- Proper date formats (ISO 8601)
- Consistent IDs and references
- Appropriate ranges for numeric data

**Match production schema**: Structure mock data to match expected API shapes
- Same field names and types
- Nested objects where needed
- Arrays for collections
- Null values for optional fields

**Include edge cases**: Test UI with various data scenarios
- Empty states (empty arrays, null values)
- Loading states (use loading indicators)
- Error states (simulate error responses)
- Long content (test text overflow)
- Missing data (test fallbacks)

**Maintain consistency**: Keep mock data synchronized across components
- Reference the same user IDs across files
- Use consistent naming conventions
- Share common data structures
- Update related mocks together

## Frontend Component Patterns

### Loading Mock Data in Components

**Nuxt 3 Composable Pattern** (recommended):

```typescript
// composables/useMockUsers.ts
export const useMockUsers = () => {
  // In real app, this would be: useFetch('/api/users')
  const users = ref([
    {
      id: 'usr_001',
      name: 'Alex Chen',
      email: 'alex@example.com',
      role: 'admin'
    },
    {
      id: 'usr_002',
      name: 'Jordan Taylor',
      email: 'jordan@example.com',
      role: 'user'
    }
  ])

  const loading = ref(false)
  const error = ref(null)

  return { users, loading, error }
}
```

**Component Usage**:

```vue
<script setup lang="ts">
const { users, loading, error } = useMockUsers()
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="error">Error: {{ error }}</div>
  <div v-else>
    <div v-for="user in users" :key="user.id">
      {{ user.name }}
    </div>
  </div>
</template>
```

**Import from JSON Files**:

```typescript
// Import static mock data
import mockUsers from '~/mocks/users.json'

export const useMockUsers = () => {
  const users = ref(mockUsers.users)
  return { users, loading: ref(false), error: ref(null) }
}
```

### Simulating Async Behavior

Add realistic delays to mock async operations:

```typescript
export const useMockUsers = () => {
  const users = ref([])
  const loading = ref(true)
  const error = ref(null)

  // Simulate API delay
  setTimeout(() => {
    users.value = [
      { id: 'usr_001', name: 'Alex Chen' },
      { id: 'usr_002', name: 'Jordan Taylor' }
    ]
    loading.value = false
  }, 800)

  return { users, loading, error }
}
```

### Simulating State Changes

Mock interactions that would trigger backend updates:

```typescript
export const useMockUserActions = () => {
  const updateUser = (userId: string, updates: any) => {
    // In real app: await $fetch(`/api/users/${userId}`, { method: 'PATCH', body: updates })
    console.log('Mock: Updating user', userId, updates)
    return Promise.resolve({ success: true })
  }

  const deleteUser = (userId: string) => {
    // In real app: await $fetch(`/api/users/${userId}`, { method: 'DELETE' })
    console.log('Mock: Deleting user', userId)
    return Promise.resolve({ success: true })
  }

  return { updateUser, deleteUser }
}
```

## shadcn/ui Integration

### Checking Installation

Before building prototypes, verify shadcn/ui (shadcn-vue for Vue/Nuxt) is installed:

```bash
# Check if shadcn-vue is configured
ls components/ui/
```

If `components/ui/` doesn't exist or is empty, shadcn-vue is not installed.

### Installing shadcn-vue

When shadcn-vue is not detected, prompt to install:

```bash
# Initialize shadcn-vue for Nuxt
npx shadcn-vue@latest init

# Add commonly needed components
npx shadcn-vue@latest add button
npx shadcn-vue@latest add card
npx shadcn-vue@latest add input
npx shadcn-vue@latest add dialog
npx shadcn-vue@latest add toast
```

Follow the CLI prompts to configure:
- Choose Nuxt as the framework
- Select Tailwind CSS configuration
- Choose component location (default: `components/ui/`)
- Select color theme

### Using shadcn/ui Components

Build prototypes rapidly with pre-built components:

```vue
<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'

const { users } = useMockUsers()
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>User Management</CardTitle>
    </CardHeader>
    <CardContent>
      <Input placeholder="Search users..." class="mb-4" />
      <div v-for="user in users" :key="user.id" class="flex items-center gap-2 mb-2">
        <span>{{ user.name }}</span>
        <Button size="sm">Edit</Button>
      </div>
    </CardContent>
  </Card>
</template>
```

### Recommended Components for Prototyping

Install these shadcn-vue components for common prototype needs:

- **button**: Primary actions and interactions
- **card**: Content containers
- **input, textarea**: Form fields
- **select, checkbox, radio**: Form controls
- **dialog, sheet**: Modals and sidebars
- **toast**: Notifications
- **table**: Data displays
- **tabs**: Navigation
- **badge**: Status indicators
- **avatar**: User representations

## Integration with frontend-design Skill

When designing UI components, leverage the frontend-design skill for high-quality, production-ready interfaces.

### When to Invoke frontend-design

Invoke frontend-design skill for:
- Creating new page layouts
- Designing complex components
- Building responsive interfaces
- Implementing design systems
- Ensuring accessibility standards

### Combining Skills

Use both skills together:

1. **Prototyping best practices**: Provides mock data and safe environment
2. **frontend-design**: Generates polished UI with proper styling

Example workflow:
```
User: "Design a user dashboard with activity metrics"

1. Use prototyping-best-practices to create mock metrics data
2. Use frontend-design to generate the dashboard UI
3. Combine mock data with designed components
4. Result: Realistic, interactive prototype
```

### Maintaining Design Quality

Follow frontend-design principles while prototyping:
- Use Tailwind CSS exclusively (no custom CSS)
- Implement responsive design patterns
- Apply consistent spacing and typography
- Ensure proper color contrast
- Test multiple viewport sizes

## State Management in Prototypes

### Local Component State

For simple prototypes, use component-level state:

```vue
<script setup lang="ts">
const selectedUserId = ref<string | null>(null)
const isDialogOpen = ref(false)

const selectUser = (userId: string) => {
  selectedUserId.value = userId
  isDialogOpen.value = true
}
</script>
```

### Composables for Shared State

For state shared across multiple components:

```typescript
// composables/usePrototypeState.ts
export const usePrototypeState = () => {
  const currentUser = useState('currentUser', () => ({
    id: 'usr_001',
    name: 'Alex Chen',
    role: 'admin'
  }))

  const isAuthenticated = useState('isAuthenticated', () => true)

  return { currentUser, isAuthenticated }
}
```

### Avoid Pinia for Prototypes

Skip Pinia stores in prototype mode unless absolutely necessary:
- Adds complexity for temporary prototypes
- Composables with `useState` are sufficient
- Faster iteration without store setup

## Error and Loading States

### Implementing Loading States

Show loading indicators for async operations:

```vue
<script setup lang="ts">
const { users, loading } = useMockUsers()
</script>

<template>
  <div v-if="loading" class="flex items-center justify-center p-8">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
  <div v-else>
    <!-- Content -->
  </div>
</template>
```

### Implementing Error States

Display error messages gracefully:

```vue
<script setup lang="ts">
const { users, loading, error } = useMockUsers()
</script>

<template>
  <div v-if="error" class="p-4 bg-destructive/10 text-destructive rounded">
    <p class="font-semibold">Error loading users</p>
    <p class="text-sm">{{ error }}</p>
  </div>
</template>
```

### Implementing Empty States

Handle empty data scenarios:

```vue
<template>
  <div v-if="users.length === 0" class="text-center p-8 text-muted-foreground">
    <p class="text-lg font-semibold">No users found</p>
    <p class="text-sm">Try adjusting your filters</p>
  </div>
</template>
```

## Prototyping Workflow

### Step-by-Step Process

1. **Understand requirements**: Identify feature purpose, target users, and key flows
2. **Create mock data**: Build realistic JSON data matching expected structure
3. **Check dependencies**: Verify shadcn-vue installation
4. **Build components**: Create UI components with mock data integration
5. **Implement states**: Add loading, error, and empty states
6. **Test interactions**: Verify user flows and state transitions
7. **Iterate quickly**: Make rapid changes based on feedback

### Rapid Iteration Tips

- Start with minimal viable UI, then refine
- Use shadcn/ui components for speed
- Copy and modify mock data easily
- Focus on user flow over polish initially
- Add visual refinement after flow validation

### Handoff Preparation

When exiting prototype mode, prepare for production:
- Document mock data structures (for backend implementation)
- Note API endpoints needed
- List state management requirements
- Identify integration points
- Provide component inventory

## Additional Resources

### Example Files

Working examples in `examples/`:
- **`users-composable.ts`** - Mock user data composable
- **`dashboard-metrics.json`** - Sample dashboard data
- **`product-list-component.vue`** - Complete component example

### Reference Files

Detailed guidance in `references/`:
- **`mock-data-patterns.md`** - Comprehensive mock data strategies
- **`shadcn-setup.md`** - shadcn-vue installation and configuration
- **`state-management.md`** - State handling in prototypes

## Best Practices Summary

✅ **DO:**
- Use mock data exclusively
- Keep mock data in dedicated directories
- Check shadcn-vue installation before building
- Implement loading, error, and empty states
- Focus on frontend directories only
- Leverage frontend-design skill for UI quality
- Structure data to match production schemas

❌ **DON'T:**
- Touch backend files (`server/`, `api/`)
- Connect to real databases or APIs
- Use environment variables or credentials
- Modify files outside allowed directories
- Skip state implementation (loading, error, empty)
- Ignore responsive design
- Hardcode data directly in templates (use composables)

Focus on rapid, safe prototyping that demonstrates user flows without production dependencies.

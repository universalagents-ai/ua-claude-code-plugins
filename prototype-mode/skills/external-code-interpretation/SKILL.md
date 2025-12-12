---
name: External Code Interpretation & Adaptation
description: This skill should be used when the user provides code from "Lovable", "v0", "Replit", "Gemini", or mentions "convert this code", "adapt this component", "port from React", "translate to Vue", or provides code snippets from external AI coding tools. Provides comprehensive guidance for analyzing, interpreting, and adapting external code to Nuxt/Vue 3 project structure with Tailwind CSS.
version: 0.1.0
---

# External Code Interpretation & Adaptation

## Purpose

This skill provides systematic guidance for interpreting code from AI coding tools (Lovable, v0, Replit, Gemini) and adapting it to your Nuxt/Vue 3 project with Tailwind CSS. It focuses on preserving functionality and intent while conforming to project conventions and safety boundaries.

## When to Use This Skill

Use this skill when:
- User provides code from Lovable, v0, Replit, or Gemini
- Adapting React components to Vue 3
- Converting other CSS frameworks to Tailwind
- Porting components from different frameworks
- Interpreting and integrating external code snippets

## Core Principles

### Preserve Intent, Adapt Implementation

Focus on what the code does, not how it does it:

1. **Understand purpose**: What problem does this code solve?
2. **Identify key features**: What are the essential behaviors?
3. **Map patterns**: How do framework patterns translate?
4. **Adapt syntax**: Convert to Vue 3 Composition API
5. **Apply conventions**: Match project structure and style

### Framework Recognition

Identify the source framework to determine conversion approach:

**React indicators:**
- `import React from 'react'`
- `useState`, `useEffect`, `useCallback` hooks
- JSX syntax with className
- `export default function Component`

**Vue 2 indicators:**
- `export default { data(), methods: {} }`
- Options API structure
- `this.$` references

**Svelte indicators:**
- `<script>` without setup attribute
- Reactive declarations with `$:`
- Template syntax without v- directives

**Angular indicators:**
- `@Component` decorators
- TypeScript with decorators
- Template syntax with *ngIf, *ngFor

### CSS Framework Recognition

Identify styling approach to plan Tailwind conversion:

**Material UI / MUI:**
- `import { Button } from '@mui/material'`
- `sx={{}}` prop styling
- Theme provider usage

**Bootstrap:**
- Class names like `btn btn-primary`, `container`, `row`, `col-*`
- Component classes: `navbar`, `card`, `modal`

**Chakra UI:**
- Component imports from `@chakra-ui/react`
- Props like `colorScheme`, `variant`, `size`

**Styled Components:**
- Template literals with CSS
- `styled.div` syntax
- Theme objects

## Conversion Process

### Step 1: Analyze Source Code

Examine the provided code to understand:

1. **Framework**: React, Vue 2, Svelte, Angular, or vanilla JS
2. **Styling**: Tailwind, MUI, Bootstrap, Chakra, styled-components, or custom CSS
3. **Purpose**: What does this component do?
4. **Dependencies**: External libraries or APIs used
5. **Complexity**: Simple presentational or complex stateful

**Example Analysis:**

```jsx
// Source: React component from v0
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <h1 className="text-2xl font-bold">Count: {count}</h1>
      <div className="flex gap-2">
        <Button onClick={() => setCount(count - 1)}>Decrease</Button>
        <Button onClick={() => setCount(count + 1)}>Increase</Button>
      </div>
    </div>
  )
}
```

**Analysis:**
- Framework: React (useState hook, JSX)
- Styling: Tailwind CSS (className with utility classes)
- Purpose: Simple counter with increment/decrement
- Dependencies: Likely shadcn/ui button component
- Complexity: Simple, minimal state

### Step 2: Determine Conversion Strategy

Based on analysis, choose approach:

**Preserve Structure (when feasible):**
- Source uses Tailwind → Keep utility classes
- Simple component structure → Maintain organization
- Clear separation of concerns → Preserve patterns

**Full Rewrite (when necessary):**
- Different CSS framework → Complete styling rewrite
- Incompatible patterns → Redesign component structure
- Complex state management → Adapt to Vue patterns
- Backend dependencies → Replace with mock data

### Step 3: Convert to Vue 3 Composition API

Transform component structure:

**React to Vue Conversion Patterns:**

| React Pattern | Vue 3 Equivalent |
|---------------|------------------|
| `useState(0)` | `ref(0)` |
| `useEffect(() => {}, [])` | `onMounted(() => {})` |
| `useEffect(() => {}, [dep])` | `watch(dep, () => {})` |
| `useMemo(() => value, [dep])` | `computed(() => value)` |
| `useCallback(() => {}, [])` | Define function in setup |
| `const [x, setX] = useState()` | `const x = ref()` |
| `className` | `class` |
| `onClick` | `@click` |
| `{condition && <El />}` | `<El v-if="condition" />` |
| `{items.map(item => <El />)}` | `<El v-for="item in items" />` |

**Example Conversion:**

```vue
<!-- Converted: Vue 3 component -->
<script setup lang="ts">
import { Button } from '~/components/ui/button'

const count = ref(0)
</script>

<template>
  <div class="flex flex-col items-center gap-4 p-8">
    <h1 class="text-2xl font-bold">Count: {{ count }}</h1>
    <div class="flex gap-2">
      <Button @click="count--">Decrease</Button>
      <Button @click="count++">Increase</Button>
    </div>
  </div>
</template>
```

### Step 4: Convert Styling to Tailwind

Transform CSS framework classes to Tailwind:

**Material UI to Tailwind:**

```jsx
// MUI
<Button
  variant="contained"
  color="primary"
  size="large"
  fullWidth
>
  Submit
</Button>

// Tailwind (with shadcn/ui)
<Button class="w-full" size="lg">
  Submit
</Button>
```

**Bootstrap to Tailwind:**

```html
<!-- Bootstrap -->
<div class="container">
  <div class="row">
    <div class="col-md-6">Content</div>
  </div>
</div>

<!-- Tailwind -->
<div class="container mx-auto px-4">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>Content</div>
  </div>
</div>
```

**Chakra UI to Tailwind:**

```jsx
// Chakra
<Box bg="blue.500" p={4} borderRadius="md">
  <Text fontSize="lg" fontWeight="bold" color="white">
    Title
  </Text>
</Box>

// Tailwind
<div class="bg-blue-500 p-4 rounded-md">
  <p class="text-lg font-bold text-white">
    Title
  </p>
</div>
```

### Step 5: Adapt to Nuxt Conventions

Apply project-specific patterns:

**File Location:**
- Components → `components/`
- Pages → `pages/`
- Composables → `composables/`
- Utilities → `utils/`

**Import Paths:**
```typescript
// Convert relative imports
import Button from '../components/Button' // React

// To Nuxt auto-imports or ~ alias
import { Button } from '~/components/ui/button'
```

**API Calls:**
```typescript
// React fetch
useEffect(() => {
  fetch('/api/users').then(res => res.json()).then(setUsers)
}, [])

// Convert to Nuxt composable with mock data
const { users, loading, error } = useMockUsers()
```

### Step 6: Replace Backend Logic with Mock Data

Remove external dependencies and use mock data:

**API Calls:**
```typescript
// Original: Real API call
const fetchProducts = async () => {
  const res = await fetch('https://api.example.com/products')
  const data = await res.json()
  setProducts(data)
}

// Convert to mock data
const products = ref([
  { id: 1, name: 'Product 1', price: 29.99 },
  { id: 2, name: 'Product 2', price: 39.99 }
])
```

**Database Queries:**
```typescript
// Original: Supabase query
const { data } = await supabase.from('users').select('*')

// Convert to mock data
const users = ref([
  { id: 1, name: 'Alex Chen', email: 'alex@example.com' },
  { id: 2, name: 'Jordan Taylor', email: 'jordan@example.com' }
])
```

**Authentication:**
```typescript
// Original: Auth check
const { user } = useAuth()

// Convert to mock auth
const user = ref({
  id: 'usr_001',
  name: 'Alex Chen',
  role: 'admin'
})
```

## Framework-Specific Conversions

### React to Vue 3

**Hooks Conversion:**

```jsx
// React: useState
const [name, setName] = useState('')
const [count, setCount] = useState(0)

// Vue 3: ref
const name = ref('')
const count = ref(0)
```

```jsx
// React: useEffect (mount)
useEffect(() => {
  console.log('Mounted')
}, [])

// Vue 3: onMounted
onMounted(() => {
  console.log('Mounted')
})
```

```jsx
// React: useEffect (watch)
useEffect(() => {
  console.log('Count changed:', count)
}, [count])

// Vue 3: watch
watch(count, (newCount) => {
  console.log('Count changed:', newCount)
})
```

```jsx
// React: useMemo
const doubled = useMemo(() => count * 2, [count])

// Vue 3: computed
const doubled = computed(() => count.value * 2)
```

**Event Handling:**

```jsx
// React
<button onClick={handleClick}>Click</button>
<input onChange={handleChange} value={text} />
<form onSubmit={handleSubmit}>

// Vue 3
<button @click="handleClick">Click</button>
<input @input="handleChange" :value="text" />
<form @submit.prevent="handleSubmit">
```

**Conditional Rendering:**

```jsx
// React
{isVisible && <div>Content</div>}
{isLoading ? <Spinner /> : <Content />}

// Vue 3
<div v-if="isVisible">Content</div>
<Spinner v-if="isLoading" />
<Content v-else />
```

**List Rendering:**

```jsx
// React
{items.map(item => (
  <div key={item.id}>{item.name}</div>
))}

// Vue 3
<div v-for="item in items" :key="item.id">
  {{ item.name }}
</div>
```

### Vue 2 to Vue 3

**Options API to Composition API:**

```javascript
// Vue 2: Options API
export default {
  data() {
    return {
      count: 0,
      name: ''
    }
  },
  computed: {
    doubled() {
      return this.count * 2
    }
  },
  methods: {
    increment() {
      this.count++
    }
  },
  mounted() {
    console.log('Mounted')
  }
}

// Vue 3: Composition API
<script setup lang="ts">
const count = ref(0)
const name = ref('')

const doubled = computed(() => count.value * 2)

const increment = () => {
  count.value++
}

onMounted(() => {
  console.log('Mounted')
})
</script>
```

### Svelte to Vue 3

**Reactive Declarations:**

```svelte
<!-- Svelte -->
<script>
  let count = 0
  $: doubled = count * 2

  function increment() {
    count += 1
  }
</script>

<button on:click={increment}>
  Count: {count}, Doubled: {doubled}
</button>
```

```vue
<!-- Vue 3 -->
<script setup lang="ts">
const count = ref(0)
const doubled = computed(() => count.value * 2)

const increment = () => {
  count.value++
}
</script>

<template>
  <button @click="increment">
    Count: {{ count }}, Doubled: {{ doubled }}
  </button>
</template>
```

## CSS Framework Conversions

### Common Utility Mappings

**Layout:**
- `display: flex` → `flex`
- `flex-direction: column` → `flex-col`
- `justify-content: center` → `justify-center`
- `align-items: center` → `items-center`
- `gap: 1rem` → `gap-4`

**Spacing:**
- `padding: 1rem` → `p-4`
- `margin: 0 auto` → `mx-auto`
- `padding-left: 2rem` → `pl-8`

**Typography:**
- `font-size: 1.5rem` → `text-2xl`
- `font-weight: bold` → `font-bold`
- `text-align: center` → `text-center`
- `color: #3b82f6` → `text-blue-500`

**Sizing:**
- `width: 100%` → `w-full`
- `max-width: 48rem` → `max-w-3xl`
- `height: 2rem` → `h-8`

**Borders & Shadows:**
- `border-radius: 0.375rem` → `rounded-md`
- `border: 1px solid` → `border`
- `box-shadow: 0 1px 3px...` → `shadow-md`

### Material UI Component Mapping

When source uses MUI, map to shadcn/ui:

```jsx
// MUI
import { Button, TextField, Card, CardContent } from '@mui/material'

<Button variant="contained" color="primary">Submit</Button>
<TextField label="Email" variant="outlined" fullWidth />
<Card>
  <CardContent>Content</CardContent>
</Card>
```

```vue
<!-- shadcn/ui + Tailwind -->
<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Card, CardContent } from '~/components/ui/card'
</script>

<template>
  <Button>Submit</Button>

  <div class="w-full">
    <Label>Email</Label>
    <Input type="email" />
  </div>

  <Card>
    <CardContent>Content</CardContent>
  </Card>
</template>
```

## Handling Complex Scenarios

### State Management

**React Context to Vue Composable:**

```jsx
// React Context
const UserContext = createContext()

function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  )
}

const { user, setUser } = useContext(UserContext)
```

```typescript
// Vue Composable
export const useUser = () => {
  const user = useState('user', () => null)

  const setUser = (newUser: any) => {
    user.value = newUser
  }

  return { user, setUser }
}

// Usage
const { user, setUser } = useUser()
```

### Form Handling

**React Hook Form to Vue:**

```jsx
// React Hook Form
import { useForm } from 'react-hook-form'

const { register, handleSubmit, formState: { errors } } = useForm()

<form onSubmit={handleSubmit(onSubmit)}>
  <input {...register('email', { required: true })} />
  {errors.email && <span>Email is required</span>}
</form>
```

```vue
<!-- Vue reactive form -->
<script setup lang="ts">
const formData = reactive({
  email: ''
})

const errors = reactive({
  email: ''
})

const validate = () => {
  errors.email = formData.email ? '' : 'Email is required'
  return !errors.email
}

const onSubmit = () => {
  if (validate()) {
    console.log('Submit:', formData)
  }
}
</script>

<template>
  <form @submit.prevent="onSubmit">
    <input v-model="formData.email" />
    <span v-if="errors.email">{{ errors.email }}</span>
  </form>
</template>
```

### Routing

**React Router to Nuxt:**

```jsx
// React Router
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'

<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/about" element={<About />} />
</Routes>

<Link to="/about">About</Link>
```

```vue
<!-- Nuxt: File-based routing -->
<!-- pages/index.vue = / -->
<!-- pages/about.vue = /about -->

<template>
  <NuxtLink to="/about">About</NuxtLink>
</template>
```

## Best Practices

### 1. Preserve User Intent

Focus on what the user wanted to build, not literal code translation:

```
User: "Here's a React dashboard from v0"
Goal: Understand the dashboard's purpose and features
Avoid: Blindly converting every line of React code
Do: Identify key features, then build idiomatic Vue version
```

### 2. Simplify When Possible

External code may be over-engineered for prototypes:

```typescript
// Complex: Full Redux store from source
// Simplified: Simple composable with mock data

export const useProducts = () => {
  const products = ref([/* mock data */])
  return { products }
}
```

### 3. Apply Project Conventions

Ensure converted code matches project style:

- Use `<script setup lang="ts">` not Options API
- Use `~/` alias for imports
- Follow established component patterns
- Apply consistent naming conventions

### 4. Document Conversion Decisions

Note significant changes from source:

```vue
<!--
  Converted from React component in Lovable export
  Changes:
  - Replaced Chakra UI with shadcn/ui + Tailwind
  - Converted useState hooks to refs
  - Replaced API calls with mock data from useMockProducts
  - Removed authentication logic (using mock auth)
-->
```

## Additional Resources

### Example Files

Working examples in `examples/`:
- **`react-to-vue-conversion.md`** - Step-by-step React conversion
- **`mui-to-tailwind.md`** - Material UI to Tailwind mapping
- **`converted-component.vue`** - Complete converted example

### Reference Files

Detailed guidance in `references/`:
- **`framework-patterns.md`** - Comprehensive pattern mappings
- **`css-framework-guide.md`** - Complete CSS conversion guide
- **`common-pitfalls.md`** - Avoid conversion mistakes

## Summary

✅ **DO:**
- Analyze source code before converting
- Preserve intent and functionality
- Convert to Vue 3 Composition API with `<script setup>`
- Map CSS frameworks to Tailwind
- Replace backend logic with mock data
- Apply Nuxt conventions and project patterns
- Document conversion decisions

❌ **DON'T:**
- Blindly translate line-by-line
- Keep incompatible patterns
- Preserve external dependencies (APIs, databases)
- Use Options API or Vue 2 patterns
- Leave custom CSS instead of Tailwind
- Ignore project structure and conventions

Focus on building idiomatic Vue/Nuxt components that fulfill the same purpose as the source code while conforming to prototype mode's safety boundaries.

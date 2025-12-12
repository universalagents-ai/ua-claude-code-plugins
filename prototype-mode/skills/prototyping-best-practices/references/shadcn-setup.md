# shadcn-vue Setup and Usage

Complete guide for installing and using shadcn-vue in Nuxt projects for rapid prototyping.

## About shadcn-vue

shadcn-vue is a collection of re-usable Vue components built with Radix Vue and Tailwind CSS. Unlike traditional component libraries, shadcn-vue copies component source code into your project, giving you full control and customization.

**Key Benefits for Prototyping:**
- Pre-built, accessible components
- Fully customizable (you own the code)
- Tailwind CSS integration
- TypeScript support
- No runtime dependencies

## Installation

### Prerequisites

Ensure these are installed:
- Nuxt 3
- Tailwind CSS
- TypeScript

### Initial Setup

1. **Initialize shadcn-vue:**

```bash
npx shadcn-vue@latest init
```

2. **Configuration prompts:**

```
Which framework are you using? › Nuxt
Which style would you like to use? › Default
Which color would you like to use as base color? › Slate
Where is your global CSS file? › assets/css/main.css
Would you like to use CSS variables for colors? › Yes
Where is your tailwind.config located? › tailwind.config.ts
Configure the import alias for components: › ~/components
Configure the import alias for utils: › ~/lib/utils
```

3. **Files created:**
- `components/ui/` - Component directory
- `lib/utils.ts` - Utility functions
- Updated `tailwind.config.ts`
- Updated CSS with theme variables

### Verify Installation

Check that setup succeeded:

```bash
ls components/ui/
# Should exist even if empty initially

ls lib/utils.ts
# Should exist with cn() utility function
```

## Adding Components

### CLI Method (Recommended)

Add components individually as needed:

```bash
# Add single component
npx shadcn-vue@latest add button

# Add multiple components
npx shadcn-vue@latest add button card input dialog
```

### Commonly Needed Components

For typical prototypes, install these:

**Forms:**
```bash
npx shadcn-vue@latest add button input textarea select checkbox radio label
```

**Layout:**
```bash
npx shadcn-vue@latest add card separator tabs accordion
```

**Feedback:**
```bash
npx shadcn-vue@latest add toast alert dialog sheet
```

**Data Display:**
```bash
npx shadcn-vue@latest add table badge avatar skeleton
```

**Navigation:**
```bash
npx shadcn-vue@latest add dropdown-menu navigation-menu command
```

### Batch Installation

Install many components at once:

```bash
npx shadcn-vue@latest add \
  button card input textarea select \
  checkbox radio label dialog sheet \
  toast alert badge avatar table \
  tabs accordion separator skeleton \
  dropdown-menu navigation-menu
```

## Component Usage

### Button

```vue
<script setup lang="ts">
import { Button } from '~/components/ui/button'
</script>

<template>
  <div class="space-x-2">
    <Button>Default</Button>
    <Button variant="destructive">Destructive</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="link">Link</Button>
  </div>

  <div class="space-x-2 mt-4">
    <Button size="sm">Small</Button>
    <Button size="default">Default</Button>
    <Button size="lg">Large</Button>
  </div>
</template>
```

### Card

```vue
<script setup lang="ts">
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
</script>

<template>
  <Card class="w-96">
    <CardHeader>
      <CardTitle>Card Title</CardTitle>
      <CardDescription>Card description goes here</CardDescription>
    </CardHeader>
    <CardContent>
      <p>Card content area for your main information.</p>
    </CardContent>
    <CardFooter class="flex justify-between">
      <Button variant="outline">Cancel</Button>
      <Button>Save</Button>
    </CardFooter>
  </Card>
</template>
```

### Form Components

```vue
<script setup lang="ts">
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Label } from '~/components/ui/label'
import { Checkbox } from '~/components/ui/checkbox'
import { Button } from '~/components/ui/button'

const formData = ref({
  name: '',
  email: '',
  message: '',
  subscribe: false
})
</script>

<template>
  <form @submit.prevent class="space-y-4">
    <div class="space-y-2">
      <Label for="name">Name</Label>
      <Input id="name" v-model="formData.name" placeholder="Enter your name" />
    </div>

    <div class="space-y-2">
      <Label for="email">Email</Label>
      <Input id="email" v-model="formData.email" type="email" placeholder="you@example.com" />
    </div>

    <div class="space-y-2">
      <Label for="message">Message</Label>
      <Textarea id="message" v-model="formData.message" placeholder="Type your message..." />
    </div>

    <div class="flex items-center space-x-2">
      <Checkbox id="subscribe" v-model:checked="formData.subscribe" />
      <Label for="subscribe" class="cursor-pointer">Subscribe to newsletter</Label>
    </div>

    <Button type="submit" class="w-full">Submit</Button>
  </form>
</template>
```

### Dialog (Modal)

```vue
<script setup lang="ts">
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

const open = ref(false)
const name = ref('')

const handleSubmit = () => {
  console.log('Submitted:', name.value)
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <Button>Open Dialog</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogDescription>
          Make changes to your profile here. Click save when you're done.
        </DialogDescription>
      </DialogHeader>
      <div class="space-y-4 py-4">
        <div class="space-y-2">
          <Label for="dialog-name">Name</Label>
          <Input id="dialog-name" v-model="name" />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="open = false">Cancel</Button>
        <Button @click="handleSubmit">Save</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
```

### Toast (Notifications)

```vue
<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { useToast } from '~/components/ui/toast'

const { toast } = useToast()

const showToast = () => {
  toast({
    title: 'Success!',
    description: 'Your changes have been saved.',
  })
}

const showError = () => {
  toast({
    title: 'Error',
    description: 'Something went wrong.',
    variant: 'destructive',
  })
}
</script>

<template>
  <div class="space-x-2">
    <Button @click="showToast">Show Toast</Button>
    <Button @click="showError" variant="destructive">Show Error</Button>
  </div>
</template>
```

### Table

```vue
<script setup lang="ts">
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'

const users = [
  { id: 1, name: 'Alex Chen', email: 'alex@example.com', role: 'Admin' },
  { id: 2, name: 'Jordan Taylor', email: 'jordan@example.com', role: 'User' },
  { id: 3, name: 'Sam Rivera', email: 'sam@example.com', role: 'User' },
]
</script>

<template>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Email</TableHead>
        <TableHead>Role</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="user in users" :key="user.id">
        <TableCell class="font-medium">{{ user.name }}</TableCell>
        <TableCell>{{ user.email }}</TableCell>
        <TableCell>{{ user.role }}</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>
```

## Customization

### Theme Colors

Edit `tailwind.config.ts` to change colors:

```typescript
export default {
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        // ... other colors
      }
    }
  }
}
```

Change CSS variables in `assets/css/main.css`:

```css
@layer base {
  :root {
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    /* ... other variables */
  }

  .dark {
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    /* ... other variables */
  }
}
```

### Component Modifications

Since components are in your codebase, modify them directly:

```vue
<!-- components/ui/button/Button.vue -->
<script setup lang="ts">
// Add custom props or logic
const props = defineProps({
  // ... existing props
  loading: Boolean
})
</script>

<template>
  <button>
    <span v-if="loading" class="animate-spin">⏳</span>
    <slot v-else />
  </button>
</template>
```

## Common Patterns

### Form with Validation

```vue
<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Button } from '~/components/ui/button'

const email = ref('')
const password = ref('')
const errors = ref({ email: '', password: '' })

const validate = () => {
  errors.value = { email: '', password: '' }

  if (!email.value) {
    errors.value.email = 'Email is required'
  } else if (!/\S+@\S+\.\S+/.test(email.value)) {
    errors.value.email = 'Email is invalid'
  }

  if (!password.value) {
    errors.value.password = 'Password is required'
  } else if (password.value.length < 8) {
    errors.value.password = 'Password must be at least 8 characters'
  }

  return !errors.value.email && !errors.value.password
}

const handleSubmit = () => {
  if (validate()) {
    console.log('Form submitted:', { email: email.value, password: password.value })
  }
}
</script>

<template>
  <Card class="w-96">
    <CardHeader>
      <CardTitle>Sign In</CardTitle>
    </CardHeader>
    <CardContent>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label for="email">Email</Label>
          <Input
            id="email"
            v-model="email"
            type="email"
            :class="errors.email && 'border-destructive'"
          />
          <p v-if="errors.email" class="text-sm text-destructive">{{ errors.email }}</p>
        </div>

        <div class="space-y-2">
          <Label for="password">Password</Label>
          <Input
            id="password"
            v-model="password"
            type="password"
            :class="errors.password && 'border-destructive'"
          />
          <p v-if="errors.password" class="text-sm text-destructive">{{ errors.password }}</p>
        </div>

        <Button type="submit" class="w-full">Sign In</Button>
      </form>
    </CardContent>
  </Card>
</template>
```

### Loading State with Skeleton

```vue
<script setup lang="ts">
import { Card, CardContent, CardHeader } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'

const loading = ref(true)
const data = ref(null)

onMounted(async () => {
  await new Promise(resolve => setTimeout(resolve, 2000))
  data.value = { name: 'Alex Chen', email: 'alex@example.com' }
  loading.value = false
})
</script>

<template>
  <Card>
    <CardHeader>
      <Skeleton v-if="loading" class="h-6 w-32" />
      <h3 v-else class="text-lg font-semibold">{{ data.name }}</h3>
    </CardHeader>
    <CardContent>
      <Skeleton v-if="loading" class="h-4 w-48" />
      <p v-else>{{ data.email }}</p>
    </CardContent>
  </Card>
</template>
```

## Troubleshooting

### Components Not Found

If imports fail:
1. Verify shadcn-vue was initialized: `ls components/ui/`
2. Check component was added: `ls components/ui/button/`
3. Verify import alias in `nuxt.config.ts`:
   ```typescript
   alias: {
     '~': fileURLToPath(new URL('./', import.meta.url))
   }
   ```

### Styling Issues

If components don't look right:
1. Verify Tailwind CSS is installed and configured
2. Check `assets/css/main.css` includes shadcn variables
3. Ensure `main.css` is imported in `nuxt.config.ts`:
   ```typescript
   css: ['~/assets/css/main.css']
   ```

### TypeScript Errors

If TypeScript complains:
1. Verify `lib/utils.ts` exists with proper types
2. Check component prop types are correct
3. Restart TypeScript server in IDE

## Best Practices

### Component Organization

```
components/
├── ui/              # shadcn-vue components (don't modify)
│   ├── button/
│   ├── card/
│   └── ...
└── custom/          # Your custom components
    ├── UserCard.vue
    └── ProductGrid.vue
```

### Importing Components

Use consistent import style:

```typescript
// Prefer named imports
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'

// Not default imports
import Button from '~/components/ui/button/Button.vue' // Avoid
```

### Prototype-Specific Tips

1. **Install components as needed**: Don't install all components upfront
2. **Use default variants**: Stick with default styling for speed
3. **Leverage composables**: Extract logic from components
4. **Focus on flow**: Polish styling after workflow validation
5. **Document customizations**: Note any component modifications for production

## Component Reference

Quick reference of commonly used components:

| Component | Use Case | Import |
|-----------|----------|--------|
| Button | Actions, submissions | `~/components/ui/button` |
| Card | Content containers | `~/components/ui/card` |
| Input | Text fields | `~/components/ui/input` |
| Dialog | Modals, popups | `~/components/ui/dialog` |
| Toast | Notifications | `~/components/ui/toast` |
| Table | Data display | `~/components/ui/table` |
| Badge | Status indicators | `~/components/ui/badge` |
| Avatar | User images | `~/components/ui/avatar` |
| Tabs | Navigation | `~/components/ui/tabs` |
| Select | Dropdowns | `~/components/ui/select` |

For full component list and documentation, visit: https://www.shadcn-vue.com/

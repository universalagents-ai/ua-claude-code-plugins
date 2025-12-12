# State Management in Prototypes

Guide to managing state in Vue/Nuxt prototypes without production complexity.

## State Management Philosophy for Prototypes

Prototypes prioritize speed and simplicity over scalability:
- **Avoid Pinia** unless absolutely necessary
- **Use composables** with `useState` for shared state
- **Keep state local** when possible
- **Simulate, don't implement** complex state logic

## Local Component State

### ref() for Primitive Values

```vue
<script setup lang="ts">
const count = ref(0)
const name = ref('')
const isOpen = ref(false)

const increment = () => {
  count.value++
}
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>
```

### reactive() for Objects

```vue
<script setup lang="ts">
const form = reactive({
  name: '',
  email: '',
  message: ''
})

const resetForm = () => {
  form.name = ''
  form.email = ''
  form.message = ''
}
</script>

<template>
  <form @submit.prevent>
    <input v-model="form.name" placeholder="Name" />
    <input v-model="form.email" placeholder="Email" type="email" />
    <textarea v-model="form.message" placeholder="Message" />
    <button type="submit">Submit</button>
  </form>
</template>
```

### computed() for Derived State

```vue
<script setup lang="ts">
const products = ref([
  { id: 1, name: 'Product 1', price: 10, quantity: 2 },
  { id: 2, name: 'Product 2', price: 20, quantity: 1 }
])

const total = computed(() =>
  products.value.reduce((sum, p) => sum + p.price * p.quantity, 0)
)

const itemCount = computed(() =>
  products.value.reduce((sum, p) => sum + p.quantity, 0)
)
</script>

<template>
  <div>
    <p>Items: {{ itemCount }}</p>
    <p>Total: ${{ total.toFixed(2) }}</p>
  </div>
</template>
```

## Shared State with Composables

### useState for Global State

Nuxt's `useState` provides SSR-safe global state:

```typescript
// composables/useCart.ts
export const useCart = () => {
  const items = useState('cart', () => [])

  const addItem = (product: any) => {
    items.value.push(product)
  }

  const removeItem = (productId: string) => {
    items.value = items.value.filter(item => item.id !== productId)
  }

  const clearCart = () => {
    items.value = []
  }

  const total = computed(() =>
    items.value.reduce((sum, item) => sum + item.price, 0)
  )

  return {
    items,
    addItem,
    removeItem,
    clearCart,
    total
  }
}
```

**Usage:**

```vue
<script setup lang="ts">
const { items, addItem, total } = useCart()

const product = {
  id: 'prod_001',
  name: 'Wireless Headphones',
  price: 129.99
}
</script>

<template>
  <div>
    <button @click="addItem(product)">Add to Cart</button>
    <p>Cart Total: ${{ total.toFixed(2) }}</p>
    <p>Items: {{ items.length }}</p>
  </div>
</template>
```

### Mock Authentication State

```typescript
// composables/useMockAuth.ts
export const useMockAuth = () => {
  const user = useState('user', () => ({
    id: 'usr_001',
    name: 'Alex Chen',
    email: 'alex@example.com',
    role: 'admin',
    avatar: 'https://i.pravatar.cc/150?img=1'
  }))

  const isAuthenticated = computed(() => user.value !== null)

  const login = async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mock: any credentials work
    user.value = {
      id: 'usr_001',
      name: 'Alex Chen',
      email: email,
      role: 'admin',
      avatar: 'https://i.pravatar.cc/150?img=1'
    }

    return { success: true }
  }

  const logout = () => {
    user.value = null
  }

  const updateProfile = (updates: Partial<typeof user.value>) => {
    user.value = { ...user.value, ...updates }
  }

  return {
    user,
    isAuthenticated,
    login,
    logout,
    updateProfile
  }
}
```

### Mock UI State

```typescript
// composables/useUI.ts
export const useUI = () => {
  const sidebarOpen = useState('sidebarOpen', () => false)
  const theme = useState('theme', () => 'light')
  const notifications = useState('notifications', () => [])

  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value
  }

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  const addNotification = (message: string, type = 'info') => {
    const id = Date.now()
    notifications.value.push({ id, message, type })

    // Auto-remove after 5 seconds
    setTimeout(() => {
      notifications.value = notifications.value.filter(n => n.id !== id)
    }, 5000)
  }

  return {
    sidebarOpen,
    theme,
    notifications,
    toggleSidebar,
    toggleTheme,
    addNotification
  }
}
```

## Form State Management

### Simple Form State

```vue
<script setup lang="ts">
const formData = reactive({
  name: '',
  email: '',
  phone: '',
  message: ''
})

const errors = reactive({
  name: '',
  email: '',
  phone: '',
  message: ''
})

const validateForm = () => {
  // Reset errors
  Object.keys(errors).forEach(key => errors[key] = '')

  let isValid = true

  if (!formData.name) {
    errors.name = 'Name is required'
    isValid = false
  }

  if (!formData.email) {
    errors.email = 'Email is required'
    isValid = false
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = 'Email is invalid'
    isValid = false
  }

  return isValid
}

const handleSubmit = () => {
  if (validateForm()) {
    console.log('Form submitted:', formData)
    // Reset form
    Object.keys(formData).forEach(key => formData[key] = '')
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div>
      <label>Name</label>
      <input v-model="formData.name" />
      <p v-if="errors.name" class="text-red-500">{{ errors.name }}</p>
    </div>
    <!-- other fields -->
    <button type="submit">Submit</button>
  </form>
</template>
```

### Multi-Step Form State

```typescript
// composables/useMultiStepForm.ts
export const useMultiStepForm = () => {
  const currentStep = ref(1)
  const totalSteps = ref(3)

  const formData = reactive({
    // Step 1
    personalInfo: {
      firstName: '',
      lastName: '',
      email: ''
    },
    // Step 2
    addressInfo: {
      street: '',
      city: '',
      zipCode: ''
    },
    // Step 3
    preferences: {
      newsletter: false,
      notifications: true
    }
  })

  const canGoNext = computed(() => currentStep.value < totalSteps.value)
  const canGoPrev = computed(() => currentStep.value > 1)
  const isLastStep = computed(() => currentStep.value === totalSteps.value)

  const nextStep = () => {
    if (canGoNext.value) {
      currentStep.value++
    }
  }

  const prevStep = () => {
    if (canGoPrev.value) {
      currentStep.value--
    }
  }

  const goToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps.value) {
      currentStep.value = step
    }
  }

  const submitForm = () => {
    console.log('Form submitted:', formData)
  }

  return {
    currentStep,
    totalSteps,
    formData,
    canGoNext,
    canGoPrev,
    isLastStep,
    nextStep,
    prevStep,
    goToStep,
    submitForm
  }
}
```

## List State Management

### Managing List Operations

```typescript
// composables/useMockTasks.ts
export const useMockTasks = () => {
  const tasks = useState('tasks', () => [
    { id: 1, title: 'Task 1', completed: false },
    { id: 2, title: 'Task 2', completed: true },
    { id: 3, title: 'Task 3', completed: false }
  ])

  const addTask = (title: string) => {
    const newTask = {
      id: Date.now(),
      title,
      completed: false
    }
    tasks.value.push(newTask)
  }

  const removeTask = (id: number) => {
    tasks.value = tasks.value.filter(task => task.id !== id)
  }

  const toggleTask = (id: number) => {
    const task = tasks.value.find(t => t.id === id)
    if (task) {
      task.completed = !task.completed
    }
  }

  const updateTask = (id: number, updates: Partial<typeof tasks.value[0]>) => {
    const index = tasks.value.findIndex(t => t.id === id)
    if (index !== -1) {
      tasks.value[index] = { ...tasks.value[index], ...updates }
    }
  }

  // Computed values
  const completedTasks = computed(() =>
    tasks.value.filter(t => t.completed)
  )

  const pendingTasks = computed(() =>
    tasks.value.filter(t => !t.completed)
  )

  const completionRate = computed(() => {
    if (tasks.value.length === 0) return 0
    return (completedTasks.value.length / tasks.value.length) * 100
  })

  return {
    tasks,
    addTask,
    removeTask,
    toggleTask,
    updateTask,
    completedTasks,
    pendingTasks,
    completionRate
  }
}
```

### Filtering and Sorting Lists

```vue
<script setup lang="ts">
const products = ref([
  { id: 1, name: 'Product A', price: 100, category: 'Electronics' },
  { id: 2, name: 'Product B', price: 50, category: 'Accessories' },
  { id: 3, name: 'Product C', price: 150, category: 'Electronics' }
])

const searchQuery = ref('')
const selectedCategory = ref('all')
const sortBy = ref('name')
const sortOrder = ref<'asc' | 'desc'>('asc')

const filteredProducts = computed(() => {
  let result = products.value

  // Filter by search
  if (searchQuery.value) {
    result = result.filter(p =>
      p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Filter by category
  if (selectedCategory.value !== 'all') {
    result = result.filter(p => p.category === selectedCategory.value)
  }

  // Sort
  result = [...result].sort((a, b) => {
    const aVal = a[sortBy.value]
    const bVal = b[sortBy.value]

    if (sortOrder.value === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  return result
})
</script>
```

## Modal and Dialog State

### Simple Modal State

```vue
<script setup lang="ts">
const isModalOpen = ref(false)
const modalData = ref(null)

const openModal = (data: any) => {
  modalData.value = data
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  modalData.value = null
}

const confirmAction = () => {
  console.log('Action confirmed:', modalData.value)
  closeModal()
}
</script>

<template>
  <div>
    <button @click="openModal({ id: 1, name: 'Item 1' })">
      Open Modal
    </button>

    <Dialog v-model:open="isModalOpen">
      <DialogContent>
        <DialogTitle>Confirm Action</DialogTitle>
        <p>Are you sure you want to proceed with {{ modalData?.name }}?</p>
        <DialogFooter>
          <Button @click="closeModal">Cancel</Button>
          <Button @click="confirmAction">Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
```

### Global Modal Manager

```typescript
// composables/useModals.ts
export const useModals = () => {
  const modals = useState('modals', () => ({
    confirmDialog: { open: false, data: null },
    editDialog: { open: false, data: null },
    detailsDialog: { open: false, data: null }
  }))

  const openConfirm = (data: any) => {
    modals.value.confirmDialog = { open: true, data }
  }

  const closeConfirm = () => {
    modals.value.confirmDialog = { open: false, data: null }
  }

  const openEdit = (data: any) => {
    modals.value.editDialog = { open: true, data }
  }

  const closeEdit = () => {
    modals.value.editDialog = { open: false, data: null }
  }

  return {
    modals,
    openConfirm,
    closeConfirm,
    openEdit,
    closeEdit
  }
}
```

## Async State

### Loading and Error States

```typescript
// composables/useAsyncState.ts
export const useAsyncState = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const data = ref(null)

  const execute = async (asyncFunction: () => Promise<any>) => {
    loading.value = true
    error.value = null

    try {
      data.value = await asyncFunction()
    } catch (e) {
      error.value = e.message || 'An error occurred'
    } finally {
      loading.value = false
    }
  }

  return { loading, error, data, execute }
}
```

**Usage:**

```vue
<script setup lang="ts">
const { loading, error, data, execute } = useAsyncState()

const loadUsers = async () => {
  await execute(async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    return [
      { id: 1, name: 'Alex' },
      { id: 2, name: 'Jordan' }
    ]
  })
}

onMounted(() => {
  loadUsers()
})
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="error">Error: {{ error }}</div>
  <div v-else>
    <div v-for="user in data" :key="user.id">
      {{ user.name }}
    </div>
  </div>
</template>
```

## When to Use Pinia

### Avoid Pinia for Prototypes Unless...

Use Pinia only if you need:
1. **DevTools debugging**: Inspect state changes during development
2. **Complex state logic**: Multiple related pieces of state
3. **Plugins**: Hot module replacement, persistence plugins

**For prototypes, composables with `useState` are usually sufficient.**

### Minimal Pinia Store Example

If you must use Pinia:

```typescript
// stores/cart.ts
import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])

  const addItem = (product: any) => {
    items.value.push(product)
  }

  const total = computed(() =>
    items.value.reduce((sum, item) => sum + item.price, 0)
  )

  return { items, addItem, total }
})
```

## Best Practices for Prototype State

### 1. Keep It Simple

```typescript
// Good: Simple composable
export const useCounter = () => {
  const count = useState('count', () => 0)
  const increment = () => count.value++
  return { count, increment }
}

// Overkill: Complex store for simple state
export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  getters: { double: (state) => state.count * 2 },
  actions: { increment() { this.count++ } }
})
```

### 2. Use Local State When Possible

```vue
<!-- Good: Local state for component-only data -->
<script setup lang="ts">
const isOpen = ref(false)
</script>

<!-- Avoid: Global state for component-only data -->
<script setup lang="ts">
const { isModalOpen } = useGlobalModalState()
</script>
```

### 3. Name State Keys Clearly

```typescript
// Good: Descriptive keys
const user = useState('currentUser', () => null)
const cart = useState('shoppingCart', () => [])

// Bad: Generic keys
const data = useState('data', () => null)
const state = useState('state', () => {})
```

### 4. Provide Default Values

```typescript
// Good: Always provide defaults
const count = useState('count', () => 0)
const items = useState('items', () => [])
const user = useState('user', () => null)

// Bad: Undefined defaults
const count = useState('count')
const items = useState('items')
```

### 5. Use Computed for Derived State

```typescript
// Good: Computed for calculations
const items = ref([...])
const total = computed(() => items.value.reduce(...))

// Avoid: Separate state that needs syncing
const items = ref([...])
const total = ref(0)
// Need to manually update total when items change
```

## Summary

For prototypes, follow this hierarchy:
1. **Local state** (`ref`, `reactive`) - Use by default
2. **Composables with `useState`** - For shared state
3. **Pinia** - Only if absolutely necessary

Focus on functionality, not scalability. Keep state management simple and easy to understand.

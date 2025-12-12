---
name: User Journey & Feature Flow Design
description: This skill should be used when the user asks to "design a user journey", "map the user flow", "design the feature flow", "create a user experience", "plan the UX", "design the interaction flow", or mentions user journeys, feature flows, UX design, user experience patterns, or interface workflows. Provides comprehensive guidance for designing and implementing user-centered feature flows with frontend-design integration.
version: 0.1.0
---

# User Journey & Feature Flow Design

## Purpose

This skill provides systematic guidance for designing user journeys and feature flows in prototypes. It focuses on understanding user needs, mapping interaction flows, implementing UX patterns, and creating realistic, polished interfaces through integration with the frontend-design skill.

## When to Use This Skill

Use this skill when:
- Designing user journeys for new features
- Mapping interaction flows and user paths
- Planning UX for complex workflows
- Creating user-centered prototypes
- Implementing realistic state transitions
- Building multi-step processes or wizards

## Core Principles

### User-Centered Design

Start with user needs, not technical implementation:

1. **Identify user goals**: What does the user want to accomplish?
2. **Map user actions**: What steps must they take?
3. **Design touch points**: Where do users interact with the system?
4. **Plan feedback**: How does the system respond to user actions?
5. **Consider edge cases**: What happens when things go wrong?

### Flow-First Approach

Design the complete journey before implementing details:

1. **Define entry points**: How do users start this flow?
2. **Map happy path**: Ideal flow with no errors
3. **Identify branch points**: Where do users make choices?
4. **Plan error scenarios**: What can go wrong and how to recover?
5. **Define exit points**: How does the flow complete?

### Realistic State Representation

Every feature flow includes multiple states:

- **Initial state**: Before user interaction
- **Loading state**: During async operations
- **Success state**: When operations complete successfully
- **Error state**: When operations fail
- **Empty state**: When no data exists
- **Partial state**: When data is incomplete

## User Journey Mapping Process

### Step 1: Define User Goal

Start by clearly articulating what the user wants to achieve:

**Example: E-commerce Checkout**
- User goal: Complete purchase of items in cart
- Success criteria: Payment processed, order confirmed, receipt provided

**Example: User Dashboard**
- User goal: View activity metrics and recent actions
- Success criteria: Metrics displayed, data is current, interactions are clear

### Step 2: Identify User Persona

Understand who will use this feature:

**Consider:**
- Role (admin, user, guest)
- Technical proficiency (beginner, intermediate, expert)
- Context (desktop, mobile, tablet)
- Accessibility needs
- Familiarity with similar systems

### Step 3: Map User Flow

Visualize the complete journey:

**Flow Components:**
1. **Entry point**: Where user enters flow (button click, navigation, URL)
2. **Steps**: Sequential actions user takes
3. **Decision points**: Where user makes choices
4. **Feedback**: System responses to actions
5. **Exit point**: Where flow completes or cancels

**Example: User Registration Flow**

```
Entry: "Sign Up" button on homepage
  ↓
Step 1: Enter email and password
  ↓
Decision: Email already registered?
  ├─ Yes → Show error, suggest login
  └─ No → Continue
      ↓
Step 2: Enter profile information
  ↓
Step 3: Confirm email address
  ↓
Decision: Email confirmed?
  ├─ Yes → Show success, redirect to dashboard
  └─ No → Show pending state, allow resend
      ↓
Exit: User reaches dashboard or remains on confirmation screen
```

### Step 4: Design Screen States

For each step in the flow, design all possible states:

**Example: Product List Screen**

1. **Loading state**: Skeleton loaders while fetching products
2. **Success state**: Grid of product cards with data
3. **Empty state**: "No products found" with helpful message
4. **Error state**: "Failed to load products" with retry button
5. **Partial state**: Some products loaded, some still loading

### Step 5: Plan Transitions

Define how users move between states:

- **Smooth animations**: Fade, slide, or scale transitions
- **Loading indicators**: Spinners, progress bars, skeleton loaders
- **Optimistic updates**: Immediately show expected result
- **Rollback handling**: Undo changes if operation fails

## Integration with frontend-design Skill

### When to Invoke frontend-design

Explicitly invoke the frontend-design skill for:

1. **Page layouts**: Creating overall page structure
2. **Component design**: Designing individual UI components
3. **Visual polish**: Applying professional styling and aesthetics
4. **Responsive design**: Ensuring mobile/tablet compatibility
5. **Design system consistency**: Matching brand and style guides

### Workflow Integration

Combine user journey design with frontend-design:

**Step 1**: Map user journey (this skill)
- Define user goal
- Map flow steps
- Identify required states

**Step 2**: Design UI components (frontend-design skill)
- Create page layouts
- Design individual components
- Apply professional styling

**Step 3**: Implement with mock data (prototyping-best-practices skill)
- Build components with mock data
- Implement state transitions
- Test user flows

**Example Workflow:**

```
User: "Design a user dashboard showing activity metrics"

1. User Journey Design (this skill):
   - Goal: View current activity and recent actions
   - Flow: Land on dashboard → See overview → Explore details
   - States: Loading, populated, empty, error

2. Frontend Design (invoke frontend-design skill):
   - Layout: Header with metrics cards, table of recent activity
   - Components: Metric cards, activity table, filter controls
   - Styling: Professional, accessible, responsive

3. Implementation (prototyping-best-practices):
   - Mock metrics data
   - Build components with mock data
   - Add loading/error/empty states
```

### Invoking frontend-design

When ready to design UI, explicitly reference frontend-design:

```
"Now that we've mapped the user journey, let's use the frontend-design
skill to create professional, polished UI components for this flow."
```

## Detailed UX Patterns

### Loading States

Provide clear feedback during async operations:

**Pattern 1: Skeleton Loaders**

Use for content that will appear in specific locations:

```vue
<template>
  <div v-if="loading" class="space-y-4">
    <Skeleton class="h-12 w-full" />
    <Skeleton class="h-12 w-full" />
    <Skeleton class="h-12 w-full" />
  </div>
  <div v-else>
    <!-- Actual content -->
  </div>
</template>
```

**Pattern 2: Spinners**

Use for operations with unknown duration:

```vue
<template>
  <div v-if="loading" class="flex items-center justify-center p-12">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    <p class="ml-4 text-muted-foreground">Loading...</p>
  </div>
</template>
```

**Pattern 3: Progress Bars**

Use for operations with known progress:

```vue
<template>
  <div v-if="uploading">
    <div class="w-full bg-secondary rounded-full h-2">
      <div
        class="bg-primary h-2 rounded-full transition-all"
        :style="{ width: `${uploadProgress}%` }"
      ></div>
    </div>
    <p class="text-sm text-muted-foreground mt-2">
      Uploading... {{ uploadProgress }}%
    </p>
  </div>
</template>
```

### Error States

Handle failures gracefully with clear messaging:

**Pattern 1: Inline Errors**

For form validation and field-level errors:

```vue
<template>
  <div class="space-y-2">
    <Label for="email">Email</Label>
    <Input
      id="email"
      v-model="email"
      :class="emailError && 'border-destructive'"
    />
    <p v-if="emailError" class="text-sm text-destructive">
      {{ emailError }}
    </p>
  </div>
</template>
```

**Pattern 2: Banner Errors**

For page-level or section-level errors:

```vue
<template>
  <Alert v-if="error" variant="destructive" class="mb-4">
    <AlertCircle class="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>
      {{ error }}
    </AlertDescription>
    <Button @click="retry" variant="outline" size="sm" class="mt-2">
      Try Again
    </Button>
  </Alert>
</template>
```

**Pattern 3: Modal Errors**

For critical errors requiring user attention:

```vue
<template>
  <Dialog v-model:open="showErrorDialog">
    <DialogContent>
      <DialogHeader>
        <DialogTitle class="text-destructive">Something went wrong</DialogTitle>
        <DialogDescription>
          {{ errorMessage }}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button @click="showErrorDialog = false">Close</Button>
        <Button @click="retry" variant="default">Retry</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
```

### Empty States

Provide guidance when no data exists:

**Pattern 1: First-Time Empty**

When user hasn't created any content yet:

```vue
<template>
  <Card v-if="projects.length === 0">
    <CardContent class="flex flex-col items-center justify-center py-12">
      <div class="w-16 h-16 mb-4 text-muted-foreground">
        <svg><!-- Icon --></svg>
      </div>
      <h3 class="text-lg font-semibold mb-2">No projects yet</h3>
      <p class="text-sm text-muted-foreground mb-4 text-center">
        Get started by creating your first project
      </p>
      <Button @click="createProject">Create Project</Button>
    </CardContent>
  </Card>
</template>
```

**Pattern 2: Search/Filter Empty**

When filters produce no results:

```vue
<template>
  <Card v-if="filteredItems.length === 0">
    <CardContent class="py-12 text-center">
      <p class="text-lg font-semibold mb-2">No results found</p>
      <p class="text-sm text-muted-foreground mb-4">
        Try adjusting your search criteria or filters
      </p>
      <Button @click="clearFilters" variant="outline">Clear Filters</Button>
    </CardContent>
  </Card>
</template>
```

**Pattern 3: Temporary Empty**

When data existed but was deleted:

```vue
<template>
  <Card v-if="items.length === 0">
    <CardContent class="py-12 text-center">
      <p class="text-lg font-semibold mb-2">All items have been removed</p>
      <p class="text-sm text-muted-foreground mb-4">
        Add new items to see them here
      </p>
      <Button @click="addItem">Add Item</Button>
    </CardContent>
  </Card>
</template>
```

### Success States

Confirm successful operations:

**Pattern 1: Toast Notifications**

For non-critical confirmations:

```typescript
const { toast } = useToast()

const saveChanges = async () => {
  // Mock save operation
  await new Promise(resolve => setTimeout(resolve, 500))

  toast({
    title: 'Changes saved',
    description: 'Your profile has been updated successfully.',
  })
}
```

**Pattern 2: Success Pages**

For critical completions (checkout, registration):

```vue
<template>
  <Card class="max-w-md mx-auto mt-12">
    <CardContent class="pt-12 pb-12 text-center">
      <div class="w-16 h-16 mx-auto mb-4 text-green-500">
        <svg><!-- Checkmark icon --></svg>
      </div>
      <h2 class="text-2xl font-bold mb-2">Order Confirmed!</h2>
      <p class="text-muted-foreground mb-6">
        Your order #12345 has been placed successfully
      </p>
      <Button @click="viewOrder" class="w-full">View Order Details</Button>
    </CardContent>
  </Card>
</template>
```

## Multi-Step Flows

### Wizard Pattern

For sequential, linear processes:

**Components:**
1. **Progress indicator**: Show current step
2. **Step content**: Current step UI
3. **Navigation**: Next/Previous buttons
4. **Validation**: Prevent forward movement if invalid

**Example: Onboarding Wizard**

```vue
<script setup lang="ts">
const currentStep = ref(1)
const totalSteps = 3

const steps = [
  { number: 1, title: 'Account Info', component: 'StepAccount' },
  { number: 2, title: 'Preferences', component: 'StepPreferences' },
  { number: 3, title: 'Confirmation', component: 'StepConfirmation' }
]

const canGoNext = computed(() => {
  // Validate current step
  return validateCurrentStep()
})

const nextStep = () => {
  if (canGoNext.value && currentStep.value < totalSteps) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}
</script>

<template>
  <Card class="max-w-2xl mx-auto">
    <CardHeader>
      <CardTitle>Setup Your Account</CardTitle>
      <!-- Progress indicator -->
      <div class="flex gap-2 mt-4">
        <div
          v-for="step in steps"
          :key="step.number"
          class="flex-1 h-2 rounded-full"
          :class="step.number <= currentStep ? 'bg-primary' : 'bg-secondary'"
        ></div>
      </div>
      <p class="text-sm text-muted-foreground mt-2">
        Step {{ currentStep }} of {{ totalSteps }}: {{ steps[currentStep - 1].title }}
      </p>
    </CardHeader>
    <CardContent>
      <!-- Step content -->
      <component :is="steps[currentStep - 1].component" />
    </CardContent>
    <CardFooter class="flex justify-between">
      <Button
        @click="prevStep"
        variant="outline"
        :disabled="currentStep === 1"
      >
        Previous
      </Button>
      <Button
        @click="nextStep"
        :disabled="!canGoNext"
      >
        {{ currentStep === totalSteps ? 'Finish' : 'Next' }}
      </Button>
    </CardFooter>
  </Card>
</template>
```

### Tab-Based Navigation

For non-linear, exploratory flows:

```vue
<script setup lang="ts">
const activeTab = ref('overview')

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'details', label: 'Details' },
  { id: 'settings', label: 'Settings' }
]
</script>

<template>
  <Tabs v-model="activeTab">
    <TabsList>
      <TabsTrigger
        v-for="tab in tabs"
        :key="tab.id"
        :value="tab.id"
      >
        {{ tab.label }}
      </TabsTrigger>
    </TabsList>
    <TabsContent value="overview">
      <!-- Overview content -->
    </TabsContent>
    <TabsContent value="details">
      <!-- Details content -->
    </TabsContent>
    <TabsContent value="settings">
      <!-- Settings content -->
    </TabsContent>
  </Tabs>
</template>
```

## Interaction Patterns

### Confirmation Dialogs

For destructive or important actions:

```vue
<script setup lang="ts">
const showConfirm = ref(false)
const itemToDelete = ref(null)

const confirmDelete = (item: any) => {
  itemToDelete.value = item
  showConfirm.value = true
}

const executeDelete = () => {
  console.log('Deleting:', itemToDelete.value)
  // Mock delete operation
  showConfirm.value = false
  itemToDelete.value = null
}
</script>

<template>
  <Dialog v-model:open="showConfirm">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete "{{ itemToDelete?.name }}"?
          This action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button @click="showConfirm = false" variant="outline">Cancel</Button>
        <Button @click="executeDelete" variant="destructive">Delete</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
```

### Optimistic Updates

Immediately show expected result:

```vue
<script setup lang="ts">
const items = ref([...])

const toggleFavorite = async (itemId: string) => {
  // Find item
  const item = items.value.find(i => i.id === itemId)
  if (!item) return

  // Optimistic update
  const previousState = item.favorited
  item.favorited = !item.favorited

  try {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500))

    // If success, keep the update
    console.log('Favorite toggled successfully')
  } catch (error) {
    // If error, rollback
    item.favorited = previousState
    toast({
      title: 'Error',
      description: 'Failed to update favorite',
      variant: 'destructive'
    })
  }
}
</script>
```

## Accessibility Considerations

### Keyboard Navigation

Ensure all interactive elements are keyboard accessible:

- Use semantic HTML (`<button>`, `<a>`, `<input>`)
- Provide visible focus indicators
- Support tab navigation
- Handle Enter and Space for activation

### Screen Reader Support

Provide meaningful labels and descriptions:

```vue
<template>
  <Button aria-label="Delete user Alex Chen">
    <TrashIcon aria-hidden="true" />
  </Button>

  <div role="status" aria-live="polite">
    <p v-if="loading">Loading users...</p>
  </div>
</template>
```

### Color and Contrast

Ensure sufficient contrast and don't rely solely on color:

- Use icons in addition to color
- Provide text labels
- Ensure 4.5:1 contrast ratio minimum

## Additional Resources

### Example Files

Working examples in `examples/`:
- **`checkout-flow.vue`** - Complete multi-step checkout
- **`dashboard-states.vue`** - All state patterns
- **`wizard-component.vue`** - Wizard pattern implementation

### Reference Files

Detailed guidance in `references/`:
- **`ux-patterns-catalog.md`** - Comprehensive UX patterns
- **`flow-mapping-guide.md`** - User flow mapping techniques
- **`frontend-design-integration.md`** - Working with frontend-design skill

## Best Practices Summary

✅ **DO:**
- Start with user goals and needs
- Map complete flows before implementing
- Include all states (loading, error, empty, success)
- Invoke frontend-design skill for UI design
- Test user journeys with realistic mock data
- Provide clear feedback for all actions
- Consider accessibility from the start

❌ **DON'T:**
- Jump into implementation without planning flow
- Skip error and edge case scenarios
- Forget loading and empty states
- Ignore keyboard navigation
- Rely solely on color for meaning
- Design without considering mobile/responsive
- Overlook user feedback and confirmation

Focus on creating intuitive, realistic user experiences that feel production-ready.

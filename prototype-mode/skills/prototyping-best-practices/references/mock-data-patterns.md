# Mock Data Patterns Reference

Comprehensive guide to creating and managing mock data for prototypes.

## Data Structure Patterns

### Relational Data with IDs

When mocking relational data, maintain ID references across files:

**users.json:**
```json
{
  "users": [
    { "id": "usr_001", "name": "Alex", "teamId": "team_001" },
    { "id": "usr_002", "name": "Jordan", "teamId": "team_001" }
  ]
}
```

**teams.json:**
```json
{
  "teams": [
    {
      "id": "team_001",
      "name": "Engineering",
      "memberIds": ["usr_001", "usr_002"]
    }
  ]
}
```

### Paginated Responses

Mock API pagination structures:

```json
{
  "data": [
    { "id": 1, "name": "Item 1" },
    { "id": 2, "name": "Item 2" }
  ],
  "pagination": {
    "page": 1,
    "perPage": 20,
    "total": 156,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Nested Resources

For hierarchical data:

```json
{
  "project": {
    "id": "proj_001",
    "name": "Website Redesign",
    "owner": {
      "id": "usr_001",
      "name": "Alex Chen",
      "avatar": "https://i.pravatar.cc/150?img=1"
    },
    "tasks": [
      {
        "id": "task_001",
        "title": "Design mockups",
        "assignee": {
          "id": "usr_002",
          "name": "Jordan Taylor"
        },
        "status": "completed"
      }
    ],
    "stats": {
      "totalTasks": 24,
      "completedTasks": 18,
      "progress": 75
    }
  }
}
```

### Time-Series Data

For charts and graphs:

```json
{
  "metrics": {
    "name": "User Signups",
    "period": "daily",
    "data": [
      { "timestamp": "2024-12-01T00:00:00Z", "value": 45 },
      { "timestamp": "2024-12-02T00:00:00Z", "value": 52 },
      { "timestamp": "2024-12-03T00:00:00Z", "value": 48 },
      { "timestamp": "2024-12-04T00:00:00Z", "value": 61 },
      { "timestamp": "2024-12-05T00:00:00Z", "value": 58 }
    ]
  }
}
```

## Realistic Data Generation

### Using Placeholder Services

**Avatars:**
- https://i.pravatar.cc/150?img=1 (numbered 1-70)
- https://ui-avatars.com/api/?name=Alex+Chen&background=random

**Images:**
- https://placehold.co/600x400/3b82f6/white?text=Product
- https://picsum.photos/600/400 (random photos)

**Names and Emails:**
Use realistic but fake names:
- Alex Chen, alex.chen@example.com
- Jordan Taylor, jordan.taylor@example.com
- Sam Rivera, sam.rivera@example.com

**Dates:**
Use ISO 8601 format:
- 2024-12-05T14:30:00Z (UTC)
- 2024-12-05T14:30:00-08:00 (with timezone)

### Data Variety

Include diverse scenarios:

**User statuses:**
```json
[
  { "status": "active", "count": 892 },
  { "status": "inactive", "count": 245 },
  { "status": "suspended", "count": 23 },
  { "status": "pending", "count": 87 }
]
```

**Edge cases:**
```json
[
  { "name": "", "description": "Empty name" },
  { "name": "A", "description": "Single character" },
  {
    "name": "Very Long Product Name That Exceeds Normal Length Expectations",
    "description": "Test text overflow"
  },
  { "name": "Product", "description": null },
  { "name": "Special Chars: <>&\"'", "description": "HTML entities" }
]
```

## Loading Patterns

### Async Data Loading

Simulate realistic API delays:

```typescript
export const useMockData = () => {
  const data = ref(null)
  const loading = ref(true)
  const error = ref(null)

  const fetchData = async () => {
    loading.value = true
    error.value = null

    try {
      // Simulate network delay (500-1500ms)
      const delay = 500 + Math.random() * 1000
      await new Promise(resolve => setTimeout(resolve, delay))

      // Your mock data
      data.value = { /* ... */ }
    } catch (e) {
      error.value = 'Failed to load data'
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, fetchData }
}
```

### Progressive Loading

For large datasets:

```typescript
export const useMockInfiniteScroll = () => {
  const items = ref([])
  const page = ref(1)
  const hasMore = ref(true)
  const loading = ref(false)

  const loadMore = async () => {
    if (loading.value || !hasMore.value) return

    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 800))

    // Generate 20 more items
    const newItems = Array.from({ length: 20 }, (_, i) => ({
      id: `item_${(page.value - 1) * 20 + i + 1}`,
      name: `Item ${(page.value - 1) * 20 + i + 1}`
    }))

    items.value.push(...newItems)
    page.value++

    // Stop after 5 pages
    if (page.value > 5) {
      hasMore.value = false
    }

    loading.value = false
  }

  return { items, loading, hasMore, loadMore }
}
```

## State Simulation

### Form Validation

Mock validation without backend:

```typescript
export const useMockValidation = () => {
  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const validateUsername = async (username: string) => {
    // Simulate API check
    await new Promise(resolve => setTimeout(resolve, 500))

    // Mock: "admin" and "test" are taken
    const taken = ['admin', 'test', 'root']
    return !taken.includes(username.toLowerCase())
  }

  const validatePassword = (password: string) => {
    return {
      isValid: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*]/.test(password)
    }
  }

  return { validateEmail, validateUsername, validatePassword }
}
```

### Authentication State

Mock login/logout:

```typescript
export const useMockAuth = () => {
  const user = useState('mockUser', () => null)
  const isAuthenticated = computed(() => user.value !== null)

  const login = async (email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mock: any email/password works
    user.value = {
      id: 'usr_001',
      name: 'Alex Chen',
      email: email,
      role: 'admin'
    }

    return { success: true }
  }

  const logout = async () => {
    await new Promise(resolve => setTimeout(resolve, 300))
    user.value = null
  }

  return { user, isAuthenticated, login, logout }
}
```

### Real-time Updates

Simulate live data:

```typescript
export const useMockRealtime = () => {
  const notifications = ref([])
  const unreadCount = computed(() =>
    notifications.value.filter(n => !n.read).length
  )

  // Simulate new notifications every 10-20 seconds
  const startSimulation = () => {
    const interval = setInterval(() => {
      const messages = [
        'New user registered',
        'Payment received',
        'Task completed',
        'Report generated'
      ]

      notifications.value.unshift({
        id: `notif_${Date.now()}`,
        message: messages[Math.floor(Math.random() * messages.length)],
        timestamp: new Date().toISOString(),
        read: false
      })

      // Keep only last 10
      if (notifications.value.length > 10) {
        notifications.value = notifications.value.slice(0, 10)
      }
    }, 10000 + Math.random() * 10000)

    return () => clearInterval(interval)
  }

  const markAsRead = (id: string) => {
    const notif = notifications.value.find(n => n.id === id)
    if (notif) notif.read = true
  }

  return { notifications, unreadCount, startSimulation, markAsRead }
}
```

## File Organization

### Recommended Structure

```
mocks/
├── auth/
│   ├── users.json
│   └── sessions.json
├── products/
│   ├── products.json
│   ├── categories.json
│   └── reviews.json
├── analytics/
│   ├── dashboard.json
│   └── reports.json
└── shared/
    └── constants.json

composables/
├── useMockAuth.ts
├── useMockProducts.ts
├── useMockAnalytics.ts
└── index.ts (re-exports)
```

### Composable Organization

Group related functionality:

```typescript
// composables/useMockProducts.ts
export const useMockProducts = () => {
  const products = ref(mockData)
  const categories = ref(categoriesData)

  const getProduct = (id: string) => {
    return products.value.find(p => p.id === id)
  }

  const getProductsByCategory = (categoryId: string) => {
    return products.value.filter(p => p.categoryId === categoryId)
  }

  return { products, categories, getProduct, getProductsByCategory }
}
```

## Best Practices

### 1. Maintain Consistency

Use consistent ID formats:
- Users: `usr_001`, `usr_002`
- Products: `prod_001`, `prod_002`
- Orders: `ord_001`, `ord_002`

### 2. Reference Integrity

Ensure IDs exist when referenced:
```typescript
// Bad: orphaned reference
{ "userId": "usr_999" } // usr_999 doesn't exist

// Good: valid reference
{ "userId": "usr_001" } // usr_001 exists in users.json
```

### 3. Realistic Timestamps

Use recent, realistic dates:
```javascript
// Bad: hardcoded old date
"createdAt": "2020-01-01T00:00:00Z"

// Good: recent relative date
const createdAt = new Date()
createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30))
```

### 4. Proper Null Handling

Include null/undefined cases:
```json
{
  "user": {
    "id": "usr_001",
    "name": "Alex Chen",
    "avatar": "https://...",
    "bio": null,
    "website": null,
    "phone": "+1234567890"
  }
}
```

### 5. Error Scenarios

Include error cases for testing:
```typescript
export const useMockDataWithErrors = () => {
  const simulateError = ref(false)

  const fetchData = async () => {
    if (simulateError.value) {
      throw new Error('Simulated network error')
    }
    return mockData
  }

  return { fetchData, simulateError }
}
```

## Testing Different States

### Empty States

```typescript
const products = ref([]) // Test empty product list
const searchResults = ref([]) // Test no search results
```

### Loading States

```typescript
const loading = ref(true)
setTimeout(() => { loading.value = false }, 2000)
```

### Error States

```typescript
const error = ref('Failed to load data. Please try again.')
```

### Success States

```typescript
const success = ref(true)
const message = ref('Changes saved successfully!')
setTimeout(() => { success.value = false }, 3000)
```

## Advanced Patterns

### Optimistic Updates

```typescript
export const useMockOptimistic = () => {
  const items = ref(mockItems)

  const addItem = async (item: any) => {
    // Add immediately (optimistic)
    const tempId = `temp_${Date.now()}`
    items.value.push({ ...item, id: tempId })

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Replace temp ID with real ID
    const index = items.value.findIndex(i => i.id === tempId)
    if (index !== -1) {
      items.value[index].id = `item_${items.value.length}`
    }
  }

  return { items, addItem }
}
```

### Cached Data

```typescript
export const useMockCache = () => {
  const cache = new Map()

  const getData = async (key: string) => {
    if (cache.has(key)) {
      return cache.get(key)
    }

    await new Promise(resolve => setTimeout(resolve, 1000))
    const data = { /* mock data */ }
    cache.set(key, data)
    return data
  }

  const clearCache = () => cache.clear()

  return { getData, clearCache }
}
```

### Debounced Search

```typescript
export const useMockSearch = () => {
  const query = ref('')
  const results = ref([])
  const loading = ref(false)

  const search = async (searchQuery: string) => {
    loading.value = true

    // Simulate API search delay
    await new Promise(resolve => setTimeout(resolve, 500))

    results.value = mockData.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    loading.value = false
  }

  // Debounce search
  watch(query, (newQuery) => {
    const timeout = setTimeout(() => {
      search(newQuery)
    }, 300)

    return () => clearTimeout(timeout)
  })

  return { query, results, loading }
}
```

## Conversion to Production

When moving from prototype to production:

1. **Document data structures**: Note all mock data schemas
2. **Identify API endpoints**: List where each mock data source should come from
3. **Map relationships**: Document how entities relate
4. **Note edge cases**: Highlight scenarios tested with mock data
5. **Provide examples**: Include mock data as API response examples

Create a handoff document:

```markdown
## Mock Data to Production API Mapping

### Users
- Mock: `mocks/users.json`
- Production: `GET /api/users`
- Schema: { id, name, email, role, ... }

### Products
- Mock: `mocks/products.json`
- Production: `GET /api/products`
- Schema: { id, name, price, stock, ... }
- Relationships: products.categoryId → categories.id

### Edge Cases Tested
- Empty user list
- Out of stock products
- Long product names (>50 chars)
- Missing user avatars (null values)
```

This ensures smooth transition from prototype to production.

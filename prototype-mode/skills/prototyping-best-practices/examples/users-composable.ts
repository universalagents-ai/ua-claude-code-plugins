// Example: Mock users composable for prototyping
// Location: composables/useMockUsers.ts

export const useMockUsers = () => {
  // Mock user data - in production, this would fetch from API
  const users = ref([
    {
      id: 'usr_001',
      name: 'Alex Chen',
      email: 'alex.chen@example.com',
      avatar: 'https://i.pravatar.cc/150?img=1',
      role: 'admin',
      status: 'active',
      createdAt: '2024-01-15T10:30:00Z',
      lastLogin: '2024-12-05T08:45:00Z',
      preferences: {
        theme: 'dark',
        notifications: true,
        language: 'en'
      },
      stats: {
        projectsCreated: 12,
        tasksCompleted: 89,
        hoursLogged: 156
      }
    },
    {
      id: 'usr_002',
      name: 'Jordan Taylor',
      email: 'jordan.taylor@example.com',
      avatar: 'https://i.pravatar.cc/150?img=2',
      role: 'user',
      status: 'active',
      createdAt: '2024-02-20T14:45:00Z',
      lastLogin: '2024-12-04T16:20:00Z',
      preferences: {
        theme: 'light',
        notifications: false,
        language: 'en'
      },
      stats: {
        projectsCreated: 5,
        tasksCompleted: 34,
        hoursLogged: 67
      }
    },
    {
      id: 'usr_003',
      name: 'Sam Rivera',
      email: 'sam.rivera@example.com',
      avatar: 'https://i.pravatar.cc/150?img=3',
      role: 'user',
      status: 'inactive',
      createdAt: '2024-03-10T09:15:00Z',
      lastLogin: '2024-11-28T11:30:00Z',
      preferences: {
        theme: 'dark',
        notifications: true,
        language: 'es'
      },
      stats: {
        projectsCreated: 2,
        tasksCompleted: 15,
        hoursLogged: 23
      }
    }
  ])

  const loading = ref(false)
  const error = ref<string | null>(null)

  // Simulate async data loading (optional)
  const fetchUsers = async () => {
    loading.value = true
    error.value = null

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800))

    // Simulate occasional errors (10% chance)
    if (Math.random() < 0.1) {
      error.value = 'Failed to load users. Please try again.'
      loading.value = false
      return
    }

    loading.value = false
  }

  // Mock user actions
  const updateUser = async (userId: string, updates: Partial<typeof users.value[0]>) => {
    // In production: await $fetch(`/api/users/${userId}`, { method: 'PATCH', body: updates })
    console.log('Mock: Updating user', userId, updates)

    const userIndex = users.value.findIndex(u => u.id === userId)
    if (userIndex !== -1) {
      users.value[userIndex] = { ...users.value[userIndex], ...updates }
    }

    return { success: true }
  }

  const deleteUser = async (userId: string) => {
    // In production: await $fetch(`/api/users/${userId}`, { method: 'DELETE' })
    console.log('Mock: Deleting user', userId)

    users.value = users.value.filter(u => u.id !== userId)

    return { success: true }
  }

  const createUser = async (userData: Omit<typeof users.value[0], 'id' | 'createdAt'>) => {
    // In production: await $fetch('/api/users', { method: 'POST', body: userData })
    console.log('Mock: Creating user', userData)

    const newUser = {
      ...userData,
      id: `usr_${String(users.value.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString()
    }

    users.value.push(newUser)

    return { success: true, user: newUser }
  }

  // Computed values
  const activeUsers = computed(() =>
    users.value.filter(u => u.status === 'active')
  )

  const usersByRole = computed(() => ({
    admin: users.value.filter(u => u.role === 'admin'),
    user: users.value.filter(u => u.role === 'user')
  }))

  return {
    users,
    loading,
    error,
    fetchUsers,
    updateUser,
    deleteUser,
    createUser,
    activeUsers,
    usersByRole
  }
}

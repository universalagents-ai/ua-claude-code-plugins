<script setup lang="ts">
// Example: Dashboard component demonstrating all state patterns
// Loading, Success, Error, Empty states

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'
import { Alert, AlertDescription } from '~/components/ui/alert'

// State management
const loading = ref(true)
const error = ref<string | null>(null)
const metrics = ref(null)
const recentActivity = ref([])

// Mock data
const mockMetrics = {
  totalUsers: 1247,
  activeUsers: 892,
  revenue: 45230.50,
  growth: 12.5
}

const mockActivity = [
  {
    id: 1,
    user: 'Alex Chen',
    action: 'Created new project',
    timestamp: '2 minutes ago'
  },
  {
    id: 2,
    user: 'Jordan Taylor',
    action: 'Completed task',
    timestamp: '15 minutes ago'
  },
  {
    id: 3,
    user: 'Sam Rivera',
    action: 'Updated profile',
    timestamp: '1 hour ago'
  }
]

// Simulate data loading
const loadData = async () => {
  loading.value = true
  error.value = null

  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Simulate occasional errors (20% chance)
    if (Math.random() < 0.2) {
      throw new Error('Failed to load dashboard data')
    }

    // Load data
    metrics.value = mockMetrics
    recentActivity.value = mockActivity
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

// Load on mount
onMounted(() => {
  loadData()
})

// Retry function
const retry = () => {
  loadData()
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold">Dashboard</h1>
      <Button @click="loadData" :disabled="loading">
        Refresh
      </Button>
    </div>

    <!-- ERROR STATE -->
    <Alert v-if="error" variant="destructive">
      <AlertDescription>
        {{ error }}
        <Button @click="retry" variant="outline" size="sm" class="ml-4">
          Retry
        </Button>
      </AlertDescription>
    </Alert>

    <!-- LOADING STATE -->
    <div v-if="loading && !error" class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card v-for="i in 4" :key="i">
        <CardHeader>
          <Skeleton class="h-4 w-20" />
        </CardHeader>
        <CardContent>
          <Skeleton class="h-8 w-24" />
        </CardContent>
      </Card>
    </div>

    <!-- SUCCESS STATE -->
    <div v-else-if="metrics && !error" class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader>
          <CardTitle class="text-sm font-medium text-muted-foreground">
            Total Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-2xl font-bold">{{ metrics.totalUsers.toLocaleString() }}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-sm font-medium text-muted-foreground">
            Active Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-2xl font-bold">{{ metrics.activeUsers.toLocaleString() }}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-sm font-medium text-muted-foreground">
            Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-2xl font-bold">${{ metrics.revenue.toLocaleString() }}</p>
          <p class="text-sm text-green-500">+{{ metrics.growth }}%</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-sm font-medium text-muted-foreground">
            Growth
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-2xl font-bold">{{ metrics.growth }}%</p>
        </CardContent>
      </Card>
    </div>

    <!-- Recent Activity Section -->
    <Card v-if="!loading && !error">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <!-- EMPTY STATE -->
        <div v-if="recentActivity.length === 0" class="text-center py-12">
          <p class="text-lg font-semibold text-muted-foreground">No recent activity</p>
          <p class="text-sm text-muted-foreground mt-2">
            Activity will appear here as users interact with the system
          </p>
        </div>

        <!-- POPULATED STATE -->
        <div v-else class="space-y-4">
          <div
            v-for="activity in recentActivity"
            :key="activity.id"
            class="flex items-center justify-between border-b pb-4 last:border-0"
          >
            <div>
              <p class="font-medium">{{ activity.user }}</p>
              <p class="text-sm text-muted-foreground">{{ activity.action }}</p>
            </div>
            <p class="text-sm text-muted-foreground">{{ activity.timestamp }}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
// Example: Complete product list component with mock data
// Demonstrates: loading states, error handling, empty states, and interactions

import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Input } from '~/components/ui/input'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  stock: number
  status: 'active' | 'draft' | 'archived'
  imageUrl: string
}

// Mock products data
const products = ref<Product[]>([
  {
    id: 'prod_001',
    name: 'Wireless Headphones',
    description: 'High-quality noise-cancelling wireless headphones',
    price: 129.99,
    category: 'Audio',
    stock: 45,
    status: 'active',
    imageUrl: 'https://placehold.co/200x200/3b82f6/white?text=Headphones'
  },
  {
    id: 'prod_002',
    name: 'Smart Watch',
    description: 'Fitness tracking smartwatch with heart rate monitor',
    price: 249.99,
    category: 'Wearables',
    stock: 23,
    status: 'active',
    imageUrl: 'https://placehold.co/200x200/10b981/white?text=Watch'
  },
  {
    id: 'prod_003',
    name: 'Laptop Stand',
    description: 'Adjustable aluminum laptop stand for better ergonomics',
    price: 49.99,
    category: 'Accessories',
    stock: 0,
    status: 'active',
    imageUrl: 'https://placehold.co/200x200/f59e0b/white?text=Stand'
  },
  {
    id: 'prod_004',
    name: 'USB-C Hub',
    description: '7-in-1 USB-C hub with HDMI and card readers',
    price: 39.99,
    category: 'Accessories',
    stock: 67,
    status: 'draft',
    imageUrl: 'https://placehold.co/200x200/8b5cf6/white?text=Hub'
  }
])

// UI state
const loading = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')
const selectedCategory = ref('all')

// Simulate loading products (optional - for testing loading states)
const loadProducts = async () => {
  loading.value = true
  error.value = null

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Simulate occasional errors (uncomment to test error state)
  // if (Math.random() < 0.2) {
  //   error.value = 'Failed to load products. Please try again.'
  //   loading.value = false
  //   return
  // }

  loading.value = false
}

// Computed filtered products
const filteredProducts = computed(() => {
  let filtered = products.value

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    )
  }

  // Filter by category
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(p => p.category === selectedCategory.value)
  }

  return filtered
})

// Get unique categories
const categories = computed(() => {
  const cats = new Set(products.value.map(p => p.category))
  return ['all', ...Array.from(cats)]
})

// Mock actions
const editProduct = (productId: string) => {
  console.log('Mock: Editing product', productId)
  // In production: navigate to edit page or open modal
}

const deleteProduct = (productId: string) => {
  console.log('Mock: Deleting product', productId)
  // In production: await $fetch(`/api/products/${productId}`, { method: 'DELETE' })
  products.value = products.value.filter(p => p.id !== productId)
}

// Load on mount (optional)
// onMounted(() => {
//   loadProducts()
// })

// Badge color based on status
const getStatusColor = (status: Product['status']) => {
  switch (status) {
    case 'active': return 'bg-green-500'
    case 'draft': return 'bg-yellow-500'
    case 'archived': return 'bg-gray-500'
    default: return 'bg-gray-500'
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Products</h1>
        <p class="text-muted-foreground">Manage your product inventory</p>
      </div>
      <Button>Add Product</Button>
    </div>

    <!-- Filters -->
    <Card>
      <CardContent class="pt-6">
        <div class="flex gap-4">
          <Input
            v-model="searchQuery"
            placeholder="Search products..."
            class="max-w-sm"
          />
          <select
            v-model="selectedCategory"
            class="px-3 py-2 border rounded-md"
          >
            <option
              v-for="cat in categories"
              :key="cat"
              :value="cat"
            >
              {{ cat === 'all' ? 'All Categories' : cat }}
            </option>
          </select>
        </div>
      </CardContent>
    </Card>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="flex items-center justify-center p-12"
    >
      <div class="text-center space-y-2">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p class="text-muted-foreground">Loading products...</p>
      </div>
    </div>

    <!-- Error State -->
    <Card
      v-else-if="error"
      class="border-destructive"
    >
      <CardContent class="pt-6">
        <div class="flex items-center gap-3 text-destructive">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p class="font-semibold">Error loading products</p>
            <p class="text-sm">{{ error }}</p>
          </div>
        </div>
        <Button @click="loadProducts" variant="outline" class="mt-4">
          Try Again
        </Button>
      </CardContent>
    </Card>

    <!-- Empty State -->
    <Card v-else-if="filteredProducts.length === 0">
      <CardContent class="pt-6">
        <div class="text-center py-12 space-y-2">
          <svg class="w-12 h-12 mx-auto text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p class="text-lg font-semibold">No products found</p>
          <p class="text-sm text-muted-foreground">
            {{ searchQuery ? 'Try adjusting your search criteria' : 'Get started by adding your first product' }}
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- Products Grid -->
    <div
      v-else
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <Card
        v-for="product in filteredProducts"
        :key="product.id"
        class="overflow-hidden"
      >
        <img
          :src="product.imageUrl"
          :alt="product.name"
          class="w-full h-48 object-cover"
        />
        <CardHeader>
          <div class="flex items-start justify-between">
            <CardTitle class="text-lg">{{ product.name }}</CardTitle>
            <Badge :class="getStatusColor(product.status)">
              {{ product.status }}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p class="text-sm text-muted-foreground mb-4">
            {{ product.description }}
          </p>
          <div class="space-y-2 mb-4">
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground">Price:</span>
              <span class="font-semibold">${{ product.price.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground">Stock:</span>
              <span :class="product.stock === 0 ? 'text-destructive' : ''">
                {{ product.stock === 0 ? 'Out of stock' : `${product.stock} units` }}
              </span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground">Category:</span>
              <span>{{ product.category }}</span>
            </div>
          </div>
          <div class="flex gap-2">
            <Button
              @click="editProduct(product.id)"
              variant="outline"
              size="sm"
              class="flex-1"
            >
              Edit
            </Button>
            <Button
              @click="deleteProduct(product.id)"
              variant="destructive"
              size="sm"
              class="flex-1"
            >
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Top Navigation -->
    <nav class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-8">
          <h1 class="text-2xl font-bold text-blue-700">AfriChina Bridge</h1>
          <div class="flex gap-6">
            <button class="text-gray-600 hover:text-gray-900 font-medium">Sourcing</button>
            <button class="text-blue-700 border-b-2 border-blue-700 font-medium">Orders</button>
            <button class="text-gray-600 hover:text-gray-900 font-medium">Suppliers</button>
            <button class="text-gray-600 hover:text-gray-900 font-medium">Logistics</button>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="relative">
            <span class="material-icons absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">search</span>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search requests..." 
              class="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button @click="toggleNotifications" class="relative p-2 hover:bg-gray-100 rounded-lg">
            <span class="material-icons text-gray-600">notifications</span>
            <span v-if="notificationCount > 0" class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button @click="openChat" class="p-2 hover:bg-gray-100 rounded-lg">
            <span class="material-icons text-gray-600">chat</span>
          </button>
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2RyODKtjBq88GCEOb-L1uA_CtkK3ef6kiw8x2MkcxAyKA5k5exGbISqmxr4ywURFwwn2E-ht7wTlhC6QomyTA7OI1s0-PDO_juQB1o9Y_EIVRHQCec9tT3Jf35QCDiVBsUoMTSR8pyjUaeA_pXveQS2lHoCnAIhUrdxmp3NzyW2mX0hGdg-VV5_6JRD0ZqLdP525IP4hdJjwbgoLP92DyHa5e9kc0AbYCAkLfd0i7pFK4dGb8mzUjQ260snLqXL3uuXW8d18C9ot9" 
            alt="User" 
            class="w-10 h-10 rounded-full object-cover"
          />
        </div>
      </div>
    </nav>

    <div class="flex">
      <!-- Sidebar -->
      <aside class="w-64 bg-white min-h-screen border-r border-gray-200 p-6">
        <div class="mb-8">
          <h2 class="text-xl font-bold text-blue-700">Global Sourcing</h2>
          <p class="text-sm text-gray-500">Verified Buyer</p>
        </div>

        <nav class="space-y-2">
          <button @click="navigateTo('dashboard')" class="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <span class="material-icons">dashboard</span>
            <span class="font-medium">Dashboard</span>
          </button>
          <button @click="navigateTo('requests')" class="w-full flex items-center gap-3 px-4 py-3 bg-blue-700 text-white rounded-lg transition-colors">
            <span class="material-icons">request_quote</span>
            <span class="font-medium">Requests</span>
          </button>
          <button @click="navigateTo('orders')" class="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <span class="material-icons">shopping_cart</span>
            <span class="font-medium">Orders</span>
          </button>
          <button @click="navigateTo('suppliers')" class="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <span class="material-icons">business</span>
            <span class="font-medium">Suppliers</span>
          </button>
          <button @click="navigateTo('settings')" class="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <span class="material-icons">settings</span>
            <span class="font-medium">Settings</span>
          </button>
        </nav>

        <div class="mt-8 pt-8 border-t border-gray-200">
          <button @click="createNewRequest" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors shadow-lg">
            <span class="material-icons">add</span>
            <span class="font-medium">New Request</span>
          </button>
        </div>

        <nav class="mt-8 space-y-2">
          <button @click="openHelpCenter" class="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <span class="material-icons">help</span>
            <span class="font-medium">Help Center</span>
          </button>
          <button @click="logout" class="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <span class="material-icons">logout</span>
            <span class="font-medium">Sign Out</span>
          </button>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 p-8">
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-gray-800">My Requests</h1>
        </div>

        <!-- Request Cards -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <!-- Industrial Generator Card -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div class="flex justify-between items-start mb-4">
              <div class="flex items-center gap-2">
                <span class="material-icons text-gray-500 text-sm">precision_manufacturing</span>
                <span class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">Machinery</span>
              </div>
              <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">Quoted</span>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-4">Industrial Generator 50kVA</h3>
            <div class="flex items-center justify-between text-sm text-gray-600 mb-4">
              <div class="flex items-center gap-2">
                <span class="material-icons text-sm">calendar_today</span>
                <span>Oct 25, 2023</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="material-icons text-sm">inventory_2</span>
                <span>2 units</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-2xl font-bold text-blue-700">$4,500.00</span>
              <button @click="viewDetails('generator')" class="flex items-center gap-1 text-blue-700 font-medium hover:underline">
                View Details
                <span class="material-icons text-sm">arrow_forward</span>
              </button>
            </div>
          </div>

          <!-- Cotton Fabric Card -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div class="flex justify-between items-start mb-4">
              <div class="flex items-center gap-2">
                <span class="material-icons text-gray-500 text-sm">apparel</span>
                <span class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">Textiles</span>
              </div>
              <span class="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-bold">Processing</span>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-4">Cotton Fabric Rolls</h3>
            <div class="flex items-center justify-between text-sm text-gray-600 mb-4">
              <div class="flex items-center gap-2">
                <span class="material-icons text-sm">calendar_today</span>
                <span>Oct 20, 2023</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="material-icons text-sm">straighten</span>
                <span>500m</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500">Track Status</span>
              <button @click="trackStatus('cotton')" class="flex items-center gap-1 text-blue-700 font-medium hover:underline">
                <span class="material-icons text-sm">query_stats</span>
              </button>
            </div>
          </div>

          <!-- Solar Panels Card -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div class="flex justify-between items-start mb-4">
              <div class="flex items-center gap-2">
                <span class="material-icons text-gray-500 text-sm">wb_sunny</span>
                <span class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">Solar</span>
              </div>
              <span class="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-bold">Pending</span>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-4">Solar Panels 400W</h3>
            <div class="flex items-center justify-between text-sm text-gray-600 mb-4">
              <div class="flex items-center gap-2">
                <span class="material-icons text-sm">calendar_today</span>
                <span>Oct 18, 2023</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="material-icons text-sm">inventory_2</span>
                <span>100 units</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500 italic">Awaiting supplier quotes</span>
              <button @click="editRequest('solar')" class="text-blue-700 font-medium hover:underline">
                Edit Request
              </button>
            </div>
          </div>

          <!-- Create New Request Card -->
          <div class="bg-white rounded-xl border-2 border-dashed border-gray-300 p-6 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer" @click="createNewRequest">
            <div class="flex flex-col items-center justify-center h-full py-12">
              <span class="material-icons text-5xl text-blue-600 mb-4">add_circle</span>
              <p class="text-blue-700 font-semibold text-lg">Create new sourcing request</p>
            </div>
          </div>
        </div>

        <!-- Statistics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="flex items-center gap-2 text-gray-600 mb-2">
              <span class="material-icons text-sm">account_balance_wallet</span>
              <span class="text-sm font-medium uppercase tracking-wide">Total Active Volume</span>
            </div>
            <p class="text-4xl font-bold text-blue-700">$124,800</p>
          </div>

          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="flex items-center gap-2 text-gray-600 mb-2">
              <span class="material-icons text-sm">hourglass_empty</span>
              <span class="text-sm font-medium uppercase tracking-wide">Pending Responses</span>
            </div>
            <p class="text-4xl font-bold text-blue-700">04</p>
          </div>

          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="flex items-center gap-2 text-gray-600 mb-2">
              <span class="material-icons text-sm">group</span>
              <span class="text-sm font-medium uppercase tracking-wide">Suppliers Contacted</span>
            </div>
            <p class="text-4xl font-bold text-blue-700">12</p>
          </div>
        </div>
      </main>
    </div>

    <!-- Floating Action Button -->
    <button 
      @click="createNewRequest" 
      class="fixed bottom-8 right-8 w-14 h-14 bg-blue-700 text-white rounded-full shadow-lg hover:bg-blue-800 transition-colors flex items-center justify-center"
    >
      <span class="material-icons text-2xl">add</span>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Reactive state
const searchQuery = ref('')
const notificationCount = ref(3)
const currentView = ref('requests')

// Methods
const toggleNotifications = () => {
  console.log('Toggle notifications clicked')
  console.log('Current notifications:', notificationCount.value)
}

const openChat = () => {
  console.log('Open chat clicked')
}

const navigateTo = (page) => {
  console.log('Navigate to:', page)
  currentView.value = page
}

const createNewRequest = () => {
  console.log('Create new request clicked')
}

const openHelpCenter = () => {
  console.log('Open help center clicked')
}

const logout = () => {
  console.log('Logout clicked')
}

const viewDetails = (item) => {
  console.log('View details for:', item)
}

const trackStatus = (item) => {
  console.log('Track status for:', item)
}

const editRequest = (item) => {
  console.log('Edit request for:', item)
}
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
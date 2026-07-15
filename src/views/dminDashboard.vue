<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-white shadow-lg z-10">
      <!-- Logo -->
      <div class="p-6 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-purple-700 rounded-xl flex items-center justify-center">
            <span class="material-icons text-white text-xl">badge</span>
          </div>
          <div>
            <h1 class="font-bold text-gray-800">AfriChina</h1>
            <p class="text-xs text-gray-500 uppercase tracking-wide">Admin Terminal</p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="p-4 space-y-2">
        <button 
          @click="navigateTo('dashboard')" 
          :class="['w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all', currentRoute === 'dashboard' ? 'bg-purple-700 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100']"
        >
          <span class="material-icons">dashboard</span>
          <span class="font-medium">Dashboard</span>
        </button>
        <button 
          @click="navigateTo('requests')" 
          :class="['w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all', currentRoute === 'requests' ? 'bg-purple-700 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100']"
        >
          <span class="material-icons">request_quote</span>
          <span class="font-medium">Requests</span>
        </button>
        <button 
          @click="navigateTo('orders')" 
          :class="['w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all', currentRoute === 'orders' ? 'bg-purple-700 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100']"
        >
          <span class="material-icons">shopping_cart</span>
          <span class="font-medium">Orders</span>
        </button>
        <button 
          @click="navigateTo('suppliers')" 
          :class="['w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all', currentRoute === 'suppliers' ? 'bg-purple-700 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100']"
        >
          <span class="material-icons">business</span>
          <span class="font-medium">Suppliers</span>
        </button>
        <button 
          @click="navigateTo('settings')" 
          :class="['w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all', currentRoute === 'settings' ? 'bg-purple-700 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100']"
        >
          <span class="material-icons">settings</span>
          <span class="font-medium">Settings</span>
        </button>
      </nav>

      <!-- User Profile -->
      <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
        <div class="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl mb-3">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBFvudkfDvkOa1ZX8iabOZgf7wS6ds4M1OJ3A7ncRwwxCHJXQTBmaFSmeZ0Gvpi1S5OKcuFFX2Fy46hzma15bZ5SZXanZoEpqOw0u9MzvuTN9b-Q0NvjeE30b-rrRwVYYgu1Bb3jOBTeWbUpOwuKBLjuLoVY7WKySqqOuucf51ilQwAE9TXo8cqh5AMwTo0nAmC9aSjvZx0Lw2YlXykO5F4X66Mun2KA4kYgLkRf_dEv17rpfGuZMp6pcnWRy4Vagnn_9a7Ss3s4xo" 
            alt="Chen Wei" 
            class="w-10 h-10 rounded-full object-cover"
          />
          <div class="flex-1 min-w-0">
            <p class="font-medium text-gray-800 text-sm truncate">Chen Wei</p>
            <p class="text-xs text-gray-500 truncate">Chief Operations</p>
          </div>
        </div>
        <button 
          @click="logout" 
          class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-colors"
        >
          <span class="material-icons">logout</span>
          <span class="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-8 overflow-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-800 mb-2">All Requests</h1>
        <p class="text-gray-600">Monitor and manage cross-border sourcing operations in real-time.</p>
      </div>

      <!-- Top Actions -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-4 flex-1">
          <div class="relative flex-1 max-w-md">
            <span class="material-icons absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">search</span>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search requests, buyers..." 
              class="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button @click="toggleFilters" class="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <span class="material-icons text-gray-600">filter_list</span>
          </button>
        </div>
        <button 
          @click="createNewRequest" 
          class="flex items-center gap-2 px-6 py-3 bg-purple-700 text-white rounded-xl hover:bg-purple-800 shadow-lg transition-all"
        >
          <span class="material-icons">add</span>
          <span class="font-medium">New Request</span>
        </button>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Requests -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <span class="material-icons text-purple-700">assignment</span>
            </div>
            <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">+12.5%</span>
          </div>
          <p class="text-gray-600 text-sm mb-1">Total Requests</p>
          <p class="text-4xl font-bold text-gray-800">1,284</p>
          <div class="mt-4 h-12 flex items-end gap-1">
            <div v-for="h in [40, 65, 45, 80, 55, 70, 60]" :key="h" 
                 :style="{height: h + '%'}" 
                 class="flex-1 bg-purple-300 rounded-t-sm">
            </div>
          </div>
        </div>

        <!-- Pending Approval -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <span class="material-icons text-orange-600">hourglass_empty</span>
            </div>
            <span class="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">High Priority</span>
          </div>
          <p class="text-gray-600 text-sm mb-1">Pending Approval</p>
          <p class="text-4xl font-bold text-gray-800">42</p>
          <div class="mt-4 h-12 flex items-end gap-1">
            <div v-for="h in [30, 45, 35, 50, 40, 55, 45]" :key="h" 
                 :style="{height: h + '%'}" 
                 class="flex-1 bg-orange-300 rounded-t-sm">
            </div>
          </div>
        </div>

        <!-- In Processing -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <span class="material-icons text-blue-600">conveyor_belt</span>
            </div>
            <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Active</span>
          </div>
          <p class="text-gray-600 text-sm mb-1">In Processing</p>
          <p class="text-4xl font-bold text-gray-800">315</p>
          <div class="mt-4 h-12 flex items-end gap-1">
            <div v-for="h in [50, 70, 60, 85, 75, 90, 80]" :key="h" 
                 :style="{height: h + '%'}" 
                 class="flex-1 bg-blue-300 rounded-t-sm">
            </div>
          </div>
        </div>

        <!-- Completed Deals -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <span class="material-icons text-green-600">task_alt</span>
            </div>
            <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">98% Success</span>
          </div>
          <p class="text-gray-600 text-sm mb-1">Completed Deals</p>
          <p class="text-4xl font-bold text-gray-800">892</p>
          <div class="mt-4 h-12 flex items-end gap-1">
            <div v-for="h in [60, 75, 85, 70, 90, 80, 95]" :key="h" 
                 :style="{height: h + '%'}" 
                 class="flex-1 bg-green-300 rounded-t-sm">
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Sourcing Requests Table -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div class="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-800">Recent Sourcing Requests</h2>
          <div class="flex items-center gap-3">
            <button @click="viewAll" class="px-4 py-2 text-purple-700 font-medium hover:bg-purple-50 rounded-lg transition-colors">
              View All
            </button>
            <button @click="exportCSV" class="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors">
              Export CSV
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Buyer Entity</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Request Date</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Est. Volume</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th class="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="request in requests" :key="request.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <img :src="request.buyerLogo" :alt="request.buyerName" class="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p class="font-semibold text-gray-800">{{ request.buyerName }}</p>
                      <p class="text-sm text-gray-500">{{ request.location }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                    {{ request.category }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ request.requestDate }}</td>
                <td class="px-6 py-4 font-semibold text-gray-800">{{ request.volume }}</td>
                <td class="px-6 py-4">
                  <span :class="[
                    'px-3 py-1 rounded-full text-xs font-semibold',
                    request.status === 'QUOTED' ? 'bg-orange-100 text-orange-700' :
                    request.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  ]">
                    {{ request.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <button @click="openActions(request.id)" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <span class="material-icons text-gray-600">more_vert</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="p-6 border-t border-gray-100 flex items-center justify-between">
          <p class="text-sm text-gray-600">Showing 1 to 10 of 1,284 entries</p>
          <div class="flex items-center gap-2">
            <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" 
                    class="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <span class="material-icons">chevron_left</span>
            </button>
            <button v-for="page in totalPages" :key="page" 
                    @click="changePage(page)"
                    :class="['px-4 py-2 rounded-lg font-medium transition-colors', 
                             currentPage === page ? 'bg-purple-700 text-white' : 'hover:bg-gray-100']">
              {{ page }}
            </button>
            <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages" 
                    class="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <span class="material-icons">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentRoute = ref('dashboard')
const searchQuery = ref('')
const currentPage = ref(1)
const totalPages = ref(129)

// Sample requests data
const requests = ref([
  {
    id: 1,
    buyerName: 'Lagos Build Ltd.',
    location: 'Lagos, Nigeria',
    buyerLogo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAB_07qR2a05wb8XOu4ejHpjJA4SdqX6YB2jzM3Nxr13P3ejmr6eGv3l_rzyvMUw1plCokCnJBLpvr4s6BT6EExPKlK_o7HNgmagb7xyNUCYni7YFg_8YC-6VcHX7HFkmDkxU19O6phA7tLLB0SXHSM8daHiTf1vjL5U4wi1LyOc_sP1HdKPRSYfnBXwnDH_4st1ffAKU-7-S9lizGDx2yi4sAwoczBLYIAH7AZRbV99GphEbEeQVV-o3oxQaJgJ55WWdBpOht1TK65',
    category: 'Construction',
    requestDate: 'Oct 24, 2023',
    volume: '$245,000',
    status: 'QUOTED'
  },
  {
    id: 2,
    buyerName: 'Sino-Ethio Textiles',
    location: 'Addis Ababa, Ethiopia',
    buyerLogo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0epdooyg3WHm2soN7T0iZDEmV9a2T0RiCo2zI3vfth4QI_0zyo6Y2kZPsbE18_nQSFrKEbUlPjxxAVpkW91fDS510Wqww4sdUP5gl8rv65YCGdxzd6r445zxVVNG00gpIqn_AG9Kqm4YFVm43F0o5W3Ia9Qbih2kfrQ02_jUL98OARli2w6X4TB3p0eQDVv4GLKG5-8c7KLbeUp6ncXVtfX8cJ6rpJMUJRjQMRizJCs7INJGrfNRlehPOxlh9CRj37eT-CQpP-AR8',
    category: 'Textiles',
    requestDate: 'Oct 22, 2023',
    volume: '$82,400',
    status: 'PROCESSING'
  },
  {
    id: 3,
    buyerName: 'Nairobi Tech Hub',
    location: 'Nairobi, Kenya',
    buyerLogo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxL7Fmtx7RCVn1eSCi_tnPAaxn1iXJU7t84VepyCcN7oKWvUWvjs3fDLYzZt-v540cDvsyZxv8l1-EuCd8NvvXiS5bDbuX2RCAHoedzkZbykI3EEUJcFlinwP7BMCKGELTotd41ssduDFdgSSvqn6Kx2_iDyutYeWfyQjX_cXSHF5xMYAkXvv8p9pvBJ7otf_r3893PnX1WMUSCpwWvd180iSGTGO8e87NM4XYR4qr6mTZMQmRuYfl4JpBKARIIqGE-QK5-SAk3P_2',
    category: 'Electronics',
    requestDate: 'Oct 20, 2023',
    volume: '$12,000',
    status: 'COMPLETED'
  }
])

// Methods
const navigateTo = (route) => {
  currentRoute.value = route
  console.log('Navigating to:', route)
  router.push('/' + route)
}

const toggleFilters = () => {
  console.log('Toggle filters')
}

const createNewRequest = () => {
  console.log('Create new request')
  router.push('/new-request')
}

const viewAll = () => {
  console.log('View all requests')
}

const exportCSV = () => {
  console.log('Export CSV')
}

const openActions = (requestId) => {
  console.log('Open actions for request:', requestId)
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    console.log('Changed to page:', page)
  }
}

const logout = () => {
  console.log('Logout')
  router.push('/login')
}
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
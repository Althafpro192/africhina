<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <Navbar />
    
    <div class="flex-grow flex">
      <!-- Admin Sidebar Placeholder -->
      <aside v-if="isAdmin" class="w-64 bg-white border-r border-gray-200 hidden md:block">
        <div class="p-4">
          <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">{{ $t('admin.menu') || 'Admin Menu' }}</h2>
          <ul class="mt-4 space-y-2">
            <li>
              <router-link to="/admin/dashboard" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                Dashboard
              </router-link>
            </li>
            <li>
              <router-link to="/admin/suppliers" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                Suppliers
              </router-link>
            </li>
          </ul>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 w-full max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <slot></slot>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import Navbar from './Navbar.vue';

const isAdmin = computed(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.role === 'admin';
});
</script>

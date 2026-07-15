<template>
  <div class="min-h-screen bg-background">
    <Navbar />
    
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Stat Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="glass-card p-6">
          <h3 class="text-sm font-medium text-gray-500 uppercase">{{ $t('dashboard.total_volume') }}</h3>
          <p class="mt-2 text-3xl font-bold text-gray-900">{{ stats.volume }}</p>
        </div>
        <div class="glass-card p-6">
          <h3 class="text-sm font-medium text-gray-500 uppercase">{{ $t('dashboard.pending_responses') }}</h3>
          <p class="mt-2 text-3xl font-bold text-gray-900">{{ stats.pending }}</p>
        </div>
        <div class="glass-card p-6">
          <h3 class="text-sm font-medium text-gray-500 uppercase">{{ $t('dashboard.suppliers') }}</h3>
          <p class="mt-2 text-3xl font-bold text-gray-900">{{ stats.suppliers }}</p>
        </div>
      </div>

      <!-- Requests List -->
      <div class="mb-6 flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-900">{{ $t('nav.requests') }}</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="req in requests" :key="req.id" class="glass-card p-6 glass-card-hover cursor-pointer" @click="goToDetail(req.id)">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-bold text-gray-900">{{ req.product_name }}</h3>
              <p class="text-sm text-gray-500">{{ req.category }} • {{ req.quantity }} units</p>
            </div>
            <StatusBadge :status="req.status" />
          </div>
          <div class="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
            <span class="text-sm text-gray-500">{{ new Date(req.created_at).toLocaleDateString() }}</span>
            <span v-if="req.quoted_price" class="font-bold text-primary">${{ req.quoted_price }}</span>
          </div>
        </div>
      </div>

      <!-- FAB -->
      <button @click="router.push('/request/new')" class="fixed bottom-8 right-8 h-14 w-14 bg-primary text-white rounded-full shadow-deep flex items-center justify-center hover:-translate-y-1 transition-all duration-300 z-50">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import StatusBadge from '../components/StatusBadge.vue';
import api from '../api/axios';

const router = useRouter();
const requests = ref([]);
const stats = ref({ volume: 0, pending: 0, suppliers: 0 });

const fetchRequests = async () => {
  try {
    const res = await api.get('/requests');
    requests.value = res.data;
    
    // Calculate simple stats
    stats.value.volume = requests.value.length;
    stats.value.pending = requests.value.filter(r => r.status === 'pending').length;
    const uniqueSuppliers = new Set(requests.value.filter(r => r.assigned_supplier_id).map(r => r.assigned_supplier_id));
    stats.value.suppliers = uniqueSuppliers.size;
  } catch (error) {
    console.error(error);
  }
};

const goToDetail = (id) => {
  router.push(`/request/${id}`);
};

onMounted(fetchRequests);
</script>
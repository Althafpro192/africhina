<template>
  <div class="min-h-screen bg-background pb-12">
    <Navbar />
    
    <main class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Admin Command Center</h1>
        <div class="space-x-4">
           <router-link to="/admin/requests" class="btn-primary inline-flex items-center">
             Manage Requests
           </router-link>
           <router-link to="/admin/suppliers" class="btn-primary bg-white text-primary border-primary border-2 hover:bg-gray-50 shadow-none hover:shadow-sm inline-flex items-center">
             Suppliers DB
           </router-link>
        </div>
      </div>

      <!-- Overview Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="glass-card p-6">
          <h3 class="text-sm font-medium text-gray-500 uppercase">Total Requests</h3>
          <p class="mt-2 text-3xl font-bold text-gray-900">{{ stats.total || 0 }}</p>
        </div>
        <div class="glass-card p-6">
          <h3 class="text-sm font-medium text-gray-500 uppercase">Avg Response Time</h3>
          <p class="mt-2 text-3xl font-bold text-emerald-600">{{ stats.avgResponseTime || 'N/A' }}</p>
        </div>
        <div class="glass-card p-6">
          <h3 class="text-sm font-medium text-gray-500 uppercase">Active Production</h3>
          <p class="mt-2 text-3xl font-bold text-blue-600">{{ productionCount }}</p>
        </div>
        <div class="glass-card p-6">
          <h3 class="text-sm font-medium text-gray-500 uppercase">Pending Review</h3>
          <p class="mt-2 text-3xl font-bold text-amber-600">{{ pendingCount }}</p>
        </div>
      </div>

      <!-- Charts Area -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Status Breakdown Pie -->
        <div class="glass-card p-6 flex flex-col items-center">
          <h3 class="text-lg font-bold text-gray-900 mb-6 w-full text-left">Request Status Distribution</h3>
          <div class="w-full max-w-sm aspect-square relative">
            <Pie v-if="loaded" :data="statusChartData" :options="chartOptions" />
          </div>
        </div>

        <!-- Category Breakdown Bar -->
        <div class="glass-card p-6">
          <h3 class="text-lg font-bold text-gray-900 mb-6 w-full text-left">Category Volume</h3>
          <div class="w-full h-80 relative">
            <Bar v-if="loaded" :data="categoryChartData" :options="barOptions" />
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Navbar from '../components/Navbar.vue';
import api from '../api/axios';

import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'vue-chartjs';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const stats = ref({});
const loaded = ref(false);

const statusChartData = ref({ labels: [], datasets: [] });
const categoryChartData = ref({ labels: [], datasets: [] });

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom' } }
};

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
};

const productionCount = computed(() => {
  if (!stats.value.statusBreakdown) return 0;
  const match = stats.value.statusBreakdown.find(s => s.status === 'production');
  return match ? match.count : 0;
});

const pendingCount = computed(() => {
  if (!stats.value.statusBreakdown) return 0;
  const match = stats.value.statusBreakdown.find(s => s.status === 'pending');
  return match ? match.count : 0;
});

const fetchStats = async () => {
  try {
    const res = await api.get('/admin/statistics');
    stats.value = res.data;
    
    // Process Status Data
    statusChartData.value = {
      labels: stats.value.statusBreakdown.map(s => s.status),
      datasets: [{
        data: stats.value.statusBreakdown.map(s => parseInt(s.count)),
        backgroundColor: ['#f59e0b', '#3525cd', '#10b981', '#3b82f6', '#6b7280', '#14b8a6']
      }]
    };

    // Process Category Data
    categoryChartData.value = {
      labels: stats.value.categoryBreakdown.map(c => c.category),
      datasets: [{
        label: 'Requests',
        data: stats.value.categoryBreakdown.map(c => parseInt(c.count)),
        backgroundColor: '#4f378a'
      }]
    };

    loaded.value = true;
  } catch (error) {
    console.error(error);
  }
};

onMounted(fetchStats);
</script>
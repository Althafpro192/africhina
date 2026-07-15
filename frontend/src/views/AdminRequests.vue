<template>
  <div class="min-h-screen bg-background pb-12">
    <Navbar />
    
    <main class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Manage Requests</h1>
        <router-link to="/admin" class="text-sm font-medium text-primary hover:text-primary-hover">
          &larr; Back to Dashboard
        </router-link>
      </div>

      <div class="glass-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer Entity</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product / Category</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="req in requests" :key="req.id" class="hover:bg-gray-50 transition-colors cursor-pointer" @click="openModal(req)">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ req.buyer_company }}</div>
                      <div class="text-sm text-gray-500">{{ req.buyer_name }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ req.product_name }}</div>
                  <div class="text-sm text-gray-500">{{ req.category }} • Qty: {{ req.quantity }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ new Date(req.created_at).toLocaleDateString() }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <StatusBadge :status="req.status" />
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button class="text-primary hover:text-primary-hover font-bold">Manage</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <AdminRequestModal 
        :isOpen="isModalOpen" 
        :request="selectedRequest" 
        :suppliers="suppliers"
        @close="isModalOpen = false"
        @updated="fetchData"
      />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Navbar from '../components/Navbar.vue';
import StatusBadge from '../components/StatusBadge.vue';
import AdminRequestModal from '../components/AdminRequestModal.vue';
import api from '../api/axios';

const requests = ref([]);
const suppliers = ref([]);
const isModalOpen = ref(false);
const selectedRequest = ref(null);

const fetchData = async () => {
  try {
    const [reqsRes, supsRes] = await Promise.all([
      api.get('/admin/requests'),
      api.get('/admin/suppliers')
    ]);
    requests.value = reqsRes.data;
    suppliers.value = supsRes.data;
  } catch (error) {
    console.error(error);
  }
};

const openModal = (req) => {
  selectedRequest.value = req;
  isModalOpen.value = true;
};

onMounted(fetchData);
</script>

<template>
  <div class="min-h-screen bg-background pb-12">
    <Navbar />
    
    <main class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8" v-if="request">
      <!-- Header -->
      <div class="mb-8 flex justify-between items-end">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">{{ request.product_name }}</h1>
          <p class="text-gray-500 mt-2">Requested on {{ new Date(request.created_at).toLocaleDateString() }}</p>
        </div>
        <StatusBadge :status="request.status" class="text-base px-4 py-2" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="md:col-span-2 space-y-8">
          
          <!-- Timeline -->
          <div class="glass-card p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-6">Status Tracker</h2>
            <Timeline :currentStatus="request.status" :logs="[]" /> <!-- Mock logs array for now -->
          </div>

          <!-- Specifications -->
          <div class="glass-card p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Specifications</h2>
            <div class="prose max-w-none text-gray-600">
              <p>{{ request.specifications }}</p>
            </div>
            
            <div v-if="request.image_urls && request.image_urls.length > 0" class="mt-6">
              <h3 class="text-sm font-medium text-gray-900 mb-3">Reference Images</h3>
              <div class="grid grid-cols-3 gap-4">
                <img v-for="(img, idx) in request.image_urls" :key="idx" :src="baseURL + img" class="rounded-lg object-cover h-32 w-full border border-gray-200" />
              </div>
            </div>
          </div>

          <!-- Production Media -->
          <div v-if="['production', 'shipped', 'arrived', 'completed'].includes(request.status) && request.production_media?.length > 0" class="glass-card p-6 border-2 border-primary/20">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-bold text-gray-900">QC & Production Gallery</h2>
              <span class="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">Verified by Admin</span>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
               <img v-for="(img, idx) in request.production_media" :key="idx" :src="baseURL + img" class="rounded-lg object-cover h-40 w-full border border-gray-200 hover:opacity-90 cursor-pointer" />
            </div>
          </div>

          <!-- Rating Form -->
          <div v-if="request.status === 'completed' && !hasRated" class="glass-card p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
             <h2 class="text-xl font-bold text-emerald-900 mb-4">Rate Your Supplier</h2>
             <form @submit.prevent="submitRating" class="space-y-4">
               <div>
                  <label class="block text-sm font-medium text-emerald-800 mb-2">Score (1-5)</label>
                  <select v-model="ratingForm.score" required class="input-3d block w-32 border-emerald-300">
                    <option v-for="n in 5" :key="n" :value="n">{{ n }} Stars</option>
                  </select>
               </div>
               <div>
                 <label class="block text-sm font-medium text-emerald-800 mb-2">Review</label>
                 <textarea v-model="ratingForm.review" rows="3" required class="input-3d block w-full border-emerald-300 py-2"></textarea>
               </div>
               <button type="submit" class="btn-primary bg-emerald-600 hover:bg-emerald-700 shadow-[0_10px_20px_rgba(5,150,105,0.3)] border-emerald-500">
                 Submit Rating
               </button>
             </form>
          </div>

        </div>

        <div class="space-y-8">
          <!-- Details Sidebar -->
          <div class="glass-card p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Order Details</h3>
            <dl class="space-y-4 text-sm">
              <div class="flex justify-between">
                <dt class="text-gray-500">Category</dt>
                <dd class="font-medium text-gray-900">{{ request.category }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-500">Quantity</dt>
                <dd class="font-medium text-gray-900">{{ request.quantity }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-500">Budget Range</dt>
                <dd class="font-medium text-gray-900">{{ request.budget_range }}</dd>
              </div>
            </dl>
          </div>

          <!-- Supplier Details -->
          <div v-if="request.supplier_name" class="glass-card p-6 bg-gradient-to-br from-indigo-50 to-white border-primary/20">
            <h3 class="text-lg font-bold text-gray-900 mb-2">Assigned Supplier</h3>
            <div class="flex items-center space-x-2 mb-4">
              <span class="text-primary font-bold">{{ request.supplier_name }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            
            <div class="text-sm text-gray-600 mb-6 space-y-2">
              <p><span class="font-medium">Verification:</span> {{ request.verification_level }}</p>
              <p><span class="font-medium">Location:</span> {{ request.factory_address }}</p>
            </div>

            <div class="border-t border-indigo-100 pt-4">
               <p class="text-sm text-gray-500 mb-1">Quoted Price</p>
               <p class="text-3xl font-bold text-primary">${{ request.quoted_price }}</p>
               <p class="text-xs text-gray-400 mt-1">Total: ${{ request.quoted_price * request.quantity }}</p>
            </div>

            <!-- Action Area -->
            <div v-if="request.status === 'quoted'" class="mt-6 pt-6 border-t border-indigo-100">
               <button @click="acceptQuote" :disabled="isAccepting" class="w-full btn-primary h-14 text-lg">
                 {{ isAccepting ? 'Processing...' : 'Accept Quotation' }}
               </button>
               <p class="text-xs text-center text-gray-500 mt-3">By accepting, you agree to proceed to production phase.</p>
            </div>
            
            <!-- Progress Tracker -->
            <div v-if="['production', 'shipped', 'arrived', 'completed'].includes(request.status)" class="mt-6">
              <ProgressBar :progress="request.production_progress" />
            </div>
          </div>

        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import StatusBadge from '../components/StatusBadge.vue';
import Timeline from '../components/Timeline.vue';
import ProgressBar from '../components/ProgressBar.vue';
import api from '../api/axios';

const route = useRoute();
const router = useRouter();
const request = ref(null);
const isAccepting = ref(false);
const hasRated = ref(false);

const baseURL = import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') : 'http://localhost:5000';

const ratingForm = ref({
  score: 5,
  review: ''
});

const fetchRequest = async () => {
  try {
    const res = await api.get(`/requests/${route.params.id}`);
    request.value = res.data;
  } catch (error) {
    console.error(error);
    router.push('/dashboard');
  }
};

const acceptQuote = async () => {
  isAccepting.value = true;
  try {
    await api.put(`/requests/${route.params.id}/accept`);
    await fetchRequest();
  } catch (error) {
    alert('Failed to accept quotation');
  } finally {
    isAccepting.value = false;
  }
};

const submitRating = async () => {
  try {
    await api.post('/ratings', {
      request_id: request.value.id,
      supplier_id: request.value.assigned_supplier_id,
      score: ratingForm.value.score,
      review: ratingForm.value.review
    });
    hasRated.value = true;
    alert('Thank you for rating!');
  } catch (error) {
    alert('Failed to submit rating');
  }
};

onMounted(fetchRequest);
</script>

<template>
  <div class="min-h-screen bg-background">
    <Navbar />
    
    <main class="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div class="glass-card p-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Create New Sourcing Request</h2>
        
        <form @submit.prevent="submitRequest" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700">Product Name</label>
            <input v-model="form.product_name" type="text" required class="input-3d mt-1 block w-full" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Category</label>
              <select v-model="form.category" required class="input-3d mt-1 block w-full">
                <option value="Electronics">Electronics</option>
                <option value="Machinery">Machinery</option>
                <option value="Textiles">Textiles</option>
                <option value="Agriculture">Agriculture</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Quantity</label>
              <input v-model="form.quantity" type="number" required class="input-3d mt-1 block w-full" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Budget Range</label>
            <input v-model="form.budget_range" type="text" placeholder="e.g. $1000 - $5000" required class="input-3d mt-1 block w-full" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Technical Specifications</label>
            <textarea v-model="form.specifications" rows="4" required class="input-3d mt-1 block w-full h-32 py-2"></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Reference Images (Max 3)</label>
            <input type="file" @change="handleFileUpload" multiple accept="image/*" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
            
            <div v-if="previewUrls.length" class="mt-4 grid grid-cols-3 gap-4">
              <div v-for="(url, index) in previewUrls" :key="index" class="relative">
                <img :src="url" class="h-24 w-full object-cover rounded-lg shadow-sm" />
              </div>
            </div>
          </div>

          <div class="pt-4 sticky bottom-4 bg-white/80 backdrop-blur-md p-4 rounded-xl shadow-lg border border-gray-100 flex justify-end">
            <button type="button" @click="router.push('/dashboard')" class="text-gray-600 hover:text-gray-900 font-medium px-6 py-2 mr-4">Cancel</button>
            <button type="submit" :disabled="isSubmitting" class="btn-primary w-48">
              {{ isSubmitting ? 'Submitting...' : 'Submit Request' }}
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import api from '../api/axios';

const router = useRouter();
const form = ref({
  product_name: '',
  category: 'Electronics',
  quantity: '',
  budget_range: '',
  specifications: ''
});
const files = ref([]);
const previewUrls = ref([]);
const isSubmitting = ref(false);

const handleFileUpload = (event) => {
  const selectedFiles = Array.from(event.target.files).slice(0, 3);
  files.value = selectedFiles;
  
  previewUrls.value = selectedFiles.map(file => URL.createObjectURL(file));
};

const submitRequest = async () => {
  isSubmitting.value = true;
  try {
    const formData = new FormData();
    Object.keys(form.value).forEach(key => formData.append(key, form.value[key]));
    files.value.forEach(file => formData.append('images', file));

    await api.post('/requests', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    router.push('/dashboard');
  } catch (error) {
    console.error(error);
    alert('Failed to submit request');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

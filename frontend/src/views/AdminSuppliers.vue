<template>
  <div class="min-h-screen bg-background pb-12">
    <Navbar />
    
    <main class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Supplier Database</h1>
        <div class="flex items-center space-x-4">
           <router-link to="/admin" class="text-sm font-medium text-gray-500 hover:text-gray-900">
             &larr; Back
           </router-link>
           <button @click="isModalOpen = true" class="btn-primary inline-flex items-center">
             + New Supplier
           </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="sup in suppliers" :key="sup.id" class="glass-card p-6">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-bold text-gray-900">{{ sup.company_name }}</h3>
              <p class="text-sm text-gray-500">{{ sup.category }}</p>
            </div>
            <span class="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2 py-1 rounded">
              {{ sup.verification_level }}
            </span>
          </div>
          
          <dl class="text-sm text-gray-600 space-y-2 mt-4">
            <div class="flex justify-between">
              <dt>Contact</dt>
              <dd class="font-medium">{{ sup.contact_person }}</dd>
            </div>
            <div class="flex justify-between">
              <dt>Phone</dt>
              <dd>{{ sup.phone_china }}</dd>
            </div>
            <div class="flex justify-between">
              <dt>Email</dt>
              <dd class="truncate max-w-[150px]">{{ sup.email }}</dd>
            </div>
            <div class="flex justify-between border-t border-gray-100 pt-2 mt-2">
              <dt>Avg Rating</dt>
              <dd class="font-bold text-amber-500">⭐ {{ Number(sup.avg_rating).toFixed(1) }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Add Supplier Modal -->
      <div v-if="isModalOpen" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" @click="isModalOpen = false"></div>
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          <div class="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full p-6">
            <h3 class="text-lg leading-6 font-bold text-gray-900 mb-4">Add New Supplier</h3>
            <form @submit.prevent="submitSupplier" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Company Name</label>
                <input v-model="form.company_name" required class="input-3d block w-full mt-1" />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Category</label>
                  <input v-model="form.category" required class="input-3d block w-full mt-1" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Verification Level</label>
                  <select v-model="form.verification_level" class="input-3d block w-full mt-1">
                    <option value="Dokumen">Dokumen</option>
                    <option value="On-site">On-site</option>
                    <option value="Premium">Premium</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Contact Person</label>
                <input v-model="form.contact_person" required class="input-3d block w-full mt-1" />
              </div>
              <div class="grid grid-cols-2 gap-4">
                 <div>
                    <label class="block text-sm font-medium text-gray-700">Phone</label>
                    <input v-model="form.phone_china" required class="input-3d block w-full mt-1" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Email</label>
                    <input v-model="form.email" type="email" required class="input-3d block w-full mt-1" />
                  </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Factory Address</label>
                <textarea v-model="form.factory_address" rows="2" class="input-3d block w-full mt-1 py-2"></textarea>
              </div>

              <div class="mt-6 flex justify-end space-x-3">
                 <button type="button" @click="isModalOpen = false" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                 <button type="submit" class="btn-primary h-10 px-4 text-sm">Save Supplier</button>
              </div>
            </form>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Navbar from '../components/Navbar.vue';
import api from '../api/axios';

const suppliers = ref([]);
const isModalOpen = ref(false);

const form = ref({
  company_name: '',
  category: '',
  verification_level: 'Dokumen',
  contact_person: '',
  phone_china: '',
  email: '',
  factory_address: ''
});

const fetchSuppliers = async () => {
  try {
    const res = await api.get('/admin/suppliers');
    suppliers.value = res.data;
  } catch (error) {
    console.error(error);
  }
};

const submitSupplier = async () => {
  try {
    await api.post('/admin/suppliers', form.value);
    isModalOpen.value = false;
    form.value = { company_name: '', category: '', verification_level: 'Dokumen', contact_person: '', phone_china: '', email: '', factory_address: '' };
    fetchSuppliers();
  } catch (error) {
    alert('Failed to add supplier');
  }
};

onMounted(fetchSuppliers);
</script>

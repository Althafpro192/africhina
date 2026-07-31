<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" @click="closeModal"></div>

      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <div class="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-gray-100">
        <form @submit.prevent="submitUpdate" class="relative">
          
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 class="text-xl leading-6 font-bold text-gray-900" id="modal-title">
                  Update Request: {{ request.product_name }}
                </h3>
                <div class="mt-6 space-y-6">
                  
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Status</label>
                      <select v-model="form.status" class="input-3d mt-1 block w-full">
                        <option value="pending">Pending</option>
                        <option value="quoted">Quoted</option>
                        <option value="approved">Approved</option>
                        <option value="production">Production</option>
                        <option value="shipped">Shipped</option>
                        <option value="arrived">Arrived</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Assign Supplier</label>
                      <select v-model="form.assigned_supplier_id" class="input-3d mt-1 block w-full">
                        <option :value="null">-- Select Supplier --</option>
                        <option v-for="sup in suppliers" :key="sup.id" :value="sup.id">{{ sup.company_name }}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">Quoted Price (USD)</label>
                    <input v-model="form.quoted_price" type="number" step="0.01" class="input-3d mt-1 block w-full" />
                  </div>

                  <div v-if="['production', 'shipped'].includes(form.status)">
                    <label class="block text-sm font-medium text-gray-700">Production Progress ({{ form.production_progress }}%)</label>
                    <input v-model="form.production_progress" type="range" min="0" max="100" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2" />
                  </div>

                  <div>
                    <label class="block text-sm font-bold text-amber-700 mb-1">⚠️ Internal Notes (Hidden from Buyer)</label>
                    <textarea v-model="form.internal_notes" rows="3" class="input-3d mt-1 block w-full py-2 bg-amber-50 border-amber-200 focus:border-amber-500 focus:ring-amber-500/30"></textarea>
                  </div>

                  <div v-if="['production', 'shipped'].includes(form.status)">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Upload QC / Production Media</label>
                    <input type="file" @change="handleFileUpload" multiple accept="image/*" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  </div>

                  <!-- Email Trigger -->
                  <div class="pt-4 border-t border-gray-100" v-if="form.assigned_supplier_id">
                    <button type="button" @click="sendEmail" class="text-sm text-primary font-bold hover:underline flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      Send Email Update to Supplier
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>
          
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-100">
            <button type="submit" :disabled="isSaving" class="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-6 py-2 bg-primary text-base font-medium text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200">
              {{ isSaving ? 'Saving...' : 'Save Changes' }}
            </button>
            <button type="button" @click="closeModal" class="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-6 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useToast } from '../../composables/useToast.js';
const { showToast } = useToast();

import { ref, watch } from 'vue';
import api from '../api/axios';

const props = defineProps({
  isOpen: Boolean,
  request: Object,
  suppliers: Array
});

const emit = defineEmits(['close', 'updated']);

const form = ref({});
const files = ref([]);
const isSaving = ref(false);

watch(() => props.isOpen, (newVal) => {
  if (newVal && props.request) {
    form.value = {
      status: props.request.status,
      assigned_supplier_id: props.request.assigned_supplier_id || null,
      quoted_price: props.request.quoted_price || '',
      internal_notes: props.request.internal_notes || '',
      production_progress: props.request.production_progress || 0
    };
    files.value = [];
  }
});

const handleFileUpload = (event) => {
  files.value = Array.from(event.target.files).slice(0, 5); // Max 5 QC images
};

const closeModal = () => {
  emit('close');
};

const submitUpdate = async () => {
  isSaving.value = true;
  try {
    const formData = new FormData();
    Object.keys(form.value).forEach(key => {
      if (form.value[key] !== null) formData.append(key, form.value[key]);
    });
    files.value.forEach(file => formData.append('qc_images', file));

    await api.put(`/admin/requests/${props.request.id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    emit('updated');
    closeModal();
  } catch (error) {
    showToast('Failed to update');
  } finally {
    isSaving.value = false;
  }
};

const sendEmail = async () => {
  try {
    await api.post(`/admin/requests/${props.request.id}/email`, {
      subject: `Update regarding request ${props.request.product_name}`,
      body: `Hello,\n\nPlease provide an update regarding the sourcing request for ${props.request.product_name}.\n\nThank you,\nAfriChina Bridge Team.`
    });
    showToast('Email sent to supplier');
  } catch (error) {
    showToast('Failed to send email');
  }
};
</script>

<template>
  <AdminLayout>
    <main class="w-full max-w-[1600px] mx-auto space-y-8">
      <!-- Header -->
      <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 class="text-3xl sm:text-4xl font-black bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent tracking-tight">
            Supplier Management
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage and verify your global Chinese manufacturing network.
          </p>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full sm:w-auto">
          <div class="relative w-full sm:w-72">
            <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input 
              v-model="searchQuery"
              class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none text-xs sm:text-sm shadow-sm transition-all" 
              placeholder="Search suppliers..." 
              type="text"
            />
          </div>
          
          <button 
            @click="openCreateModal" 
            class="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all cursor-pointer"
          >
            <span class="material-symbols-outlined text-lg">add_business</span>
            <span>Add Supplier</span>
          </button>
        </div>
      </header>

      <!-- SUPPLIER TABLE SECTION -->
      <section class="bg-white/80 dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-indigo-500/5 overflow-hidden transition-colors duration-300">
        <div class="p-6 border-b border-slate-200/80 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <h4 class="text-base font-extrabold text-slate-900 dark:text-white">All Verified Suppliers</h4>
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400">{{ filteredSuppliers.length }} suppliers</span>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="text-slate-400 dark:text-slate-500 uppercase text-[10px] font-bold tracking-widest bg-slate-50/80 dark:bg-slate-950/40 border-b border-slate-200/60 dark:border-slate-800">
                <th class="px-6 py-4">Company Name</th>
                <th class="px-6 py-4">Category</th>
                <th class="px-6 py-4">Contact</th>
                <th class="px-6 py-4">Verification</th>
                <th class="px-6 py-4">Rating</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200/60 dark:divide-slate-800" v-if="!loading">
              <tr 
                v-for="supplier in filteredSuppliers" 
                :key="supplier.id" 
                class="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                      <span class="material-symbols-outlined text-xl">business</span>
                    </div>
                    <div>
                      <p class="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">{{ supplier.company_name }}</p>
                      <p class="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">{{ supplier.factory_address }}</p>
                    </div>
                  </div>
                </td>

                <td class="px-6 py-4">
                  <span class="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200/60 dark:border-slate-700">
                    {{ supplier.category }}
                  </span>
                </td>

                <td class="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">
                  <div class="font-semibold text-slate-900 dark:text-slate-200">{{ supplier.contact_person }}</div>
                  <div class="text-slate-400">{{ supplier.email }}</div>
                </td>

                <td class="px-6 py-4">
                  <span v-if="supplier.verification_level?.includes('Verified') || supplier.verification_level === 'verified'" class="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center w-fit gap-1">
                    <span class="material-symbols-outlined text-xs">verified</span> Verified
                  </span>
                  <span v-else class="bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center w-fit gap-1">
                    <span class="material-symbols-outlined text-xs">pending</span> Basic
                  </span>
                </td>

                <td class="px-6 py-4 font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  <div class="flex items-center gap-1 text-amber-500">
                    <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">star</span>
                    <span>{{ supplier.avg_rating ? Number(supplier.avg_rating).toFixed(1) : '4.8' }}</span>
                  </div>
                </td>

                <td class="px-6 py-4 text-right flex justify-end gap-2">
                  <button @click="openViewModal(supplier)" class="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    View
                  </button>
                  <button @click="openEditModal(supplier)" class="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline px-2.5 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors">
                    Edit
                  </button>
                  <button @click="deleteSupplierItem(supplier.id)" class="text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-2.5 py-1 rounded-lg transition-colors">
                    Delete
                  </button>
                </td>
              </tr>

              <tr v-if="filteredSuppliers.length === 0">
                <td colspan="6" class="px-6 py-12 text-center text-slate-400 dark:text-slate-500 text-xs font-medium">
                  No suppliers found matching your query.
                </td>
              </tr>
            </tbody>

            <tbody v-else>
              <tr>
                <td colspan="6" class="px-6 py-16 text-center">
                  <span class="material-symbols-outlined animate-spin text-indigo-600 dark:text-indigo-400 text-3xl">progress_activity</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- SUPPLIER FORM MODAL -->
      <div :class="['fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300', isModalOpen ? 'visible' : 'invisible']">
        <div class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" @click="closeModal"></div>
        
        <div :class="['bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl relative border border-slate-200 dark:border-slate-800 transition-all duration-300 text-slate-900 dark:text-white', isModalOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0']">
          <div class="flex justify-between items-start mb-6">
            <div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ isViewing ? 'Supplier Details' : (isEditing ? 'Edit Supplier' : 'Add New Supplier') }}</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure supplier verification and factory info</p>
            </div>
            <button @click="closeModal" class="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
              <span class="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          <form @submit.prevent="saveSupplier" class="space-y-4 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Company Name</label>
                <input v-model="form.company_name" required :disabled="isViewing" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 disabled:opacity-60" />
              </div>
              <div>
                <label class="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
                <input v-model="form.category" :disabled="isViewing" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 disabled:opacity-60" />
              </div>
              <div>
                <label class="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Contact Person</label>
                <input v-model="form.contact_person" :disabled="isViewing" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 disabled:opacity-60" />
              </div>
              <div>
                <label class="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Phone</label>
                <input v-model="form.phone_china" :disabled="isViewing" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 disabled:opacity-60" />
              </div>
              <div class="col-span-1 sm:col-span-2">
                <label class="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Email</label>
                <input v-model="form.email" type="email" :disabled="isViewing" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 disabled:opacity-60" />
              </div>
              <div class="col-span-1 sm:col-span-2">
                <label class="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Factory Address</label>
                <input v-model="form.factory_address" :disabled="isViewing" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 disabled:opacity-60" />
              </div>
              <div class="col-span-1 sm:col-span-2">
                <label class="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Verification Level</label>
                <select v-model="form.verification_level" :disabled="isViewing" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 disabled:opacity-60">
                  <option value="Level 1 - Basic">Level 1 - Basic</option>
                  <option value="Level 2 - Advanced">Level 2 - Advanced</option>
                  <option value="Level 3 - Gold">Level 3 - Gold</option>
                  <option value="Level 4 - Premium">Level 4 - Premium Verified</option>
                </select>
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <button type="button" @click="closeModal" class="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                {{ isViewing ? 'Close' : 'Cancel' }}
              </button>
              <button v-if="!isViewing" type="submit" :disabled="saving" class="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg hover:bg-indigo-500 transition-all disabled:opacity-50 flex items-center gap-2">
                <span v-if="saving" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                {{ isEditing ? 'Save Changes' : 'Save Supplier' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </AdminLayout>
</template>

<script setup>
import { useToast } from '../../composables/useToast.js';
const { showToast } = useToast();

import { ref, onMounted, computed } from 'vue'
import { supplierService } from '../../api/supplierService.js'
import AdminLayout from '../../components/layout/AdminLayout.vue'

const searchQuery = ref('')
const loading = ref(true)
const suppliers = ref([])
const saving = ref(false)

const isModalOpen = ref(false)
const isEditing = ref(false)
const isViewing = ref(false)
const editingId = ref(null)

const form = ref({
  company_name: '',
  category: '',
  contact_person: '',
  phone_china: '',
  email: '',
  factory_address: '',
  verification_level: 'Level 1 - Basic'
})

const filteredSuppliers = computed(() => {
  if (!searchQuery.value) return suppliers.value
  const q = searchQuery.value.toLowerCase()
  return suppliers.value.filter(s => 
    s.company_name.toLowerCase().includes(q) || 
    s.category.toLowerCase().includes(q) ||
    s.factory_address?.toLowerCase().includes(q)
  )
})

const loadSuppliers = async () => {
  loading.value = true
  try {
    suppliers.value = await supplierService.getAll()
  } catch (error) {
    console.error('Failed to load suppliers:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadSuppliers()
})

const openCreateModal = () => {
  isEditing.value = false
  isViewing.value = false
  editingId.value = null
  form.value = {
    company_name: '',
    category: '',
    contact_person: '',
    phone_china: '',
    email: '',
    factory_address: '',
    verification_level: 'Level 1 - Basic'
  }
  isModalOpen.value = true
}

const openEditModal = (supplier) => {
  isEditing.value = true
  isViewing.value = false
  editingId.value = supplier.id
  form.value = { ...supplier }
  isModalOpen.value = true
}

const openViewModal = (supplier) => {
  isEditing.value = false
  isViewing.value = true
  editingId.value = supplier.id
  form.value = { ...supplier }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const saveSupplier = async () => {
  saving.value = true
  try {
    if (isEditing.value) {
      await supplierService.update(editingId.value, form.value)
    } else {
      await supplierService.create(form.value)
    }
    closeModal()
    await loadSuppliers()
  } catch (error) {
    showToast(error.response?.data?.message || 'Failed to save supplier')
  } finally {
    saving.value = false
  }
}

const deleteSupplierItem = async (id) => {
  if (!confirm('Are you sure you want to delete this supplier?')) return
  try {
    await supplierService.remove(id)
    await loadSuppliers()
  } catch (error) {
    showToast(error.response?.data?.message || 'Failed to delete supplier')
  }
}
</script>

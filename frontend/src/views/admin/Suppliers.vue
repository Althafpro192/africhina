<template>
  <div class="flex min-h-screen text-[#1d1b20]" style="background: radial-gradient(circle at top left, #fdf7ff, #f2ecf4); font-family: 'Inter', sans-serif; overflow-x: hidden;">
    
    <!-- SIDEBAR -->
    <aside class="glass-panel w-72 h-screen sticky top-0 flex flex-col p-6 z-40 border-r-0 rounded-r-3xl deep-shadow">
      <div class="mb-10 flex items-center gap-3">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4f378a] to-[#6750a4] flex items-center justify-center shadow-lg border-t border-white/40">
          <span class="material-symbols-outlined text-white text-2xl" style="font-variation-settings: 'FILL' 1;">badge</span>
        </div>
        <div>
          <h1 class="text-[24px] leading-[1.3] font-bold text-[#4f378a] tracking-tight">{{ $t('auth.title') }}</h1>
          <p class="text-[10px] font-bold text-[#7a7582] tracking-widest uppercase">{{ $t('nav.admin_terminal') }}</p>
        </div>
      </div>

      <nav class="flex-1 space-y-3">
        <!-- Inactive Nav Item (Dashboard) -->
        <a @click="router.push('/admin/dashboard')" class="flex items-center gap-4 px-4 py-3 rounded-xl text-[#494551] hover:bg-[#ece6ee] transition-all lift-effect group cursor-pointer">
          <div class="w-8 h-8 rounded-lg bg-[#e6e0e9] flex items-center justify-center shadow-sm border border-white/50">
            <span class="material-symbols-outlined text-xl text-[#4f378a]" style="font-variation-settings: 'FILL' 0;">dashboard</span>
          </div>
          <span class="text-[14px] leading-[1.2] tracking-[0.01em] font-semibold">{{ $t('nav.dashboard') }}</span>
        </a>
        
        <!-- Active Nav Item (Suppliers) -->
        <a class="flex items-center gap-4 px-4 py-3 rounded-xl bg-gradient-to-r from-[#4f378a] to-[#6750a4] text-white shadow-lg lift-effect group cursor-pointer">
          <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shadow-inner">
            <span class="material-symbols-outlined text-xl" style="font-variation-settings: 'FILL' 1;">business</span>
          </div>
          <span class="text-[14px] leading-[1.2] tracking-[0.01em] font-semibold">{{ $t('nav.suppliers') }}</span>
        </a>
      </nav>

      <!-- Profile Section -->
      <div class="mt-auto pt-6 border-t border-[#cbc4d2] space-y-4">
        <div class="flex items-center gap-3 p-2 rounded-2xl bg-[#f8f2fa] border border-white/30">
          <div class="relative">
            <div class="w-10 h-10 rounded-full border-2 border-[#4f378a] overflow-hidden shadow-md flex items-center justify-center bg-gray-200">
              <span class="material-symbols-outlined text-[#4f378a]">person</span>
            </div>
            <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div class="flex-1 overflow-hidden">
            <p class="text-[14px] leading-[1.2] tracking-[0.01em] font-semibold text-[#1d1b20] truncate">{{ user.full_name }}</p>
            <p class="text-[10px] text-[#494551]">Administrator</p>
          </div>
        </div>
        <button @click="logout" class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#e6e0e9] text-[#4f378a] font-semibold shadow-md hover:bg-[#ffdad6] hover:text-[#93000a] transition-colors lift-effect">
          <span class="material-symbols-outlined text-xl">logout</span>
          <span class="text-[14px] leading-[1.2] tracking-[0.01em] font-semibold">{{ $t('nav.logout') }}</span>
        </button>
      </div>
    </aside>

    <!-- MAIN CONTENT -->
    <main class="flex-1 p-10 max-w-[1600px] mx-auto space-y-10">
      <!-- Header -->
      <header class="flex justify-between items-end gap-6">
        <div>
          <h2 class="text-[48px] leading-[1.1] tracking-[-0.02em] font-extrabold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">Supplier Management</h2>
          <p class="text-[16px] leading-[1.6] font-normal text-[#494551]">Manage your verified supplier network</p>
        </div>
        <div class="flex gap-4 items-center">
          <div class="relative w-80">
            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#7a7582]">search</span>
            <input 
              v-model="searchQuery"
              class="w-full pl-12 pr-4 py-3 rounded-2xl glass-panel inner-recess border-none focus:ring-4 focus:ring-[#4f378a]/20 text-[#1d1b20] placeholder:text-[#cbc4d2] outline-none" 
              placeholder="Search suppliers..." 
              type="text"
            />
          </div>
          <button @click="openCreateModal" class="bg-[#4f378a] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-[#4f378a]/20 lift-effect border-t border-white/30">
            <span class="material-symbols-outlined">add_business</span>
            Add Supplier
          </button>
          <LanguageSwitcher />
        </div>
      </header>

      <!-- TABLE SECTION -->
      <section class="glass-panel rounded-3xl deep-shadow overflow-hidden">
        <div class="p-6 border-b border-[#cbc4d2] flex justify-between items-center bg-white/30">
          <h4 class="text-[24px] leading-[1.3] font-bold text-[#4f378a]">All Suppliers</h4>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="text-[#7a7582] uppercase text-[11px] font-bold tracking-widest bg-[#f8f2fa]/50">
                <th class="px-8 py-4">Company Name</th>
                <th class="px-6 py-4">Category</th>
                <th class="px-6 py-4">Contact</th>
                <th class="px-6 py-4">Verification</th>
                <th class="px-6 py-4">Rating</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#cbc4d2]/30" v-if="!loading">
              <tr v-for="supplier in filteredSuppliers" :key="supplier.id" class="group hover:bg-gradient-to-r hover:from-[#4f378a]/5 hover:to-transparent transition-all">
                <td class="px-8 py-5">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full border-2 border-[#4f378a]/30 flex items-center justify-center bg-gray-100">
                      <span class="material-symbols-outlined text-[#4f378a]">business</span>
                    </div>
                    <div>
                      <p class="font-bold text-[#1d1b20]">{{ supplier.company_name }}</p>
                      <p class="text-xs text-[#7a7582]">{{ supplier.factory_address }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-5">
                  <span class="bg-[#ece6ee] px-3 py-1 rounded-lg text-[#4f378a] text-xs font-bold border border-white/50 shadow-sm">{{ supplier.category }}</span>
                </td>
                <td class="px-6 py-5 text-sm text-[#494551]">
                  <div>{{ supplier.contact_person }}</div>
                  <div class="text-xs text-gray-500">{{ supplier.email }}</div>
                </td>
                <td class="px-6 py-5">
                  <span v-if="supplier.verification_level === 'verified'" class="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold flex items-center w-fit gap-1"><span class="material-symbols-outlined text-[14px]">verified</span> Verified</span>
                  <span v-else class="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold flex items-center w-fit gap-1"><span class="material-symbols-outlined text-[14px]">pending</span> Basic</span>
                </td>
                <td class="px-6 py-5 font-bold text-[#1d1b20]">
                  <div class="flex items-center gap-1 text-yellow-500">
                    <span class="material-symbols-outlined text-[16px]">star</span>
                    {{ supplier.avg_rating ? Number(supplier.avg_rating).toFixed(1) : 'N/A' }}
                  </div>
                </td>
                <td class="px-6 py-5 text-right">
                  <button @click="openEditModal(supplier)" class="text-[#7a7582] hover:text-[#4f378a] px-3 py-1 rounded-lg hover:bg-gray-100 transition-all text-sm font-semibold mr-2">
                    Edit
                  </button>
                  <button @click="deleteSupplierItem(supplier.id)" class="text-red-500 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50 transition-all text-sm font-semibold">
                    Delete
                  </button>
                </td>
              </tr>
              <tr v-if="filteredSuppliers.length === 0">
                <td colspan="6" class="px-8 py-10 text-center text-gray-500">
                  No suppliers found.
                </td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr>
                <td colspan="6" class="px-8 py-10 text-center text-gray-500">
                  <span class="material-symbols-outlined animate-spin text-[#3525cd]" style="font-size: 32px;">progress_activity</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>

    <!-- SUPPLIER FORM MODAL -->
    <div :class="['fixed inset-0 z-50 flex items-center justify-center transition-all duration-300', isModalOpen ? 'visible' : 'invisible']">
      <div class="absolute inset-0 bg-[#322f35]/40 backdrop-blur-sm" @click="closeModal"></div>
      
      <div :class="['glass-panel w-[600px] rounded-3xl p-8 deep-shadow relative border-white/40 transition-all duration-300', isModalOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0']">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h3 class="text-[24px] leading-[1.3] font-bold text-[#4f378a]">{{ isEditing ? 'Edit Supplier' : 'Add New Supplier' }}</h3>
          </div>
          <button @click="closeModal" class="text-[#7a7582] hover:text-[#4f378a] transition-colors">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <form @submit.prevent="saveSupplier" class="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-[12px] font-semibold text-[#494551] block mb-1">Company Name</label>
              <input v-model="form.company_name" required class="w-full px-4 py-3 rounded-2xl glass-panel inner-recess border-none focus:ring-4 focus:ring-[#4f378a]/20 outline-none" />
            </div>
            <div>
              <label class="text-[12px] font-semibold text-[#494551] block mb-1">Category</label>
              <input v-model="form.category" class="w-full px-4 py-3 rounded-2xl glass-panel inner-recess border-none focus:ring-4 focus:ring-[#4f378a]/20 outline-none" />
            </div>
            <div>
              <label class="text-[12px] font-semibold text-[#494551] block mb-1">Contact Person</label>
              <input v-model="form.contact_person" class="w-full px-4 py-3 rounded-2xl glass-panel inner-recess border-none focus:ring-4 focus:ring-[#4f378a]/20 outline-none" />
            </div>
            <div>
              <label class="text-[12px] font-semibold text-[#494551] block mb-1">Phone</label>
              <input v-model="form.phone_china" class="w-full px-4 py-3 rounded-2xl glass-panel inner-recess border-none focus:ring-4 focus:ring-[#4f378a]/20 outline-none" />
            </div>
            <div class="col-span-2">
              <label class="text-[12px] font-semibold text-[#494551] block mb-1">Email</label>
              <input v-model="form.email" type="email" class="w-full px-4 py-3 rounded-2xl glass-panel inner-recess border-none focus:ring-4 focus:ring-[#4f378a]/20 outline-none" />
            </div>
            <div class="col-span-2">
              <label class="text-[12px] font-semibold text-[#494551] block mb-1">Factory Address</label>
              <input v-model="form.factory_address" class="w-full px-4 py-3 rounded-2xl glass-panel inner-recess border-none focus:ring-4 focus:ring-[#4f378a]/20 outline-none" />
            </div>
            <div class="col-span-2">
              <label class="text-[12px] font-semibold text-[#494551] block mb-1">Verification Level</label>
              <select v-model="form.verification_level" class="w-full px-4 py-3 rounded-2xl glass-panel inner-recess border-none focus:ring-4 focus:ring-[#4f378a]/20 outline-none bg-transparent text-[#1d1b20]">
                <option value="Level 1 - Basic">Level 1 - Basic</option>
                <option value="Level 2 - Advanced">Level 2 - Advanced</option>
                <option value="Level 3 - Gold">Level 3 - Gold</option>
                <option value="Level 4 - Premium">Level 4 - Premium</option>
              </select>
            </div>
          </div>

          <div class="flex gap-4 pt-6">
            <button type="button" @click="closeModal" class="flex-1 py-3 rounded-2xl bg-[#ece6ee] text-[#1d1b20] font-bold hover:bg-[#e6e0e9] transition-all lift-effect">
              Cancel
            </button>
            <button type="submit" :disabled="saving" class="flex-[2] px-8 py-3 rounded-2xl bg-[#4f378a] text-white font-bold shadow-lg shadow-[#4f378a]/20 border-t border-white/30 lift-effect disabled:opacity-70">
              <span v-if="saving" class="material-symbols-outlined animate-spin align-middle mr-2 text-sm">progress_activity</span>
              Save Supplier
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import LanguageSwitcher from '../../components/LanguageSwitcher.vue'
import { supplierService } from '../../api/supplierService.js'

const router = useRouter()

// Reactive State
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
const searchQuery = ref('')
const loading = ref(true)
const suppliers = ref([])
const saving = ref(false)

const isModalOpen = ref(false)
const isEditing = ref(false)
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
  form.value = { company_name: '', category: '', contact_person: '', phone_china: '', email: '', factory_address: '', verification_level: 'basic' }
  isModalOpen.value = true
}

const openEditModal = (supplier) => {
  isEditing.value = true
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
    alert(error.response?.data?.message || 'Failed to save supplier')
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
    alert(error.response?.data?.message || 'Failed to delete supplier')
  }
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

:root {
  --glass-bg: rgba(255, 255, 255, 0.7);
  --glass-border: rgba(255, 255, 255, 0.5);
  --glass-blur: 20px;
}
.glass-panel { background: var(--glass-bg); backdrop-filter: blur(var(--glass-blur)); -webkit-backdrop-filter: blur(var(--glass-blur)); border: 1px solid var(--glass-border); border-top-width: 1.5px; }
.deep-shadow { box-shadow: 0 20px 50px rgba(79, 70, 229, 0.15); }
.lift-effect { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease; }
.lift-effect:hover { transform: translateY(-8px); box-shadow: 0 30px 60px rgba(79, 70, 229, 0.2); }
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
.inner-recess { box-shadow: inset 0 2px 4px rgba(0,0,0,0.06); }
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbc4d2; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4f378a; }
</style>

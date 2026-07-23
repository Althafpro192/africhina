<template>
  <AdminLayout>
    <main class="w-full max-w-[1600px] mx-auto space-y-8">
      
      <!-- Header -->
      <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 class="text-3xl sm:text-4xl font-black bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent tracking-tight">
            {{ $t('admin.title') }}
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {{ $t('admin.subtitle') }}
          </p>
        </div>
        
        <div class="flex gap-4 items-center w-full sm:w-auto">
          <div class="relative w-full sm:w-80">
            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input 
              v-model="searchQuery"
              class="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none text-xs sm:text-sm shadow-sm transition-all" 
              :placeholder="$t('admin.search_placeholder')" 
              type="text"
            />
          </div>
        </div>
      </header>

      <!-- STATS GRID -->
      <section v-if="stats" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div v-lazy-render class="bg-white/80 dark:bg-slate-900/80 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div class="flex justify-between items-start mb-4">
            <div class="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
              <span class="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-2xl" style="font-variation-settings: 'FILL' 1;">assignment</span>
            </div>
          </div>
          <h3 class="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{{ $t('admin.total_requests') }}</h3>
          <p class="text-3xl sm:text-4xl font-black mt-1 text-slate-900 dark:text-white">{{ stats.total_requests }}</p>
        </div>

        <div v-lazy-render class="bg-white/80 dark:bg-slate-900/80 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div class="flex justify-between items-start mb-4">
            <div class="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center border border-amber-200 dark:border-amber-800">
              <span class="material-symbols-outlined text-amber-600 dark:text-amber-400 text-2xl" style="font-variation-settings: 'FILL' 1;">hourglass_empty</span>
            </div>
            <span class="text-[10px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-full">Requires Action</span>
          </div>
          <h3 class="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{{ $t('admin.pending_approval') }}</h3>
          <p class="text-3xl sm:text-4xl font-black mt-1 text-slate-900 dark:text-white">{{ stats.pending_requests }}</p>
        </div>

        <div v-lazy-render class="bg-white/80 dark:bg-slate-900/80 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div class="flex justify-between items-start mb-4">
            <div class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center border border-blue-200 dark:border-blue-800">
              <span class="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl" style="font-variation-settings: 'FILL' 1;">conveyor_belt</span>
            </div>
          </div>
          <h3 class="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{{ $t('admin.in_processing') }}</h3>
          <p class="text-3xl sm:text-4xl font-black mt-1 text-slate-900 dark:text-white">{{ stats.processing_requests }}</p>
        </div>

        <div v-lazy-render class="bg-white/80 dark:bg-slate-900/80 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div class="flex justify-between items-start mb-4">
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
              <span class="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-2xl" style="font-variation-settings: 'FILL' 1;">task_alt</span>
            </div>
          </div>
          <h3 class="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{{ $t('admin.completed_deals') }}</h3>
          <p class="text-3xl sm:text-4xl font-black mt-1 text-slate-900 dark:text-white">{{ stats.completed_requests }}</p>
        </div>
      </section>

      <!-- TABLE SECTION -->
      <section class="bg-white/80 dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-indigo-500/5 overflow-hidden transition-colors duration-300">
        <div class="p-6 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <h4 class="text-lg font-extrabold text-slate-900 dark:text-white">{{ $t('admin.recent_requests') }}</h4>
          <div class="flex flex-wrap gap-3">
            <select v-model="filterStatus" class="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-xs font-semibold text-slate-700 dark:text-slate-200">
              <option value="">All Statuses</option>
              <option value="menunggu_penawaran_admin">Pending</option>
              <option value="menunggu_pemilihan_buyer">Quoted</option>
              <option value="sedang_diproses">Processing</option>
              <option value="dikirim">Shipped</option>
              <option value="selesai">Completed</option>
              <option value="batal">Rejected</option>
            </select>
            <select v-model="filterCategory" class="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-xs font-semibold text-slate-700 dark:text-slate-200">
              <option value="">All Categories</option>
              <option value="Machinery">Machinery</option>
              <option value="Electronics">Electronics</option>
              <option value="Textiles">Textiles</option>
              <option value="Construction">Construction</option>
              <option value="Solar">Solar</option>
            </select>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="text-slate-400 dark:text-slate-500 uppercase text-[10px] font-bold tracking-widest bg-slate-50/80 dark:bg-slate-950/40 border-b border-slate-200/60 dark:border-slate-800">
                <th class="px-6 py-4">{{ $t('admin.buyer_entity') }}</th>
                <th class="px-6 py-4">{{ $t('admin.category') }}</th>
                <th class="px-6 py-4">{{ $t('admin.request_date') }}</th>
                <th class="px-6 py-4">{{ $t('admin.est_volume') }}</th>
                <th class="px-6 py-4">{{ $t('admin.status') }}</th>
                <th class="px-6 py-4 text-right">{{ $t('admin.actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200/60 dark:divide-slate-800" v-if="!loading">
              <tr 
                v-for="req in filteredRequests" 
                :key="req.id"
                v-lazy-render
                class="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                <td class="px-6 py-4" @click="router.push(`/admin/request/${req.id}`)">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                      <span class="material-symbols-outlined text-xl">business</span>
                    </div>
                    <div>
                      <p class="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {{ req.company_name || req.buyer_name }}
                      </p>
                      <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{{ req.product_name }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200/60 dark:border-slate-700">
                    {{ req.category }}
                  </span>
                </td>
                <td class="px-6 py-4 text-xs font-medium text-slate-600 dark:text-slate-400">{{ formatDate(req.created_at) }}</td>
                <td class="px-6 py-4 font-bold text-xs sm:text-sm text-slate-900 dark:text-white">{{ req.quoted_price ? '$' + Number(req.quoted_price).toLocaleString() : 'Pending' }}</td>
                <td class="px-6 py-4">
                  <div :class="getStatusBadgeClass(req.status)">
                    {{ formatStatusLabel(req.status) }}
                  </div>
                </td>
                <td class="px-6 py-4 text-right flex justify-end gap-2">
                  <button 
                    @click.stop="openTempPasswordModal(req)"
                    class="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/60 rounded-xl transition-colors"
                    title="Generate Temporary Password for Buyer"
                  >
                    <span class="material-symbols-outlined text-lg">key</span>
                  </button>
                  <button 
                    @click.stop="openStatusModal(req)" 
                    class="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 transition-all"
                  >
                    Edit Status
                  </button>
                  <button 
                    @click.stop="openMediaModal(req)" 
                    class="p-1.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors" 
                    title="Upload QC Media"
                  >
                    <span class="material-symbols-outlined text-lg">add_a_photo</span>
                  </button>
                </td>
              </tr>
              <tr v-if="filteredRequests.length === 0">
                <td colspan="6" class="px-6 py-12 text-center text-slate-400 dark:text-slate-500 text-xs font-medium">
                  No sourcing requests match the selected filters.
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
    </main>

    <!-- TEMP PASSWORD MODAL -->
    <div :class="['fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300', isTempPassModalOpen ? 'visible' : 'invisible']">
      <div :class="['absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300', isTempPassModalOpen ? 'opacity-100' : 'opacity-0']" @click="closeTempPasswordModal"></div>
      <div :class="['bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl relative border border-slate-200 dark:border-slate-800 transition-all duration-300 text-slate-900 dark:text-white', isTempPassModalOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0']">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h3 class="text-xl font-bold text-slate-900 dark:text-white">Generate Temporary Password</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Buyer: {{ targetUserForPass?.buyer_name || targetUserForPass?.company_name }}</p>
          </div>
          <button @click="closeTempPasswordModal" class="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div v-if="generatedTempPassword" class="space-y-4">
          <div class="p-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 rounded-2xl text-center">
            <p class="text-xs text-amber-800 dark:text-amber-300 font-medium mb-1">Temporary Password (Valid 24h)</p>
            <p class="text-2xl font-mono font-bold tracking-widest text-slate-900 dark:text-white select-all my-2">
              {{ generatedTempPassword }}
            </p>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">Share this code with the buyer through a secure channel.</p>
          </div>

          <button @click="copyTempPassword" class="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2">
            <span class="material-symbols-outlined text-sm">content_copy</span>
            Copy Temporary Password
          </button>
        </div>

        <div v-else class="space-y-4">
          <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Clicking generate will create a secure 12-character temporary password expiring in 24 hours. The buyer will be required to set a new password upon login.
          </p>
          <button @click="confirmGenerateTempPassword" :disabled="generatingTempPass" class="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
            <span v-if="generatingTempPass" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
            <span class="material-symbols-outlined text-sm" v-else>key</span>
            Generate Temporary Password
          </button>
        </div>
      </div>
    </div>

    <!-- STATUS UPDATE MODAL -->
    <div :class="['fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300', isModalOpen ? 'visible' : 'invisible']">
      <div 
        :class="['absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300', isModalOpen ? 'opacity-100' : 'opacity-0']" 
        @click="closeStatusModal"
      ></div>
      
      <div :class="['bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl relative border border-slate-200 dark:border-slate-800 transition-all duration-300 text-slate-900 dark:text-white', isModalOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0']">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h3 class="text-xl font-bold text-slate-900 dark:text-white">{{ $t('admin.update_status_title') }}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate max-w-xs">{{ editingRequest?.product_name }}</p>
          </div>
          <button @click="closeStatusModal" class="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div class="space-y-5">
          <div class="space-y-2">
            <label class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{{ $t('admin.update_status_to') }}</label>
            <div class="grid grid-cols-2 gap-2.5">
              <button 
                v-for="status in statusOptions" 
                :key="status.value"
                @click="selectedStatus = status.value" 
                :class="['flex items-center gap-2.5 p-3 rounded-2xl border transition-all text-xs font-bold text-left', selectedStatus === status.value ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/50' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300']"
              >
                <span :class="['material-symbols-outlined text-lg', selectedStatus === status.value ? 'text-indigo-600 dark:text-indigo-400' : status.color]">{{ status.icon }}</span>
                <span>{{ status.label }}</span>
              </button>
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Price Quote</label>
            <div class="flex gap-2">
              <select v-model="adminCurrency" class="w-1/3 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-xs font-bold text-slate-900 dark:text-white">
                <option value="USD">USD ($)</option>
                <option value="CNY">CNY (¥)</option>
                <option value="EUR">EUR (€)</option>
              </select>
              <input 
                v-model="adminPrice"
                type="number"
                class="w-2/3 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. 4500"
              />
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{{ $t('admin.assign_supplier') }}</label>
            <select v-model="selectedSupplier" class="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-xs sm:text-sm text-slate-900 dark:text-white">
              <option value="">None</option>
              <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
                {{ supplier.company_name }}
              </option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{{ $t('admin.internal_notes') }}</label>
            <textarea 
              v-model="internalNotes" 
              class="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 h-20 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 resize-none" 
              placeholder="Internal updates..."
            ></textarea>
          </div>

          <div class="flex gap-3 pt-3">
            <button @click="closeStatusModal" class="flex-1 py-2.5 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              {{ $t('admin.cancel') }}
            </button>
            <button @click="saveChanges" :disabled="saving" class="flex-[2] py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-lg hover:bg-indigo-500 transition-all disabled:opacity-50 flex items-center justify-center">
              <span v-if="saving" class="material-symbols-outlined animate-spin text-sm mr-2">progress_activity</span>
              {{ $t('admin.save_changes') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- QC MEDIA MODAL -->
    <div :class="['fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300', isMediaModalOpen ? 'visible' : 'invisible']">
      <div 
        :class="['absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300', isMediaModalOpen ? 'opacity-100' : 'opacity-0']" 
        @click="closeMediaModal"
      ></div>
      
      <div :class="['bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl relative border border-slate-200 dark:border-slate-800 transition-all duration-300 text-slate-900 dark:text-white', isMediaModalOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0']">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h3 class="text-xl font-bold text-slate-900 dark:text-white">Upload QC Media</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate max-w-xs">{{ editingRequest?.product_name }}</p>
          </div>
          <button @click="closeMediaModal" class="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div class="space-y-4">
          <div
            @click="triggerQcUpload"
            class="border-2 border-dashed border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl p-6 text-center cursor-pointer hover:border-indigo-500 transition-all"
          >
            <input ref="qcFileInput" type="file" multiple accept="image/*,video/*" @change="handleQcSelect" class="hidden" />
            <span class="material-symbols-outlined text-3xl text-indigo-600 dark:text-indigo-400 mb-2">add_a_photo</span>
            <p class="text-xs text-slate-500 dark:text-slate-400 font-semibold">Click or drag media here to upload QC updates</p>
          </div>
          
          <div v-if="qcFiles.length > 0" class="flex gap-2 overflow-x-auto py-2">
            <div v-for="(file, idx) in qcFiles" :key="idx" class="relative shrink-0 w-16 h-16 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden group">
              <img v-if="file.type.startsWith('image/')" :src="file.preview" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <span class="material-symbols-outlined text-slate-400">videocam</span>
              </div>
              <button @click.prevent="removeQcFile(idx)" class="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span class="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          </div>

          <div class="flex gap-3 pt-4">
            <button @click="closeMediaModal" class="flex-1 py-2.5 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button @click="saveMedia" :disabled="uploadingMedia || qcFiles.length === 0" class="flex-[2] py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-lg hover:bg-indigo-500 transition-all disabled:opacity-50 flex items-center justify-center">
              <span v-if="uploadingMedia" class="material-symbols-outlined animate-spin text-sm mr-2">progress_activity</span>
              Upload Media
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import AdminLayout from '../../components/layout/AdminLayout.vue'
import { adminService } from '../../api/adminService.js'
import { supplierService } from '../../api/supplierService.js'
import vLazyRender from '../../directives/vLazyRender.js'
import { useToast } from '../../composables/useToast.js'

const { showToast } = useToast()
const router = useRouter()

const searchQuery = ref('')
const filterStatus = ref('')
const filterCategory = ref('')
const loading = ref(true)
const requests = ref([])
const stats = ref(null)
const suppliers = ref([])
const saving = ref(false)

const isModalOpen = ref(false)
const isMediaModalOpen = ref(false)
const isTempPassModalOpen = ref(false)
const generatingTempPass = ref(false)
const targetUserForPass = ref(null)
const generatedTempPassword = ref('')

const uploadingMedia = ref(false)
const editingRequest = ref(null)
const selectedStatus = ref('pending')
const selectedSupplier = ref('')
const adminPrice = ref('')
const adminCurrency = ref('USD')
const internalNotes = ref('')
const productionProgress = ref(0)
const qcFiles = ref([])
const qcFileInput = ref(null)

const statusOptions = [
  { value: 'menunggu_penawaran_admin', label: 'Pending', icon: 'hourglass_empty', color: 'text-amber-500' },
  { value: 'menunggu_pemilihan_buyer', label: 'Quoted', icon: 'request_quote', color: 'text-indigo-500' },
  { value: 'sedang_diproses', label: 'Processing', icon: 'conveyor_belt', color: 'text-blue-500' },
  { value: 'dikirim', label: 'Shipped', icon: 'local_shipping', color: 'text-purple-500' },
  { value: 'selesai', label: 'Completed', icon: 'task_alt', color: 'text-emerald-500' },
  { value: 'batal', label: 'Rejected', icon: 'cancel', color: 'text-rose-500' }
]

const filteredRequests = computed(() => {
  let result = requests.value
  if (filterStatus.value) {
    result = result.filter(r => r.status === filterStatus.value)
  }
  if (filterCategory.value) {
    result = result.filter(r => r.category && r.category.toLowerCase() === filterCategory.value.toLowerCase())
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(r => 
      r.product_name?.toLowerCase().includes(q) || 
      r.company_name?.toLowerCase().includes(q) ||
      r.buyer_name?.toLowerCase().includes(q)
    )
  }
  return result
})

const loadData = async () => {
  loading.value = true
  try {
    const data = await adminService.getAdminRequests()
    requests.value = Array.isArray(data) ? data : (data.data || [])
    stats.value = await adminService.getStatistics()
    suppliers.value = await supplierService.getAll()
  } catch (error) {
    console.error('Failed to load admin data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})

const openTempPasswordModal = (req) => {
  targetUserForPass.value = req
  generatedTempPassword.value = ''
  isTempPassModalOpen.value = true
}

const closeTempPasswordModal = () => {
  isTempPassModalOpen.value = false
  targetUserForPass.value = null
  generatedTempPassword.value = ''
}

const confirmGenerateTempPassword = async () => {
  if (!targetUserForPass.value?.user_id) {
    showToast('Invalid buyer user ID');
    return;
  }
  generatingTempPass.value = true
  try {
    const token = localStorage.getItem('token')
    const res = await axios.post(`/api/v1/admin/users/${targetUserForPass.value.user_id}/generate-temp-password`, {}, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    generatedTempPassword.value = res.data.tempPassword
    showToast('Temporary password generated!')
  } catch (err) {
    showToast(err.response?.data?.message || 'Failed to generate temporary password')
  } finally {
    generatingTempPass.value = false
  }
}

const copyTempPassword = () => {
  if (generatedTempPassword.value) {
    navigator.clipboard.writeText(generatedTempPassword.value)
    showToast('Temporary password copied to clipboard!')
  }
}

const getStatusBadgeClass = (status) => {
  const base = 'inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-xs'
  const map = {
    'menunggu_penawaran_admin': 'text-amber-700 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
    'menunggu_pemilihan_buyer': 'text-indigo-700 bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800',
    'menunggu_kesepakatan_final': 'text-indigo-700 bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800',
    'menunggu_pembayaran': 'text-blue-700 bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
    'menunggu_verifikasi_pembayaran': 'text-blue-700 bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
    'sedang_diproses': 'text-blue-700 bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
    'dikirim': 'text-purple-700 bg-purple-100 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800',
    'menunggu_verifikasi_admin': 'text-purple-700 bg-purple-100 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800',
    'selesai': 'text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
    'batal': 'text-rose-700 bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800',
    'dispute': 'text-rose-700 bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
  }
  return `${base} ${map[status] || 'text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300'}`
}

const formatStatusLabel = (status) => {
  const map = {
    'menunggu_penawaran_admin': 'PENDING',
    'menunggu_pemilihan_buyer': 'QUOTED',
    'menunggu_kesepakatan_final': 'QUOTED',
    'menunggu_pembayaran': 'PROCESSING',
    'menunggu_verifikasi_pembayaran': 'PROCESSING',
    'sedang_diproses': 'PROCESSING',
    'dikirim': 'SHIPPED',
    'menunggu_verifikasi_admin': 'SHIPPED',
    'selesai': 'COMPLETED',
    'batal': 'REJECTED',
    'dispute': 'DISPUTE'
  }
  return map[status] || status.toUpperCase()
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const openStatusModal = (req) => {
  editingRequest.value = req
  selectedStatus.value = req.status
  selectedSupplier.value = req.assigned_supplier_id || ''
  adminPrice.value = req.quoted_price || ''
  adminCurrency.value = req.currency || 'USD'
  internalNotes.value = ''
  productionProgress.value = req.production_progress || 0
  qcFiles.value = []
  isModalOpen.value = true
}

const closeStatusModal = () => {
  isModalOpen.value = false
  editingRequest.value = null
}

const openMediaModal = (req) => {
  editingRequest.value = req
  qcFiles.value = []
  isMediaModalOpen.value = true
}

const closeMediaModal = () => {
  isMediaModalOpen.value = false
  editingRequest.value = null
  qcFiles.value = []
}

const triggerQcUpload = () => qcFileInput.value?.click()
const handleQcSelect = (e) => processQcFiles(Array.from(e.target.files))

const processQcFiles = (files) => {
  files.forEach(file => {
    if (qcFiles.value.length >= 5) return;
    const reader = new FileReader()
    reader.onload = (e) => {
      qcFiles.value.push({ file, preview: e.target.result, type: file.type })
    }
    reader.readAsDataURL(file)
  })
}

const removeQcFile = (index) => qcFiles.value.splice(index, 1)

const saveChanges = async () => {
  saving.value = true
  try {
    const formData = new FormData()
    formData.append('status', selectedStatus.value)
    
    if (selectedSupplier.value) formData.append('assigned_supplier_id', selectedSupplier.value)
    if (adminPrice.value) {
      formData.append('quoted_price', adminPrice.value)
      formData.append('currency', adminCurrency.value)
    }
    if (internalNotes.value) formData.append('notes', internalNotes.value)
    
    if (['processing', 'production', 'inspected'].includes(selectedStatus.value)) {
      formData.append('production_progress', productionProgress.value)
    }

    await adminService.updateRequest(editingRequest.value.id, formData)
    closeStatusModal()
    await loadData()
  } catch (error) {
    showToast(error.response?.data?.message || 'Failed to update')
  } finally {
    saving.value = false
  }
}

const saveMedia = async () => {
  uploadingMedia.value = true
  try {
    const formData = new FormData()
    qcFiles.value.forEach(f => formData.append('qc_images', f.file));
    
    await adminService.uploadMedia(editingRequest.value.id, formData)
    closeMediaModal()
    await loadData()
  } catch (error) {
    showToast(error.response?.data?.message || 'Failed to upload media')
  } finally {
    uploadingMedia.value = false
  }
}
</script>
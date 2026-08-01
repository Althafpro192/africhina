<template>
  <AdminLayout>
    <main class="w-full max-w-[1600px] mx-auto space-y-8">
      <!-- Header -->
      <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 class="text-3xl sm:text-4xl font-black bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent tracking-tight">
            {{ $t('admin_drivers.title') }}
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {{ $t('admin_drivers.subtitle') }}
          </p>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full sm:w-auto">
          <div class="relative w-full sm:w-72">
            <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input
              v-model="searchQuery"
              class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none text-xs sm:text-sm shadow-sm transition-all"
              :placeholder="$t('admin_drivers.search_placeholder')"
              type="text"
            />
          </div>

          <button
            @click="openCreateModal"
            class="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all cursor-pointer"
          >
            <span class="material-symbols-outlined text-lg">local_shipping</span>
            <span>{{ $t('admin_drivers.add_driver') }}</span>
          </button>
        </div>
      </header>

      <!-- DRIVER TABLE SECTION -->
      <section class="bg-white/80 dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-indigo-500/5 overflow-hidden transition-colors duration-300">
        <div class="p-6 border-b border-slate-200/80 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <h4 class="text-base font-extrabold text-slate-900 dark:text-white">{{ $t('admin_drivers.all_drivers') }}</h4>
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400">{{ filteredDrivers.length }} {{ $t('admin_drivers.count_suffix') }}</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="text-slate-400 dark:text-slate-500 uppercase text-[10px] font-bold tracking-widest bg-slate-50/80 dark:bg-slate-950/40 border-b border-slate-200/60 dark:border-slate-800">
                <th class="px-6 py-4">{{ $t('admin_drivers.name') }}</th>
                <th class="px-6 py-4">{{ $t('admin_drivers.contact') }}</th>
                <th class="px-6 py-4">{{ $t('admin_drivers.status') }}</th>
                <th class="px-6 py-4">{{ $t('admin_drivers.assigned_requests') }}</th>
                <th class="px-6 py-4 text-right">{{ $t('admin_drivers.actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200/60 dark:divide-slate-800" v-if="!loading">
              <tr
                v-for="driver in filteredDrivers"
                :key="driver.id"
                :class="['group transition-colors', driver.is_blocked ? 'bg-rose-50/40 dark:bg-rose-950/10 hover:bg-rose-50/70 dark:hover:bg-rose-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50']"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 overflow-hidden bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800">
                      <img v-if="driver.photo_url" :src="driver.photo_url" :alt="driver.full_name || driver.name" class="w-full h-full object-cover" />
                      <span v-else class="material-symbols-outlined text-xl text-indigo-600 dark:text-indigo-400">{{ driver.is_blocked ? 'block' : 'local_shipping' }}</span>
                    </div>
                    <div>
                      <p class="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        {{ driver.full_name || driver.name }}
                        <span v-if="driver.is_blocked" class="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 uppercase">{{ $t('admin_drivers.blocked') }}</span>
                      </p>
                      <p class="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">{{ driver.email }}</p>
                    </div>
                  </div>
                </td>

                <td class="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">
                  <div class="font-semibold text-slate-900 dark:text-slate-200">{{ driver.phone || '—' }}</div>
                  <div class="text-slate-400">{{ driver.email }}</div>
                </td>

                <td class="px-6 py-4">
                  <span v-if="driver.is_blocked" class="bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center w-fit gap-1">
                    <span class="material-symbols-outlined text-xs">block</span> {{ $t('admin_drivers.blocked') }}
                  </span>
                  <span v-else class="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center w-fit gap-1">
                    <span class="material-symbols-outlined text-xs">verified</span> {{ $t('admin_drivers.active') }}
                  </span>
                </td>

                <td class="px-6 py-4 font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  <div class="flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm text-indigo-500">inventory_2</span>
                    <span>{{ driver.assigned_requests_count ?? 0 }}</span>
                  </div>
                </td>

                <td class="px-6 py-4 text-right">
                  <div class="flex justify-end items-center gap-1.5">
                    <button @click="openViewModal(driver)" class="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      {{ $t('admin_drivers.view') }}
                    </button>
                    <button @click="openEditModal(driver)" class="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline px-2 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors">
                      {{ $t('admin_drivers.edit') }}
                    </button>
                    <button
                      @click="generateTempPassword(driver)"
                      class="text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                      :title="$t('admin_drivers.temp_password_tooltip')"
                    >
                      {{ $t('admin_drivers.temp_password') }}
                    </button>
                    <button
                      @click="toggleBlockDriverItem(driver)"
                      :class="['text-xs font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer', driver.is_blocked ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40' : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40']"
                    >
                      {{ driver.is_blocked ? $t('admin_drivers.unblock') : $t('admin_drivers.block') }}
                    </button>
                    <button
                      @click="deleteDriverItem(driver)"
                      class="text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      {{ $t('admin_drivers.delete') }}
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="filteredDrivers.length === 0">
                <td colspan="5" class="px-6 py-12 text-center text-slate-400 dark:text-slate-500 text-xs font-medium">
                  {{ $t('admin_drivers.no_drivers') }}
                </td>
              </tr>
            </tbody>

            <tbody v-else>
              <tr>
                <td colspan="5" class="px-6 py-16 text-center">
                  <span class="material-symbols-outlined animate-spin text-indigo-600 dark:text-indigo-400 text-3xl">progress_activity</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- DRIVER FORM MODAL -->
      <div :class="['fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300', isModalOpen ? 'visible' : 'invisible']">
        <div class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" @click="closeModal"></div>

        <div :class="['bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl relative border border-slate-200 dark:border-slate-800 transition-all duration-300 text-slate-900 dark:text-white', isModalOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0']">
          <div class="flex justify-between items-start mb-6">
            <div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ isViewing ? $t('admin_drivers.driver_details') : (isEditing ? $t('admin_drivers.edit_driver') : $t('admin_drivers.add_new_driver')) }}</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">{{ $t('admin_drivers.modal_subtitle') }}</p>
            </div>
            <button @click="closeModal" class="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
              <span class="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          <form @submit.prevent="saveDriver" class="space-y-4 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">{{ $t('admin_drivers.name') }}</label>
                <input v-model="form.name" required :disabled="isViewing" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 disabled:opacity-60" />
              </div>
              <div>
                <label class="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">{{ $t('admin_drivers.phone') }}</label>
                <input v-model="form.phone" :disabled="isViewing" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 disabled:opacity-60" />
              </div>
              <div class="col-span-1 sm:col-span-2">
                <label class="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">{{ $t('admin_drivers.email') }}</label>
                <input v-model="form.email" type="email" required :disabled="isViewing" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 disabled:opacity-60" />
              </div>
              <div v-if="!isEditing" class="col-span-1 sm:col-span-2">
                <label class="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">{{ $t('admin_drivers.password_optional') }}</label>
                <input v-model="form.password" type="text" :disabled="isViewing" :placeholder="$t('admin_drivers.password_placeholder')" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 disabled:opacity-60" />
                <p class="text-[10px] text-slate-400 mt-1">{{ $t('admin_drivers.password_hint') }}</p>
              </div>
            </div>

            <!-- Driver photo uploader (edit only) -->
            <div v-if="isEditing && editingId" class="pt-2 border-t border-slate-200 dark:border-slate-800">
              <label class="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">Driver Photo</label>
              <ImageGallery
                :entity-id="editingId"
                :image-url="form.photo_url || ''"
                :upload-endpoint="(id) => `/admin/drivers/${id}/photo`"
                :delete-endpoint="(id) => `/admin/drivers/${id}/photo`"
                field-name="photo"
                :readonly="isViewing"
                alt="Driver photo"
                placeholder-text="No photo"
                @uploaded="onPhotoUploaded"
                @deleted="onPhotoDeleted"
                @error="onPhotoError"
              />
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <button type="button" @click="closeModal" class="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                {{ isViewing ? $t('common.close') : $t('common.cancel') }}
              </button>
              <button v-if="!isViewing" type="submit" :disabled="saving" class="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg hover:bg-indigo-500 transition-all disabled:opacity-50 flex items-center gap-2">
                <span v-if="saving" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                {{ isEditing ? $t('admin_drivers.save_changes') : $t('admin_drivers.save_driver') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- TEMP PASSWORD DISPLAY MODAL -->
      <div :class="['fixed inset-0 z-[60] flex items-center justify-center p-4 transition-all duration-300', tempPasswordVisible ? 'visible' : 'invisible']">
        <div class="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" @click="closeTempPasswordModal"></div>
        <div :class="['bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl relative border border-slate-200 dark:border-slate-800 transition-all duration-300 text-slate-900 dark:text-white', tempPasswordVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0']">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <span class="material-symbols-outlined text-xl">key</span>
            </div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ $t('admin_drivers.temp_password_title') }}</h3>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mb-4">{{ $t('admin_drivers.temp_password_warning') }}</p>
          <div class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 font-mono text-base font-bold text-indigo-700 dark:text-indigo-300 select-all break-all">
            {{ tempPasswordValue }}
          </div>
          <div class="flex justify-end mt-6">
            <button @click="closeTempPasswordModal" class="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg hover:bg-indigo-500 transition-all">
              {{ $t('common.close') }}
            </button>
          </div>
        </div>
      </div>
    </main>
  </AdminLayout>
</template>

<script setup>
import { useToast } from '../../composables/useToast.js';
const { showToast } = useToast();

import { useConfirm } from '../../composables/useConfirm.js';
const { confirmDelete, confirmBlock, confirmAction } = useConfirm();

import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { adminService } from '../../api/adminService.js'
import AdminLayout from '../../components/layout/AdminLayout.vue'
import ImageGallery from '../../components/ui/ImageGallery.vue'

const onPhotoUploaded = ({ url }) => {
  form.value.photo_url = url
  showToast('Photo uploaded successfully')
}

const onPhotoDeleted = () => {
  form.value.photo_url = ''
  showToast('Photo deleted')
}

const onPhotoError = ({ error }) => {
  showToast(error || 'Photo operation failed')
}

const searchQuery = ref('')
const loading = ref(true)
const drivers = ref([])
const saving = ref(false)

const isModalOpen = ref(false)
const isEditing = ref(false)
const isViewing = ref(false)
const editingId = ref(null)

const form = ref({
  name: '',
  email: '',
  phone: '',
  password: ''
})

const tempPasswordVisible = ref(false)
const tempPasswordValue = ref('')

  const filteredDrivers = computed(() => {
  if (!searchQuery.value) return drivers.value
  const q = searchQuery.value.toLowerCase()
  return drivers.value.filter(d =>
    (d.full_name || d.name)?.toLowerCase().includes(q) ||
    d.email?.toLowerCase().includes(q) ||
    d.phone?.toLowerCase().includes(q)
  )
})

const loadDrivers = async () => {
  loading.value = true
  try {
    const result = await adminService.listDrivers()
    console.log('[Drivers] Raw API result:', result)
    console.log('[Drivers] Result type:', Array.isArray(result) ? 'array' : typeof result)
    // Backend returns { data: [...], total: N } - extract the data array
    drivers.value = Array.isArray(result) ? result : (result?.data?.data || result?.data || result || [])
    console.log('[Drivers] Set drivers.value:', drivers.value)
    console.log('[Drivers] Drivers count:', drivers.value.length)
  } catch (error) {
    console.error('[Drivers] Failed to load drivers:', error)
    console.error('[Drivers] Error response:', error.response?.data)
    showToast(error.response?.data?.message || t('common.error'))
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDrivers()
})

const resetForm = () => {
  form.value = {
    name: '',
    email: '',
    phone: '',
    password: ''
  }
}

const openCreateModal = () => {
  isEditing.value = false
  isViewing.value = false
  editingId.value = null
  resetForm()
  isModalOpen.value = true
}

const openEditModal = (driver) => {
  isEditing.value = true
  isViewing.value = false
  editingId.value = driver.id
  form.value = {
    name: driver.full_name || driver.name,
    email: driver.email,
    phone: driver.phone || '',
    password: ''
  }
  isModalOpen.value = true
}

const openViewModal = (driver) => {
  isEditing.value = false
  isViewing.value = true
  editingId.value = driver.id
  form.value = {
    name: driver.full_name || driver.name,
    email: driver.email,
    phone: driver.phone || '',
    password: ''
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const saveDriver = async () => {
  saving.value = true
  try {
    if (isEditing.value) {
      await adminService.updateDriver(editingId.value, {
        full_name: form.value.name,
        email: form.value.email,
        phone: form.value.phone
      })
    } else {
      const payload = {
        full_name: form.value.name,
        email: form.value.email,
        phone: form.value.phone
      }
      if (form.value.password && form.value.password.trim() !== '') {
        payload.password = form.value.password
      }
      await adminService.createDriver(payload)
    }
    closeModal()
    await loadDrivers()
    showToast(t('common.success'))
  } catch (error) {
    showToast(error.response?.data?.message || 'Failed to save driver')
  } finally {
    saving.value = false
  }
}

const toggleBlockDriverItem = async (driver) => {
  const driverName = driver.full_name || driver.name
  const confirmed = await confirmBlock(driverName, driver.is_blocked)
  if (!confirmed) return
  try {
    const res = await adminService.toggleBlockDriver(driver.id)
    showToast(res.message || t('common.success'))
    await loadDrivers()
  } catch (error) {
    showToast(error.response?.data?.message || t('common.error'))
  }
}

const deleteDriverItem = async (driver) => {
  const driverName = driver.full_name || driver.name
  const confirmed = await confirmDelete(driverName)
  if (!confirmed) return
  try {
    const res = await adminService.deleteDriver(driver.id)
    showToast(res.message || t('common.success'))
    await loadDrivers()
  } catch (error) {
    showToast(error.response?.data?.message || t('common.error'))
  }
}

const generateTempPassword = async (driver) => {
  const driverName = driver.full_name || driver.name
  const confirmed = await confirmAction(
    t('admin_drivers.temp_password_title'),
    t('admin_drivers.temp_password_confirm', { name: driverName }),
    'warning'
  )
  if (!confirmed) return
  try {
    const res = await adminService.generateDriverTempPassword(driver.id)
    if (res && res.temp_password) {
      tempPasswordValue.value = res.temp_password
      tempPasswordVisible.value = true
    } else if (res && res.password) {
      tempPasswordValue.value = res.password
      tempPasswordVisible.value = true
    } else {
      showToast(res?.message || t('admin_drivers.temp_password_success'))
    }
  } catch (error) {
    showToast(error.response?.data?.message || t('common.error'))
  }
}

const closeTempPasswordModal = () => {
  tempPasswordVisible.value = false
  tempPasswordValue.value = ''
}
</script>
<template>
  <BuyerLayout activeRoute="sourcing">
    <div class="w-full max-w-4xl mx-auto py-4 sm:py-8">
      
      <!-- Header Section -->
      <div class="flex items-center gap-4 mb-8">
        <button @click="goBack" class="w-10 h-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl flex items-center justify-center border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-x-1 transition-all text-gray-600 dark:text-slate-300 cursor-pointer">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{{ $t('request_details.title') }}</h1>
          <p class="text-gray-500 dark:text-slate-400 mt-1 text-sm">Fill out the details below to receive quotes from verified suppliers.</p>
        </div>
      </div>

      <!-- Main Content -->
      <form @submit.prevent="submitRequest" class="space-y-6">
        
        <!-- Product Details Section -->
        <div class="bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border border-gray-200/80 dark:border-slate-800 shadow-sm rounded-3xl p-6 sm:p-8">
          <div class="flex items-center gap-4 mb-8 border-b border-gray-100 dark:border-slate-800 pb-4">
            <div class="w-12 h-12 bg-gradient-to-br from-[#4f378a]/10 to-[#4f378a]/5 dark:from-indigo-500/20 dark:to-purple-500/20 rounded-xl flex items-center justify-center border border-[#4f378a]/10 dark:border-indigo-500/30">
              <span class="material-symbols-outlined text-[#4f378a] dark:text-indigo-400">inventory_2</span>
            </div>
            <h2 class="text-lg font-bold text-gray-800 dark:text-white">{{ $t('request_details.product_details') }}</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="md:col-span-2">
              <label class="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                {{ $t('request_details.product_name') }}
              </label>
              <input
                v-model="form.productName"
                type="text"
                placeholder="e.g. Solar Panel 450W Monocrystalline"
                class="w-full px-5 py-4 bg-gray-50/50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-[#4f378a]/10 dark:focus:ring-indigo-500/20 focus:border-[#4f378a] dark:focus:border-indigo-500 outline-none transition-all text-gray-800 dark:text-white font-medium placeholder-gray-400 dark:placeholder-slate-500"
                required
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                {{ $t('request_details.category') }}
              </label>
              <div class="relative">
                <select
                  v-model="form.category"
                  class="w-full px-5 py-4 bg-gray-50/50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-[#4f378a]/10 dark:focus:ring-indigo-500/20 focus:border-[#4f378a] dark:focus:border-indigo-500 outline-none transition-all appearance-none text-gray-800 dark:text-white font-medium cursor-pointer"
                  required
                >
                  <option value="" disabled selected class="dark:bg-slate-900">Select category</option>
                  <option value="electronics" class="dark:bg-slate-900">Electronics & Electrical</option>
                  <option value="machinery" class="dark:bg-slate-900">Machinery & Equipment</option>
                  <option value="textiles" class="dark:bg-slate-900">Textiles & Apparel</option>
                  <option value="building" class="dark:bg-slate-900">Building Materials</option>
                  <option value="automotive" class="dark:bg-slate-900">Automotive</option>
                  <option value="chemicals" class="dark:bg-slate-900">Chemicals & Pharma</option>
                </select>
                <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none">unfold_more</span>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Sub-category
              </label>
              <input
                v-model="form.subCategory"
                type="text"
                placeholder="e.g. Solar Panels"
                class="w-full px-5 py-4 bg-gray-50/50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-[#4f378a]/10 dark:focus:ring-indigo-500/20 focus:border-[#4f378a] dark:focus:border-indigo-500 outline-none transition-all text-gray-800 dark:text-white font-medium placeholder-gray-400 dark:placeholder-slate-500"
                required
              />
            </div>
          </div>
        </div>

        <!-- Specifications Section -->
        <div class="bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border border-gray-200/80 dark:border-slate-800 shadow-sm rounded-3xl p-6 sm:p-8">
          <div class="flex items-center gap-4 mb-8 border-b border-gray-100 dark:border-slate-800 pb-4">
            <div class="w-12 h-12 bg-gradient-to-br from-[#4f378a]/10 to-[#4f378a]/5 dark:from-indigo-500/20 dark:to-purple-500/20 rounded-xl flex items-center justify-center border border-[#4f378a]/10 dark:border-indigo-500/30">
              <span class="material-symbols-outlined text-[#4f378a] dark:text-indigo-400">description</span>
            </div>
            <h2 class="text-lg font-bold text-gray-800 dark:text-white">{{ $t('request_details.specifications') }}</h2>
          </div>

          <div class="space-y-6">
            <div>
              <label class="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                {{ $t('request_details.detailed_reqs') }}
              </label>
              <textarea
                v-model="form.specifications"
                rows="4"
                placeholder="Describe technical specs, materials, and sizes."
                class="w-full px-5 py-4 bg-gray-50/50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-[#4f378a]/10 dark:focus:ring-indigo-500/20 focus:border-[#4f378a] dark:focus:border-indigo-500 outline-none transition-all resize-none text-gray-800 dark:text-white font-medium placeholder-gray-400 dark:placeholder-slate-500"
                required
              ></textarea>
            </div>
            
            <div>
              <label class="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Quality Requirements
              </label>
              <textarea
                v-model="form.qualityRequirements"
                rows="2"
                placeholder="e.g. Must pass SGS inspection, zero defect tolerance."
                class="w-full px-5 py-4 bg-gray-50/50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-[#4f378a]/10 dark:focus:ring-indigo-500/20 focus:border-[#4f378a] dark:focus:border-indigo-500 outline-none transition-all resize-none text-gray-800 dark:text-white font-medium placeholder-gray-400 dark:placeholder-slate-500"
              ></textarea>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Required Certifications
              </label>
              <input
                v-model="form.certifications"
                type="text"
                placeholder="e.g. ISO 9001, CE, RoHS"
                class="w-full px-5 py-4 bg-gray-50/50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-[#4f378a]/10 dark:focus:ring-indigo-500/20 focus:border-[#4f378a] dark:focus:border-indigo-500 outline-none transition-all text-gray-800 dark:text-white font-medium placeholder-gray-400 dark:placeholder-slate-500"
              />
            </div>
          </div>
        </div>

        <!-- Quantity & Budget Section -->
        <div class="bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border border-gray-200/80 dark:border-slate-800 shadow-sm rounded-3xl p-6 sm:p-8">
          <div class="flex items-center gap-4 mb-8 border-b border-gray-100 dark:border-slate-800 pb-4">
            <div class="w-12 h-12 bg-gradient-to-br from-[#4f378a]/10 to-[#4f378a]/5 dark:from-indigo-500/20 dark:to-purple-500/20 rounded-xl flex items-center justify-center border border-[#4f378a]/10 dark:border-indigo-500/30">
              <span class="material-symbols-outlined text-[#4f378a] dark:text-indigo-400">payments</span>
            </div>
            <h2 class="text-lg font-bold text-gray-800 dark:text-white">Quantity, Budget & Logistics</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div class="md:col-span-2">
              <label class="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                {{ $t('request_details.quantity') }}
              </label>
              <div class="flex gap-2">
                <input
                  v-model="form.quantity"
                  type="number"
                  placeholder="e.g. 500"
                  class="flex-[2] px-5 py-4 bg-gray-50/50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-[#4f378a]/10 dark:focus:ring-indigo-500/20 focus:border-[#4f378a] dark:focus:border-indigo-500 outline-none transition-all text-gray-800 dark:text-white font-medium placeholder-gray-400 dark:placeholder-slate-500"
                  required
                />
                <div class="relative flex-1">
                  <select
                    v-model="form.unit"
                    class="w-full h-full px-5 py-4 bg-gray-50/50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-[#4f378a]/10 dark:focus:ring-indigo-500/20 focus:border-[#4f378a] dark:focus:border-indigo-500 outline-none transition-all appearance-none text-gray-800 dark:text-white font-medium cursor-pointer"
                    required
                  >
                    <option value="pcs" class="dark:bg-slate-900">Pieces</option>
                    <option value="kg" class="dark:bg-slate-900">Kg</option>
                    <option value="ton" class="dark:bg-slate-900">Tons</option>
                    <option value="m" class="dark:bg-slate-900">Meters</option>
                  </select>
                  <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none">unfold_more</span>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Currency
              </label>
              <div class="relative">
                <select
                  v-model="form.currency"
                  class="w-full px-5 py-4 bg-gray-50/50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-[#4f378a]/10 dark:focus:ring-indigo-500/20 focus:border-[#4f378a] dark:focus:border-indigo-500 outline-none transition-all appearance-none text-gray-800 dark:text-white font-medium cursor-pointer"
                  required
                >
                  <option value="USD" class="dark:bg-slate-900">USD ($)</option>
                  <option value="EUR" class="dark:bg-slate-900">EUR (€)</option>
                  <option value="CNY" class="dark:bg-slate-900">CNY (¥)</option>
                </select>
                <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none">unfold_more</span>
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label class="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Target Budget Range
              </label>
              <div class="relative">
                <select
                  v-model="form.budgetRange"
                  class="w-full px-5 py-4 bg-gray-50/50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-[#4f378a]/10 dark:focus:ring-indigo-500/20 focus:border-[#4f378a] dark:focus:border-indigo-500 outline-none transition-all appearance-none text-gray-800 dark:text-white font-medium cursor-pointer"
                  required
                >
                  <option value="" disabled selected class="dark:bg-slate-900">Select budget range</option>
                  <option value="1k-5k" class="dark:bg-slate-900">1,000 - 5,000</option>
                  <option value="5k-20k" class="dark:bg-slate-900">5,000 - 20,000</option>
                  <option value="20k-100k" class="dark:bg-slate-900">20,000 - 100,000</option>
                  <option value="100k+" class="dark:bg-slate-900">More than 100,000</option>
                </select>
                <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none">unfold_more</span>
              </div>
            </div>
            
            <div>
              <label class="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Target Delivery Date
              </label>
              <input
                v-model="form.deliveryTimeline"
                type="date"
                class="w-full px-5 py-4 bg-gray-50/50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-[#4f378a]/10 dark:focus:ring-indigo-500/20 focus:border-[#4f378a] dark:focus:border-indigo-500 outline-none transition-all text-gray-800 dark:text-white font-medium"
                required
              />
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Shipping Terms
              </label>
              <div class="relative">
                <select
                  v-model="form.shippingTerms"
                  class="w-full px-5 py-4 bg-gray-50/50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-[#4f378a]/10 dark:focus:ring-indigo-500/20 focus:border-[#4f378a] dark:focus:border-indigo-500 outline-none transition-all appearance-none text-gray-800 dark:text-white font-medium cursor-pointer"
                  required
                >
                  <option value="" disabled selected class="dark:bg-slate-900">Select terms</option>
                  <option value="FOB" class="dark:bg-slate-900">FOB (Free on Board)</option>
                  <option value="CIF" class="dark:bg-slate-900">CIF (Cost, Insurance, Freight)</option>
                  <option value="EXW" class="dark:bg-slate-900">EXW (Ex Works)</option>
                  <option value="DDP" class="dark:bg-slate-900">DDP (Delivered Duty Paid)</option>
                </select>
                <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none">unfold_more</span>
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Payment Terms
              </label>
              <div class="relative">
                <select
                  v-model="form.paymentTerms"
                  class="w-full px-5 py-4 bg-gray-50/50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-[#4f378a]/10 dark:focus:ring-indigo-500/20 focus:border-[#4f378a] dark:focus:border-indigo-500 outline-none transition-all appearance-none text-gray-800 dark:text-white font-medium cursor-pointer"
                  required
                >
                  <option value="" disabled selected class="dark:bg-slate-900">Select payment</option>
                  <option value="TT" class="dark:bg-slate-900">T/T (Telegraphic Transfer)</option>
                  <option value="LC" class="dark:bg-slate-900">L/C (Letter of Credit)</option>
                  <option value="DP" class="dark:bg-slate-900">D/P (Documents against Payment)</option>
                </select>
                <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none">unfold_more</span>
              </div>
            </div>
          </div>
          
        </div>

        <!-- References Section -->
        <div class="bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border border-gray-200/80 dark:border-slate-800 shadow-sm rounded-3xl p-6 sm:p-8">
          <div class="flex items-center gap-4 mb-8 border-b border-gray-100 dark:border-slate-800 pb-4">
            <div class="w-12 h-12 bg-gradient-to-br from-[#4f378a]/10 to-[#4f378a]/5 dark:from-indigo-500/20 dark:to-purple-500/20 rounded-xl flex items-center justify-center border border-[#4f378a]/10 dark:border-indigo-500/30">
              <span class="material-symbols-outlined text-[#4f378a] dark:text-indigo-400">cloud_upload</span>
            </div>
            <h2 class="text-lg font-bold text-gray-800 dark:text-white">{{ $t('request_details.references') }}</h2>
          </div>

          <div
            @click="triggerFileUpload"
            @dragover.prevent
            @dragenter.prevent
            @drop.prevent="handleDrop"
            class="border-2 border-dashed border-[#4f378a]/30 dark:border-indigo-500/30 bg-[#4f378a]/5 dark:bg-indigo-950/20 rounded-2xl p-10 text-center cursor-pointer hover:border-[#4f378a]/60 dark:hover:border-indigo-500/60 hover:bg-[#4f378a]/10 dark:hover:bg-indigo-950/40 transition-all group"
          >
            <input
              ref="fileInput"
              type="file"
              multiple
              accept=".svg,.png,.jpg,.jpeg,.pdf"
              @change="handleFileSelect"
              class="hidden"
            />
            <div class="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
              <span class="material-symbols-outlined text-3xl text-[#4f378a] dark:text-indigo-400">upload_file</span>
            </div>
            <p class="text-base text-gray-700 dark:text-slate-200 font-bold mb-1">
              {{ $t('request_details.upload_desc') }}
            </p>
            <p class="text-sm text-gray-500 dark:text-slate-400">{{ $t('request_details.upload_hint') }} (Max 3 files, 10MB each)</p>
          </div>

          <!-- Uploaded Files Preview -->
          <div v-if="uploadedFiles.length > 0" class="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div v-for="(file, index) in uploadedFiles" :key="index" class="relative group rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-slate-700">
              <img
                v-if="file.type.startsWith('image/')"
                :src="file.preview"
                :alt="file.name"
                class="w-full h-32 object-cover"
              />
              <div v-else class="w-full h-32 bg-gray-50 dark:bg-slate-800 flex flex-col items-center justify-center">
                <span class="material-symbols-outlined text-gray-400 dark:text-slate-500 text-3xl mb-2">description</span>
                <span class="text-[10px] text-gray-500 dark:text-slate-400 font-medium px-2 text-center line-clamp-1">{{ file.name }}</span>
              </div>
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  @click.prevent="removeFile(index)"
                  class="w-8 h-8 bg-white/20 hover:bg-red-500 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
                >
                  <span class="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Trust Guarantee -->
        <div class="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 p-6 flex items-start gap-4">
          <div class="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/60 rounded-full flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-emerald-600 dark:text-emerald-400">verified_user</span>
          </div>
          <div>
            <h3 class="font-bold text-emerald-800 dark:text-emerald-300 mb-1">{{ $t('request_details.trust_guarantee') }}</h3>
            <p class="text-sm text-emerald-700/80 dark:text-emerald-400/80 leading-relaxed">
              {{ $t('request_details.trust_desc') }}
            </p>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="errorMsg" class="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2 font-medium">
          <span class="material-symbols-outlined text-red-500">error</span>
          {{ errorMsg }}
        </div>

        <!-- Submit Button -->
        <div class="pt-4 pb-12">
          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full bg-[#4f378a] text-white font-bold text-lg py-5 px-6 rounded-2xl hover:opacity-90 transform hover:-translate-y-1 transition-all shadow-xl shadow-[#4f378a]/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            <span v-if="isSubmitting" class="material-symbols-outlined animate-spin">progress_activity</span>
            <span v-else>{{ $t('request_details.submit') }}</span>
            <span v-if="!isSubmitting" class="material-symbols-outlined">send</span>
          </button>
          <p class="text-xs text-gray-500 text-center mt-4 font-medium">
            {{ $t('request_details.terms') }}
          </p>
        </div>
        
      </form>
    </div>
  </BuyerLayout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import LanguageSwitcher from '../../components/LanguageSwitcher.vue'
import BuyerLayout from '../../components/layout/BuyerLayout.vue'
import { requestService } from '../../api/requestService.js'

const router = useRouter()

// Form state
const form = ref({
  productName: '',
  category: '',
  subCategory: '',
  specifications: '',
  qualityRequirements: '',
  certifications: '',
  quantity: '',
  unit: 'pcs',
  currency: 'USD',
  budgetRange: '',
  deliveryTimeline: '',
  shippingTerms: '',
  paymentTerms: ''
})

const uploadedFiles = ref([])
const fileInput = ref(null)

// Methods
const goBack = () => {
  router.push('/buyer/dashboard')
}

const triggerFileUpload = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  processFiles(files)
}

const handleDrop = (event) => {
  const files = Array.from(event.dataTransfer.files)
  processFiles(files)
}

const processFiles = (files) => {
  errorMsg.value = ''
  files.forEach(file => {
    if (file.size > 5 * 1024 * 1024) {
      errorMsg.value = `File ${file.name} exceeds the 5MB limit.`
      return
    }
    
    // limit to 3 files max
    if (uploadedFiles.value.length >= 3) {
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      uploadedFiles.value.push({
        file: file,
        name: file.name,
        type: file.type,
        preview: e.target.result
      })
    }
    reader.readAsDataURL(file)
  })
}

const removeFile = (index) => {
  uploadedFiles.value.splice(index, 1)
}

const isSubmitting = ref(false)
const errorMsg = ref('')

const submitRequest = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  errorMsg.value = '';

  try {
    const formData = new FormData();
    formData.append('product_name', form.value.productName);
    formData.append('category', form.value.category);
    formData.append('sub_category', form.value.subCategory);
    formData.append('specifications', form.value.specifications);
    formData.append('quality_requirements', form.value.qualityRequirements);
    formData.append('certifications', form.value.certifications);
    formData.append('quantity', form.value.quantity);
    formData.append('unit', form.value.unit);
    formData.append('currency', form.value.currency);
    formData.append('budget_range', form.value.budgetRange);
    formData.append('delivery_timeline', form.value.deliveryTimeline);
    formData.append('shipping_terms', form.value.shippingTerms);
    formData.append('payment_terms', form.value.paymentTerms);

    // Append up to 3 images as requested by backend route
    uploadedFiles.value.slice(0, 3).forEach(f => {
      formData.append('images', f.file);
    });

    await requestService.createRequest(formData);
    
    // Navigate back to my requests on success
    router.push('/buyer/requests');
  } catch (error) {
    console.error('Failed to create request:', error);
    errorMsg.value = error.response?.data?.message || 'Failed to submit request. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
}
</script>
<template>
  <BuyerLayout activeRoute="sourcing">
    <div class="w-full max-w-4xl mx-auto py-4 sm:py-8">
      
      <!-- Header Section -->
      <div class="flex items-center gap-4 mb-8">
        <button @click="goBack" class="w-10 h-10 bg-white/80 backdrop-blur-md rounded-xl flex items-center justify-center border border-gray-200 shadow-sm hover:shadow-md hover:-translate-x-1 transition-all">
          <span class="material-symbols-outlined text-gray-600">arrow_back</span>
        </button>
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">{{ $t('request_details.title') }}</h1>
          <p class="text-gray-500 mt-1 text-sm">Fill out the details below to receive quotes from verified suppliers.</p>
        </div>
      </div>

      <!-- Main Content -->
      <form @submit.prevent="submitRequest" class="space-y-6">
        
        <!-- Product Details Section -->
        <div class="bg-white/80 backdrop-blur-xl border border-white/80 shadow-sm rounded-3xl p-6 sm:p-8">
          <div class="flex items-center gap-4 mb-8 border-b border-gray-100 pb-4">
            <div class="w-12 h-12 bg-gradient-to-br from-[#4f378a]/10 to-[#4f378a]/5 rounded-xl flex items-center justify-center border border-[#4f378a]/10">
              <span class="material-symbols-outlined text-[#4f378a]">inventory_2</span>
            </div>
            <h2 class="text-lg font-bold text-gray-800">{{ $t('request_details.product_details') }}</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="md:col-span-2">
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                {{ $t('request_details.product_name') }}
              </label>
              <input
                v-model="form.productName"
                type="text"
                placeholder="e.g. Solar Panel 450W Monocrystalline"
                class="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#4f378a]/10 focus:border-[#4f378a] outline-none transition-all text-gray-800 font-medium placeholder-gray-400"
                required
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                {{ $t('request_details.category') }}
              </label>
              <div class="relative">
                <select
                  v-model="form.category"
                  class="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#4f378a]/10 focus:border-[#4f378a] outline-none transition-all appearance-none text-gray-800 font-medium cursor-pointer"
                  required
                >
                  <option value="" disabled selected>Select category</option>
                  <option value="electronics">Electronics & Electrical</option>
                  <option value="machinery">Machinery & Equipment</option>
                  <option value="textiles">Textiles & Apparel</option>
                  <option value="building">Building Materials</option>
                  <option value="automotive">Automotive</option>
                  <option value="chemicals">Chemicals & Pharma</option>
                </select>
                <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">unfold_more</span>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Sub-category
              </label>
              <input
                v-model="form.subCategory"
                type="text"
                placeholder="e.g. Solar Panels"
                class="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#4f378a]/10 focus:border-[#4f378a] outline-none transition-all text-gray-800 font-medium placeholder-gray-400"
                required
              />
            </div>
          </div>
        </div>

        <!-- Specifications Section -->
        <div class="bg-white/80 backdrop-blur-xl border border-white/80 shadow-sm rounded-3xl p-6 sm:p-8">
          <div class="flex items-center gap-4 mb-8 border-b border-gray-100 pb-4">
            <div class="w-12 h-12 bg-gradient-to-br from-[#4f378a]/10 to-[#4f378a]/5 rounded-xl flex items-center justify-center border border-[#4f378a]/10">
              <span class="material-symbols-outlined text-[#4f378a]">description</span>
            </div>
            <h2 class="text-lg font-bold text-gray-800">{{ $t('request_details.specifications') }}</h2>
          </div>

          <div class="space-y-6">
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                {{ $t('request_details.detailed_reqs') }}
              </label>
              <textarea
                v-model="form.specifications"
                rows="4"
                placeholder="Describe technical specs, materials, and sizes."
                class="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#4f378a]/10 focus:border-[#4f378a] outline-none transition-all resize-none text-gray-800 font-medium placeholder-gray-400"
                required
              ></textarea>
            </div>
            
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Quality Requirements
              </label>
              <textarea
                v-model="form.qualityRequirements"
                rows="2"
                placeholder="e.g. Must pass SGS inspection, zero defect tolerance."
                class="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#4f378a]/10 focus:border-[#4f378a] outline-none transition-all resize-none text-gray-800 font-medium placeholder-gray-400"
              ></textarea>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Required Certifications
              </label>
              <input
                v-model="form.certifications"
                type="text"
                placeholder="e.g. ISO 9001, CE, RoHS"
                class="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#4f378a]/10 focus:border-[#4f378a] outline-none transition-all text-gray-800 font-medium placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        <!-- Quantity & Budget Section -->
        <div class="bg-white/80 backdrop-blur-xl border border-white/80 shadow-sm rounded-3xl p-6 sm:p-8">
          <div class="flex items-center gap-4 mb-8 border-b border-gray-100 pb-4">
            <div class="w-12 h-12 bg-gradient-to-br from-[#4f378a]/10 to-[#4f378a]/5 rounded-xl flex items-center justify-center border border-[#4f378a]/10">
              <span class="material-symbols-outlined text-[#4f378a]">payments</span>
            </div>
            <h2 class="text-lg font-bold text-gray-800">Quantity, Budget & Logistics</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div class="md:col-span-2">
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                {{ $t('request_details.quantity') }}
              </label>
              <div class="flex gap-2">
                <input
                  v-model="form.quantity"
                  type="number"
                  placeholder="e.g. 500"
                  class="flex-[2] px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#4f378a]/10 focus:border-[#4f378a] outline-none transition-all text-gray-800 font-medium placeholder-gray-400"
                  required
                />
                <div class="relative flex-1">
                  <select
                    v-model="form.unit"
                    class="w-full h-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#4f378a]/10 focus:border-[#4f378a] outline-none transition-all appearance-none text-gray-800 font-medium cursor-pointer"
                    required
                  >
                    <option value="pcs">Pieces</option>
                    <option value="kg">Kg</option>
                    <option value="ton">Tons</option>
                    <option value="m">Meters</option>
                  </select>
                  <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">unfold_more</span>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Currency
              </label>
              <div class="relative">
                <select
                  v-model="form.currency"
                  class="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#4f378a]/10 focus:border-[#4f378a] outline-none transition-all appearance-none text-gray-800 font-medium cursor-pointer"
                  required
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="CNY">CNY (¥)</option>
                </select>
                <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">unfold_more</span>
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Target Budget Range
              </label>
              <div class="relative">
                <select
                  v-model="form.budgetRange"
                  class="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#4f378a]/10 focus:border-[#4f378a] outline-none transition-all appearance-none text-gray-800 font-medium cursor-pointer"
                  required
                >
                  <option value="" disabled selected>Select budget range</option>
                  <option value="1k-5k">1,000 - 5,000</option>
                  <option value="5k-20k">5,000 - 20,000</option>
                  <option value="20k-100k">20,000 - 100,000</option>
                  <option value="100k+">More than 100,000</option>
                </select>
                <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">unfold_more</span>
              </div>
            </div>
            
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Target Delivery Date
              </label>
              <input
                v-model="form.deliveryTimeline"
                type="date"
                class="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#4f378a]/10 focus:border-[#4f378a] outline-none transition-all text-gray-800 font-medium"
                required
              />
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Shipping Terms
              </label>
              <div class="relative">
                <select
                  v-model="form.shippingTerms"
                  class="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#4f378a]/10 focus:border-[#4f378a] outline-none transition-all appearance-none text-gray-800 font-medium cursor-pointer"
                  required
                >
                  <option value="" disabled selected>Select terms</option>
                  <option value="FOB">FOB (Free on Board)</option>
                  <option value="CIF">CIF (Cost, Insurance, Freight)</option>
                  <option value="EXW">EXW (Ex Works)</option>
                  <option value="DDP">DDP (Delivered Duty Paid)</option>
                </select>
                <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">unfold_more</span>
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Payment Terms
              </label>
              <div class="relative">
                <select
                  v-model="form.paymentTerms"
                  class="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#4f378a]/10 focus:border-[#4f378a] outline-none transition-all appearance-none text-gray-800 font-medium cursor-pointer"
                  required
                >
                  <option value="" disabled selected>Select payment</option>
                  <option value="TT">T/T (Telegraphic Transfer)</option>
                  <option value="LC">L/C (Letter of Credit)</option>
                  <option value="DP">D/P (Documents against Payment)</option>
                </select>
                <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">unfold_more</span>
              </div>
            </div>
          </div>
          
        </div>

        <!-- References Section -->
        <div class="bg-white/80 backdrop-blur-xl border border-white/80 shadow-sm rounded-3xl p-6 sm:p-8">
          <div class="flex items-center gap-4 mb-8 border-b border-gray-100 pb-4">
            <div class="w-12 h-12 bg-gradient-to-br from-[#4f378a]/10 to-[#4f378a]/5 rounded-xl flex items-center justify-center border border-[#4f378a]/10">
              <span class="material-symbols-outlined text-[#4f378a]">cloud_upload</span>
            </div>
            <h2 class="text-lg font-bold text-gray-800">{{ $t('request_details.references') }}</h2>
          </div>

          <div
            @click="triggerFileUpload"
            @dragover.prevent
            @dragenter.prevent
            @drop.prevent="handleDrop"
            class="border-2 border-dashed border-[#4f378a]/30 bg-[#4f378a]/5 rounded-2xl p-10 text-center cursor-pointer hover:border-[#4f378a]/60 hover:bg-[#4f378a]/10 transition-all group"
          >
            <input
              ref="fileInput"
              type="file"
              multiple
              accept=".svg,.png,.jpg,.jpeg,.pdf"
              @change="handleFileSelect"
              class="hidden"
            />
            <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
              <span class="material-symbols-outlined text-3xl text-[#4f378a]">upload_file</span>
            </div>
            <p class="text-base text-gray-700 font-bold mb-1">
              {{ $t('request_details.upload_desc') }}
            </p>
            <p class="text-sm text-gray-500">{{ $t('request_details.upload_hint') }} (Max 3 files, 10MB each)</p>
          </div>

          <!-- Uploaded Files Preview -->
          <div v-if="uploadedFiles.length > 0" class="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div v-for="(file, index) in uploadedFiles" :key="index" class="relative group rounded-xl overflow-hidden shadow-sm border border-gray-200">
              <img
                v-if="file.type.startsWith('image/')"
                :src="file.preview"
                :alt="file.name"
                class="w-full h-32 object-cover"
              />
              <div v-else class="w-full h-32 bg-gray-50 flex flex-col items-center justify-center">
                <span class="material-symbols-outlined text-gray-400 text-3xl mb-2">description</span>
                <span class="text-[10px] text-gray-500 font-medium px-2 text-center line-clamp-1">{{ file.name }}</span>
              </div>
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  @click.prevent="removeFile(index)"
                  class="w-8 h-8 bg-white/20 hover:bg-red-500 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <span class="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Trust Guarantee -->
        <div class="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-6 flex items-start gap-4">
          <div class="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-emerald-600">verified_user</span>
          </div>
          <div>
            <h3 class="font-bold text-emerald-800 mb-1">{{ $t('request_details.trust_guarantee') }}</h3>
            <p class="text-sm text-emerald-700/80 leading-relaxed">
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
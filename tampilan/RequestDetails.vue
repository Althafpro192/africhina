<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-5xl mx-auto px-6 py-4">
        <div class="flex items-center gap-4">
          <button @click="goBack" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <span class="material-icons text-gray-600">arrow_back</span>
          </button>
          <h1 class="text-2xl font-bold text-purple-700">New Sourcing Request</h1>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-3xl mx-auto px-6 py-8">
      <form @submit.prevent="submitRequest" class="space-y-6">
        <!-- Product Details Section -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <span class="material-icons text-white text-sm">inventory_2</span>
            </div>
            <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Product Details</h2>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Product Name
              </label>
              <input
                v-model="productName"
                type="text"
                placeholder="e.g. Solar Panel 450W Monocrystalline"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <div class="relative">
                <select
                  v-model="category"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
                  required
                >
                  <option value="">Select category</option>
                  <option value="renewable-energy">Renewable Energy</option>
                  <option value="industrial-machinery">Industrial Machinery</option>
                  <option value="electronics-it">Electronics & IT</option>
                  <option value="textiles-apparel">Textiles & Apparel</option>
                  <option value="construction-materials">Construction Materials</option>
                </select>
                <span class="material-icons absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Specifications Section -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <span class="material-icons text-white text-sm">description</span>
            </div>
            <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Specifications</h2>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Detailed Requirements
            </label>
            <textarea
              v-model="specifications"
              rows="5"
              placeholder="Describe technical specs, materials, and certifications.&#10;Example: Efficiency &gt;20%, CE certified, 10-year warranty, palletized shipping."
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
              required
            ></textarea>
          </div>
        </div>

        <!-- Quantity & Budget Section -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <span class="material-icons text-white text-sm">payments</span>
            </div>
            <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Quantity & Budget</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Quantity (Units)
              </label>
              <input
                v-model="quantity"
                type="number"
                placeholder="500"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Expected Budget (USD)
              </label>
              <div class="relative">
                <select
                  v-model="budgetRange"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
                  required
                >
                  <option value="">Select range</option>
                  <option value="1k-5k">$1k - $5k</option>
                  <option value="5k-20k">$5k - $20k</option>
                  <option value="20k-100k">$20k - $100k</option>
                  <option value="100k+">$100k+</option>
                </select>
                <span class="material-icons absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
              </div>
            </div>
          </div>
        </div>

        <!-- References Section -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <span class="material-icons text-white text-sm">cloud_upload</span>
            </div>
            <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">References</h2>
          </div>

          <div
            @click="triggerFileUpload"
            @dragover.prevent
            @dragenter.prevent
            @drop.prevent="handleDrop"
            class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all"
          >
            <input
              ref="fileInput"
              type="file"
              multiple
              accept=".svg,.png,.jpg,.jpeg,.pdf"
              @change="handleFileSelect"
              class="hidden"
            />
            <span class="material-icons text-4xl text-gray-400 mb-2">upload_file</span>
            <p class="text-sm text-gray-600 mb-1">
              <span class="font-medium text-purple-600">Drop images or click to upload</span>
            </p>
            <p class="text-xs text-gray-500">SVG, PNG, JPG or PDF (max. 10MB)</p>
          </div>

          <!-- Uploaded Files Preview -->
          <div v-if="uploadedFiles.length > 0" class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div v-for="(file, index) in uploadedFiles" :key="index" class="relative group">
              <img
                v-if="file.type.startsWith('image/')"
                :src="file.preview"
                :alt="file.name"
                class="w-full h-32 object-cover rounded-lg"
              />
              <div v-else class="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                <span class="material-icons text-gray-400">description</span>
              </div>
              <button
                @click.prevent="removeFile(index)"
                class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span class="material-icons text-xs">close</span>
              </button>
              <p class="text-xs text-gray-600 mt-1 truncate">{{ file.name }}</p>
            </div>
          </div>
        </div>

        <!-- Trust Guarantee -->
        <div class="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6">
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0">
              <span class="material-icons text-purple-600">verified_user</span>
            </div>
            <div>
              <h3 class="font-semibold text-gray-800 mb-1">Trust Guarantee</h3>
              <p class="text-sm text-gray-600">
                All suppliers on AfriChina Bridge are verified for business licenses and quality standards. 
                Your RFQ will be matched with the top 5 eligible factories within 48 hours.
              </p>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="pt-4">
          <button
            type="submit"
            class="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-4 px-6 rounded-xl hover:from-purple-700 hover:to-purple-800 transform hover:scale-[1.02] transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
          >
            Submit Request
            <span class="material-icons text-sm">send</span>
          </button>
          <p class="text-xs text-gray-500 text-center mt-3">
            By submitting, you agree to our Sourcing Terms of Service.
          </p>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Form state
const productName = ref('')
const category = ref('')
const specifications = ref('')
const quantity = ref('')
const budgetRange = ref('')
const uploadedFiles = ref([])
const fileInput = ref(null)

// Methods
const goBack = () => {
  console.log('Navigate back')
  router.back()
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
  files.forEach(file => {
    if (file.size > 10 * 1024 * 1024) {
      console.warn(`File ${file.name} exceeds 10MB limit`)
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
  console.log('File removed')
}

const submitRequest = () => {
  const requestData = {
    productName: productName.value,
    category: category.value,
    specifications: specifications.value,
    quantity: quantity.value,
    budgetRange: budgetRange.value,
    files: uploadedFiles.value.map(f => f.name)
  }
  
  console.log('Submitting sourcing request:', requestData)
  // Add your submit logic here
  
  // Show success message
  alert('Request submitted successfully!')
  
  // Navigate back or to success page
  router.push('/requests')
}
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
<template>
  <div class="min-h-screen bg-[#f8fafc] dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 antialiased font-['Inter',_sans-serif] relative">
    
    <!-- Mobile Back Button (only shown on small screens) -->
    <div class="lg:hidden flex items-center gap-4 p-4 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40">
      <button @click="goBack" class="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-gray-600 dark:text-slate-300 cursor-pointer">
        <span class="material-symbols-outlined">arrow_back</span>
      </button>
      <span class="text-lg font-bold text-[#4f378a] dark:text-indigo-400">{{ $t('order_detail.title') }}</span>
    </div>

    <!-- Edit Request Modal -->
    <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">
        <div class="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-800 shrink-0">
          <h2 class="text-xl font-bold text-gray-800 dark:text-white">
            {{ $t('request_details.edit_title') }}
          </h2>
          <button @click="showEditModal = false" class="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 cursor-pointer">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto flex-1">
          <!-- Product Details Form -->
          <div v-if="activeEditSection === 'product_details'" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">Product Name *</label>
              <input v-model="editForm.product_name" type="text" class="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white">
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">Category *</label>
                <select v-model="editForm.category" class="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white">
                  <option value="electronics" class="dark:bg-slate-900">Electronics</option>
                  <option value="machinery" class="dark:bg-slate-900">Machinery</option>
                  <option value="apparel" class="dark:bg-slate-900">Apparel</option>
                  <option value="home_garden" class="dark:bg-slate-900">Home & Garden</option>
                  <option value="auto_parts" class="dark:bg-slate-900">Auto Parts</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">Sub-category</label>
                <input v-model="editForm.sub_category" type="text" class="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white">
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">Description & Specifications *</label>
              <textarea v-model="editForm.specifications" rows="4" class="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"></textarea>
            </div>
          </div>

          <!-- Quality Form -->
          <div v-if="activeEditSection === 'quality'" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">Quality Requirements *</label>
              <textarea v-model="editForm.quality_requirements" rows="3" class="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"></textarea>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">Required Certifications</label>
              <input v-model="editForm.certifications" type="text" class="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white" placeholder="e.g. ISO 9001, CE, RoHS">
            </div>
          </div>

          <!-- Logistics Form -->
          <div v-if="activeEditSection === 'logistics'" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">Quantity *</label>
                <input v-model="editForm.quantity" type="number" class="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white">
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">Unit</label>
                <input v-model="editForm.unit" type="text" class="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white" placeholder="e.g. Pieces, kg">
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">Budget Range *</label>
                <input v-model="editForm.budget_range" type="text" class="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white">
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">Target Delivery</label>
                <input v-model="editForm.target_delivery" type="date" class="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white">
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">Shipping Terms *</label>
                <select v-model="editForm.shipping_terms" class="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white">
                  <option value="FOB" class="dark:bg-slate-900">FOB</option>
                  <option value="CIF" class="dark:bg-slate-900">CIF</option>
                  <option value="EXW" class="dark:bg-slate-900">EXW</option>
                  <option value="DDP" class="dark:bg-slate-900">DDP</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">Payment Terms *</label>
                <select v-model="editForm.payment_terms" class="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white">
                  <option value="TT" class="dark:bg-slate-900">T/T</option>
                  <option value="LC" class="dark:bg-slate-900">L/C</option>
                  <option value="PayPal" class="dark:bg-slate-900">PayPal</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Attachments Form -->
          <div v-if="activeEditSection === 'attachments'" class="space-y-4">
            <div class="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl p-8 text-center hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer" @click="$refs.editPhotoInput.click()">
              <span class="material-symbols-outlined text-4xl text-[#4f378a] dark:text-indigo-400 mb-2">cloud_upload</span>
              <p class="font-bold text-gray-700 dark:text-slate-200 mb-1">Upload New Attachments</p>
              <p class="text-xs text-gray-500 dark:text-slate-400">Note: Uploading new files will replace existing ones.</p>
              <input type="file" ref="editPhotoInput" @change="handleEditPhotoUpload" class="hidden" multiple accept="image/*,.pdf" />
            </div>
            <div v-if="editFiles.length > 0" class="mt-4">
              <h4 class="text-sm font-bold text-gray-700 dark:text-slate-200 mb-2">New Files to Upload ({{ editFiles.length }})</h4>
              <div class="flex flex-col gap-2">
                <div v-for="(file, idx) in editFiles" :key="idx" class="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-100 dark:border-blue-800/60">
                  <span class="text-xs font-semibold text-blue-800 dark:text-blue-300">{{ file.name }}</span>
                  <button @click="editFiles.splice(idx, 1)" class="text-red-500 hover:text-red-700"><span class="material-symbols-outlined text-[16px]">close</span></button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="p-6 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3 bg-gray-50 dark:bg-slate-900/60 shrink-0">
          <button @click="showEditModal = false" class="px-5 py-2.5 text-gray-600 dark:text-slate-400 font-semibold hover:bg-gray-200 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer">Cancel</button>
          <button @click="submitEdit" :disabled="savingEdit" class="px-6 py-2.5 bg-[#4f378a] hover:bg-[#3d2a6b] dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer">
            <span v-if="savingEdit" class="material-symbols-outlined animate-spin">progress_activity</span>
            {{ savingEdit ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="w-full pb-24 p-4 sm:p-6 lg:p-8">
      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <span class="material-symbols-outlined animate-spin text-[#4f378a] dark:text-indigo-400 mb-4" style="font-size: 48px;">progress_activity</span>
      </div>
      <div v-else-if="!request" class="text-center py-20">
        <h2 class="text-xl font-bold text-gray-600 dark:text-slate-400">Request not found</h2>
      </div>
      <div v-else class="w-full max-w-5xl mx-auto">
        
        <!-- Request Header Card -->
        <div class="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-sm">
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('order_detail.order_no') }}</span>
                <span class="text-sm font-bold text-[#4f378a] dark:text-indigo-400">{{ request.id.split('-')[0].toUpperCase() }}</span>
              </div>
              <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2">{{ request.product_name }}</h1>
            </div>
            <span :class="['font-semibold text-xs px-3 py-1 rounded-full text-white self-start shadow-xs flex items-center gap-1', getStatusClass(request.status)]">
              <span class="material-symbols-outlined text-[12px]">{{ getStatusIcon(request.status) }}</span>
               {{ $t(`status.${request.status.toLowerCase()}`) }}
             </span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100 dark:border-slate-800">
            <div>
              <p class="text-xs text-gray-500 dark:text-slate-400 mb-1">{{ $t('admin.category') }}</p>
              <p class="font-semibold text-sm text-gray-800 dark:text-slate-200">{{ request.category }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 dark:text-slate-400 mb-1">{{ $t('admin.request_date') }}</p>
              <p class="font-semibold text-sm text-gray-800 dark:text-slate-200">{{ formatDate(request.created_at) }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 dark:text-slate-400 mb-1">{{ $t('request_details.quantity') }}</p>
              <p class="font-semibold text-sm text-gray-800 dark:text-slate-200">{{ request.quantity }}</p>
            </div>
          </div>
        </div>

        <!-- Tracking Timeline Header -->
        <div class="mb-6">
          <div class="relative w-full flex justify-between items-center px-2">
            <div class="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 dark:bg-slate-800 -z-10 rounded-full transform -translate-y-1/2"></div>
            <div class="absolute top-1/2 left-0 h-1 bg-[#4f378a] dark:bg-indigo-500 -z-10 rounded-full transform -translate-y-1/2 transition-all duration-1000" :style="{ width: progressWidth }"></div>
            
            <div v-for="stage in timelineStages" :key="stage.value" class="flex flex-col items-center gap-2 bg-[#f8fafc] dark:bg-[#0b0f19] px-1 relative">
              <div :class="[
                'w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500',
                stage.passed ? 'bg-[#4f378a] dark:bg-indigo-600 text-white shadow-lg shadow-[#4f378a]/30 dark:shadow-indigo-500/30 scale-110' : 
                stage.current ? 'bg-white dark:bg-slate-900 border-2 border-[#4f378a] dark:border-indigo-400 text-[#4f378a] dark:text-indigo-400 scale-110' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500'
              ]">
                <span class="material-symbols-outlined text-[18px]">{{ stage.icon }}</span>
              </div>
              <span :class="['text-[11px] font-bold uppercase tracking-wider hidden sm:block', stage.current || stage.passed ? 'text-[#4f378a] dark:text-indigo-400' : 'text-gray-400 dark:text-slate-500']">{{ stage.label }}</span>
            </div>
          </div>
        </div>

        <!-- Two Column Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          
          <!-- Left Column -->
          <div class="lg:col-span-2 space-y-4 sm:space-y-6">
            
            <!-- Bagian 1: Detail Produk -->
            <div class="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-6 mb-6 shadow-sm">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-[#4f378a]/10 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center">
                    <span class="material-symbols-outlined text-[#4f378a] dark:text-indigo-400">inventory_2</span>
                  </div>
                  <h2 class="text-lg font-bold text-gray-800 dark:text-white">{{ $t('request_details.product_details') }}</h2>
                </div>
                <span v-if="canInlineEdit" class="text-[10px] uppercase tracking-wider font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-1 rounded-md" data-role-indicator>
                  <span class="material-symbols-outlined text-[12px] align-middle">edit</span>
                  Inline edit
                </span>
              </div>
              <div class="space-y-3">

                <!-- product_name -->
                <div class="group flex items-start gap-3 py-1" data-field-row="product_name">
                  <div class="flex-1 min-w-0">
                    <span class="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Product Name</span>
                    <div v-if="editingField !== 'product_name'" data-field-display="product_name" class="text-xl font-bold text-gray-900 dark:text-white break-words">
                      {{ request.product_name }}
                    </div>
                    <input v-else
                      data-edit-input="product_name"
                      v-model="inlineEditValue"
                      @keyup.enter="saveInlineField('product_name')"
                      @keyup.escape="cancelInlineEdit()"
                      type="text"
                      maxlength="200"
                      class="w-full text-xl font-bold text-gray-900 dark:text-white bg-white dark:bg-slate-800 border-2 border-indigo-500 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </div>
                  <div class="flex items-center gap-1 shrink-0" :class="editingField === 'product_name' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity'">
                    <template v-if="editingField === 'product_name'">
                      <button @click="saveInlineField('product_name')" :disabled="savingInline" data-action="save-inline" data-field="product_name" class="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors cursor-pointer disabled:opacity-50" title="Save">
                        <span v-if="savingInline" class="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                        <span v-else class="material-symbols-outlined text-[16px]">check</span>
                      </button>
                      <button @click="cancelInlineEdit()" :disabled="savingInline" data-action="cancel-inline" data-field="product_name" class="p-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-md transition-colors cursor-pointer disabled:opacity-50" title="Cancel">
                        <span class="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </template>
                    <button v-else-if="canInlineEdit" @click="startInlineEdit('product_name', request.product_name)" data-action="edit-field" data-field="product_name" class="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-md transition-colors cursor-pointer" title="Edit product name">
                      <span class="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                  </div>
                </div>

                <!-- category + sub_category row -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <!-- category -->
                  <div class="group flex items-start gap-2 py-1" data-field-row="category">
                    <div class="flex-1 min-w-0">
                      <span class="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Category</span>
                      <div v-if="editingField !== 'category'" data-field-display="category">
                        <span class="px-2 py-0.5 bg-gray-100 dark:bg-slate-800 rounded-md text-slate-700 dark:text-slate-300 text-sm">{{ request.category }}</span>
                      </div>
                      <select v-else
                        data-edit-input="category"
                        v-model="inlineEditValue"
                        @keyup.escape="cancelInlineEdit()"
                        class="w-full bg-white dark:bg-slate-800 border-2 border-indigo-500 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30"
                      >
                        <option value="electronics">Electronics</option>
                        <option value="machinery">Machinery</option>
                        <option value="apparel">Apparel</option>
                        <option value="home_garden">Home &amp; Garden</option>
                        <option value="auto_parts">Auto Parts</option>
                      </select>
                    </div>
                    <div class="flex items-center gap-1 shrink-0" :class="editingField === 'category' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity'">
                      <template v-if="editingField === 'category'">
                        <button @click="saveInlineField('category')" :disabled="savingInline" data-action="save-inline" data-field="category" class="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md cursor-pointer disabled:opacity-50"><span class="material-symbols-outlined text-[16px]">check</span></button>
                        <button @click="cancelInlineEdit()" :disabled="savingInline" data-action="cancel-inline" data-field="category" class="p-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-md cursor-pointer disabled:opacity-50"><span class="material-symbols-outlined text-[16px]">close</span></button>
                      </template>
                      <button v-else-if="canInlineEdit" @click="startInlineEdit('category', request.category)" data-action="edit-field" data-field="category" class="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-md cursor-pointer"><span class="material-symbols-outlined text-[18px]">edit</span></button>
                    </div>
                  </div>

                  <!-- sub_category -->
                  <div class="group flex items-start gap-2 py-1" data-field-row="sub_category">
                    <div class="flex-1 min-w-0">
                      <span class="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Sub-category</span>
                      <div v-if="editingField !== 'sub_category'" data-field-display="sub_category">
                        <span class="px-2 py-0.5 bg-gray-100 dark:bg-slate-800 rounded-md text-slate-700 dark:text-slate-300 text-sm">{{ request.sub_category || 'N/A' }}</span>
                      </div>
                      <input v-else
                        data-edit-input="sub_category"
                        v-model="inlineEditValue"
                        @keyup.enter="saveInlineField('sub_category')"
                        @keyup.escape="cancelInlineEdit()"
                        type="text"
                        maxlength="100"
                        class="w-full bg-white dark:bg-slate-800 border-2 border-indigo-500 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30"
                      />
                    </div>
                    <div class="flex items-center gap-1 shrink-0" :class="editingField === 'sub_category' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity'">
                      <template v-if="editingField === 'sub_category'">
                        <button @click="saveInlineField('sub_category')" :disabled="savingInline" data-action="save-inline" data-field="sub_category" class="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md cursor-pointer disabled:opacity-50"><span class="material-symbols-outlined text-[16px]">check</span></button>
                        <button @click="cancelInlineEdit()" :disabled="savingInline" data-action="cancel-inline" data-field="sub_category" class="p-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-md cursor-pointer disabled:opacity-50"><span class="material-symbols-outlined text-[16px]">close</span></button>
                      </template>
                      <button v-else-if="canInlineEdit" @click="startInlineEdit('sub_category', request.sub_category || '')" data-action="edit-field" data-field="sub_category" class="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-md cursor-pointer"><span class="material-symbols-outlined text-[18px]">edit</span></button>
                    </div>
                  </div>
                </div>

                <!-- description / specifications -->
                <div class="group flex items-start gap-2 py-2 pt-3 border-t border-gray-100 dark:border-slate-800" data-field-row="description">
                  <div class="flex-1 min-w-0">
                    <span class="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Description &amp; Specifications</span>
                    <div v-if="editingField !== 'description'" data-field-display="description">
                      <p v-if="request.description" class="text-sm text-gray-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{{ request.description }}</p>
                      <p v-else class="text-sm italic text-gray-400 dark:text-slate-500">No description provided</p>
                    </div>
                    <textarea v-else
                      data-edit-input="description"
                      v-model="inlineEditValue"
                      @keyup.escape="cancelInlineEdit()"
                      rows="4"
                      class="w-full bg-white dark:bg-slate-800 border-2 border-indigo-500 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none"
                    ></textarea>
                  </div>
                  <div class="flex flex-col items-center gap-1 shrink-0" :class="editingField === 'description' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity'">
                    <template v-if="editingField === 'description'">
                      <button @click="saveInlineField('description')" :disabled="savingInline" data-action="save-inline" data-field="description" class="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md cursor-pointer disabled:opacity-50"><span class="material-symbols-outlined text-[16px]">check</span></button>
                      <button @click="cancelInlineEdit()" :disabled="savingInline" data-action="cancel-inline" data-field="description" class="p-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-md cursor-pointer disabled:opacity-50"><span class="material-symbols-outlined text-[16px]">close</span></button>
                    </template>
                    <button v-else-if="canInlineEdit" @click="startInlineEdit('description', request.description || '')" data-action="edit-field" data-field="description" class="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-md cursor-pointer"><span class="material-symbols-outlined text-[18px]">edit</span></button>
                  </div>
                </div>

              </div>
            </div>

            <!-- Bagian 2: Kualitas & Sertifikasi -->
            <div class="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-6 mb-6 shadow-sm">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-[#4f378a]/10 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center">
                    <span class="material-symbols-outlined text-[#4f378a] dark:text-indigo-400">verified</span>
                  </div>
                  <h2 class="text-lg font-bold text-gray-800 dark:text-white">{{ $t('order_detail.quality_cert') }}</h2>
                </div>
              </div>
              <div class="space-y-3">

                <!-- quality_requirements -->
                <div class="group flex items-start gap-2" data-field-row="quality_requirements">
                  <div class="flex-1 min-w-0">
                    <span class="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Quality Requirements</span>
                    <div v-if="editingField !== 'quality_requirements'" data-field-display="quality_requirements" class="flex gap-2 items-start bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                      <span class="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[18px] mt-0.5">task_alt</span>
                      <p class="text-sm text-gray-700 dark:text-emerald-200 whitespace-pre-line">{{ request.quality_requirements || $t('order_detail.no_special_reqs') }}</p>
                    </div>
                    <textarea v-else
                      data-edit-input="quality_requirements"
                      v-model="inlineEditValue"
                      @keyup.escape="cancelInlineEdit()"
                      rows="3"
                      class="w-full bg-white dark:bg-slate-800 border-2 border-indigo-500 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none"
                    ></textarea>
                  </div>
                  <div class="flex flex-col items-center gap-1 shrink-0" :class="editingField === 'quality_requirements' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity'">
                    <template v-if="editingField === 'quality_requirements'">
                      <button @click="saveInlineField('quality_requirements')" :disabled="savingInline" data-action="save-inline" data-field="quality_requirements" class="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md cursor-pointer disabled:opacity-50"><span class="material-symbols-outlined text-[16px]">check</span></button>
                      <button @click="cancelInlineEdit()" :disabled="savingInline" data-action="cancel-inline" data-field="quality_requirements" class="p-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-md cursor-pointer disabled:opacity-50"><span class="material-symbols-outlined text-[16px]">close</span></button>
                    </template>
                    <button v-else-if="canInlineEdit" @click="startInlineEdit('quality_requirements', request.quality_requirements || '')" data-action="edit-field" data-field="quality_requirements" class="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-md cursor-pointer"><span class="material-symbols-outlined text-[18px]">edit</span></button>
                  </div>
                </div>

                <!-- certifications -->
                <div class="group flex items-start gap-2" data-field-row="certifications">
                  <div class="flex-1 min-w-0">
                    <span class="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Required Certifications</span>
                    <div v-if="editingField !== 'certifications'" data-field-display="certifications">
                      <div v-if="request.certifications" class="flex flex-wrap gap-2">
                        <span v-for="cert in request.certifications.split(',')" :key="cert" class="px-3 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full border border-blue-200 dark:border-blue-800">{{ cert.trim() }}</span>
                      </div>
                      <p v-else class="text-sm text-gray-500 dark:text-slate-500 italic">{{ $t('order_detail.none') }}</p>
                    </div>
                    <input v-else
                      data-edit-input="certifications"
                      v-model="inlineEditValue"
                      @keyup.enter="saveInlineField('certifications')"
                      @keyup.escape="cancelInlineEdit()"
                      type="text"
                      class="w-full bg-white dark:bg-slate-800 border-2 border-indigo-500 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30"
                      placeholder="e.g. ISO 9001, CE, RoHS"
                    />
                  </div>
                  <div class="flex items-center gap-1 shrink-0" :class="editingField === 'certifications' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity'">
                    <template v-if="editingField === 'certifications'">
                      <button @click="saveInlineField('certifications')" :disabled="savingInline" data-action="save-inline" data-field="certifications" class="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md cursor-pointer disabled:opacity-50"><span class="material-symbols-outlined text-[16px]">check</span></button>
                      <button @click="cancelInlineEdit()" :disabled="savingInline" data-action="cancel-inline" data-field="certifications" class="p-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-md cursor-pointer disabled:opacity-50"><span class="material-symbols-outlined text-[16px]">close</span></button>
                    </template>
                    <button v-else-if="canInlineEdit" @click="startInlineEdit('certifications', request.certifications || '')" data-action="edit-field" data-field="certifications" class="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-md cursor-pointer"><span class="material-symbols-outlined text-[18px]">edit</span></button>
                  </div>
                </div>

              </div>
            </div>

            <!-- Bagian 3: Budget & Logistik -->
            <div class="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-6 mb-6 shadow-sm">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-[#4f378a]/10 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center">
                    <span class="material-symbols-outlined text-[#4f378a] dark:text-indigo-400">local_shipping</span>
                  </div>
                  <h2 class="text-lg font-bold text-gray-800 dark:text-white">{{ $t('order_detail.budget_logistics') }}</h2>
                </div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">

                <!-- quantity + unit (combined row) -->
                <div class="group flex items-start gap-2 py-1 sm:border-0 border-b border-gray-100 dark:border-slate-800" data-field-row="quantity">
                  <div class="flex-1 min-w-0">
                    <span class="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Quantity</span>
                    <div v-if="editingField !== 'quantity'" data-field-display="quantity" class="text-sm font-semibold text-gray-800 dark:text-slate-200">{{ request.quantity }} {{ request.unit || 'units' }}</div>
                    <div v-else class="flex gap-1">
                      <input data-edit-input="quantity" v-model.number="inlineEditValue" @keyup.enter="saveInlineField('quantity')" @keyup.escape="cancelInlineEdit()" type="number" min="1" class="flex-1 min-w-0 bg-white dark:bg-slate-800 border-2 border-indigo-500 rounded-lg px-2 py-1.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30" />
                      <input data-edit-input="unit" v-model="inlineUnitValue" @keyup.enter="saveInlineField('quantity')" @keyup.escape="cancelInlineEdit()" type="text" maxlength="50" placeholder="unit" class="w-20 bg-white dark:bg-slate-800 border-2 border-indigo-500 rounded-lg px-2 py-1.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30" />
                    </div>
                  </div>
                  <div class="flex items-center gap-1 shrink-0" :class="editingField === 'quantity' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity'">
                    <template v-if="editingField === 'quantity'">
                      <button @click="saveInlineField('quantity')" :disabled="savingInline" data-action="save-inline" data-field="quantity" class="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md cursor-pointer disabled:opacity-50"><span class="material-symbols-outlined text-[16px]">check</span></button>
                      <button @click="cancelInlineEdit()" :disabled="savingInline" data-action="cancel-inline" data-field="quantity" class="p-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-md cursor-pointer disabled:opacity-50"><span class="material-symbols-outlined text-[16px]">close</span></button>
                    </template>
                    <button v-else-if="canInlineEdit" @click="startInlineEdit('quantity', request.quantity)" data-action="edit-field" data-field="quantity" class="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-md cursor-pointer"><span class="material-symbols-outlined text-[18px]">edit</span></button>
                  </div>
                </div>

                <!-- target_delivery -->
                <div class="group flex items-start gap-2 py-1 sm:border-0 border-b border-gray-100 dark:border-slate-800" data-field-row="target_delivery">
                  <div class="flex-1 min-w-0">
                    <span class="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Target Delivery</span>
                    <div v-if="editingField !== 'target_delivery'" data-field-display="target_delivery" class="text-sm font-semibold text-gray-800 dark:text-slate-200">{{ request.delivery_timeline ? formatDate(request.delivery_timeline).split(',')[0] : '-' }}</div>
                    <input v-else data-edit-input="target_delivery" v-model="inlineEditValue" @keyup.enter="saveInlineField('target_delivery')" @keyup.escape="cancelInlineEdit()" type="date" :min="todayIso" class="w-full bg-white dark:bg-slate-800 border-2 border-indigo-500 rounded-lg px-2 py-1.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30" />
                  </div>
                  <div class="flex items-center gap-1 shrink-0" :class="editingField === 'target_delivery' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity'">
                    <template v-if="editingField === 'target_delivery'">
                      <button @click="saveInlineField('target_delivery')" :disabled="savingInline" data-action="save-inline" data-field="target_delivery" class="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md cursor-pointer disabled:opacity-50"><span class="material-symbols-outlined text-[16px]">check</span></button>
                      <button @click="cancelInlineEdit()" :disabled="savingInline" data-action="cancel-inline" data-field="target_delivery" class="p-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-md cursor-pointer disabled:opacity-50"><span class="material-symbols-outlined text-[16px]">close</span></button>
                    </template>
                    <button v-else-if="canInlineEdit" @click="startInlineEdit('target_delivery', inlineDateInputValue)" data-action="edit-field" data-field="target_delivery" class="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-md cursor-pointer"><span class="material-symbols-outlined text-[18px]">edit</span></button>
                  </div>
                </div>

                <!-- budget_range -->
                <div class="group flex items-start gap-2 py-1 sm:border-0 border-b border-gray-100 dark:border-slate-800" data-field-row="budget_range">
                  <div class="flex-1 min-w-0">
                    <span class="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Budget Range</span>
                    <div v-if="editingField !== 'budget_range'" data-field-display="budget_range" class="text-sm font-bold text-[#4f378a] dark:text-indigo-400">{{ request.currency || 'USD' }} {{ request.budget_range }}</div>
                    <input v-else data-edit-input="budget_range" v-model="inlineEditValue" @keyup.enter="saveInlineField('budget_range')" @keyup.escape="cancelInlineEdit()" type="text" maxlength="50" class="w-full bg-white dark:bg-slate-800 border-2 border-indigo-500 rounded-lg px-2 py-1.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30" placeholder="e.g. 1000-5000" />
                  </div>
                  <div class="flex items-center gap-1 shrink-0" :class="editingField === 'budget_range' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity'">
                    <template v-if="editingField === 'budget_range'">
                      <button @click="saveInlineField('budget_range')" :disabled="savingInline" data-action="save-inline" data-field="budget_range" class="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md cursor-pointer disabled:opacity-50"><span class="material-symbols-outlined text-[16px]">check</span></button>
                      <button @click="cancelInlineEdit()" :disabled="savingInline" data-action="cancel-inline" data-field="budget_range" class="p-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-md cursor-pointer disabled:opacity-50"><span class="material-symbols-outlined text-[16px]">close</span></button>
                    </template>
                    <button v-else-if="canInlineEdit" @click="startInlineEdit('budget_range', request.budget_range || '')" data-action="edit-field" data-field="budget_range" class="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-md cursor-pointer"><span class="material-symbols-outlined text-[18px]">edit</span></button>
                  </div>
                </div>

                <!-- shipping_terms -->
                <div class="group flex items-start gap-2 py-1 sm:border-0 border-b border-gray-100 dark:border-slate-800" data-field-row="shipping_terms">
                  <div class="flex-1 min-w-0">
                    <span class="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Shipping Terms</span>
                    <div v-if="editingField !== 'shipping_terms'" data-field-display="shipping_terms" class="text-sm font-semibold text-gray-800 dark:text-slate-200">{{ request.shipping_terms || '-' }}</div>
                    <select v-else data-edit-input="shipping_terms" v-model="inlineEditValue" @keyup.escape="cancelInlineEdit()" class="w-full bg-white dark:bg-slate-800 border-2 border-indigo-500 rounded-lg px-2 py-1.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30">
                      <option value="FOB">FOB</option>
                      <option value="CIF">CIF</option>
                      <option value="EXW">EXW</option>
                      <option value="DDP">DDP</option>
                    </select>
                  </div>
                  <div class="flex items-center gap-1 shrink-0" :class="editingField === 'shipping_terms' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity'">
                    <template v-if="editingField === 'shipping_terms'">
                      <button @click="saveInlineField('shipping_terms')" :disabled="savingInline" data-action="save-inline" data-field="shipping_terms" class="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md cursor-pointer disabled:opacity-50"><span class="material-symbols-outlined text-[16px]">check</span></button>
                      <button @click="cancelInlineEdit()" :disabled="savingInline" data-action="cancel-inline" data-field="shipping_terms" class="p-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-md cursor-pointer disabled:opacity-50"><span class="material-symbols-outlined text-[16px]">close</span></button>
                    </template>
                    <button v-else-if="canInlineEdit" @click="startInlineEdit('shipping_terms', request.shipping_terms || 'FOB')" data-action="edit-field" data-field="shipping_terms" class="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-md cursor-pointer"><span class="material-symbols-outlined text-[18px]">edit</span></button>
                  </div>
                </div>

                <!-- payment_terms (full width) -->
                <div class="group flex items-start gap-2 py-1 sm:col-span-2" data-field-row="payment_terms">
                  <div class="flex-1 min-w-0">
                    <span class="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Payment Terms</span>
                    <div v-if="editingField !== 'payment_terms'" data-field-display="payment_terms" class="text-sm font-semibold text-gray-800 dark:text-slate-200">{{ request.payment_terms || '-' }}</div>
                    <select v-else data-edit-input="payment_terms" v-model="inlineEditValue" @keyup.escape="cancelInlineEdit()" class="w-full bg-white dark:bg-slate-800 border-2 border-indigo-500 rounded-lg px-2 py-1.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30">
                      <option value="TT">T/T</option>
                      <option value="LC">L/C</option>
                      <option value="PayPal">PayPal</option>
                    </select>
                  </div>
                  <div class="flex items-center gap-1 shrink-0" :class="editingField === 'payment_terms' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity'">
                    <template v-if="editingField === 'payment_terms'">
                      <button @click="saveInlineField('payment_terms')" :disabled="savingInline" data-action="save-inline" data-field="payment_terms" class="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md cursor-pointer disabled:opacity-50"><span class="material-symbols-outlined text-[16px]">check</span></button>
                      <button @click="cancelInlineEdit()" :disabled="savingInline" data-action="cancel-inline" data-field="payment_terms" class="p-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-md cursor-pointer disabled:opacity-50"><span class="material-symbols-outlined text-[16px]">close</span></button>
                    </template>
                    <button v-else-if="canInlineEdit" @click="startInlineEdit('payment_terms', request.payment_terms || 'TT')" data-action="edit-field" data-field="payment_terms" class="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-md cursor-pointer"><span class="material-symbols-outlined text-[18px]">edit</span></button>
                  </div>
                </div>

              </div>
            </div>

            <!-- Bagian 4: Lampiran -->
            <div class="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-6 mb-6 shadow-sm">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-[#4f378a]/10 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center">
                    <span class="material-symbols-outlined text-[#4f378a] dark:text-indigo-400">attach_file</span>
                  </div>
                  <h2 class="text-lg font-bold text-gray-800 dark:text-white">
                    {{ request.image_urls && request.image_urls.length === 1 
                       ? $t('order_detail.attachments_count', { count: request.image_urls.length })
                       : $t('order_detail.attachments_count_plural', { count: request.image_urls ? request.image_urls.length : 0 }) }}
                  </h2>
                </div>
                <button v-if="request.status === 'menunggu_penawaran_admin'" @click="openEditModal('attachments')" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 p-1 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 rounded-md transition-colors cursor-pointer" title="Edit Lampiran">
                  <span class="material-symbols-outlined text-[20px]">edit</span>
                </button>
              </div>
              <div v-if="request.image_urls && request.image_urls.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                <div v-for="(file, idx) in request.image_urls" :key="idx"
                     @click="openAttachmentLightbox(idx)"
                     :class="[
                       'block rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 hover:border-[#4f378a] dark:hover:border-indigo-500 transition-all cursor-zoom-in',
                       isImageFile(file) ? 'aspect-square relative group' : 'p-3'
                     ]">
                  <!-- Image Preview -->
                  <template v-if="isImageFile(file)">
                    <img :src="getImageUrl(file)" :alt="file.split('/').pop()" class="w-full h-full object-cover" />
                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center pointer-events-none">
                      <span class="material-symbols-outlined text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity drop-shadow">zoom_in</span>
                    </div>
                  </template>
                  <!-- Non-Image File -->
                  <div v-else class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-gray-500 dark:text-slate-400">
                      <span class="material-symbols-outlined">description</span>
                    </div>
                    <div class="flex-1 overflow-hidden">
                      <p class="text-sm font-semibold text-gray-700 dark:text-slate-200 truncate">{{ file.split('/').pop() }}</p>
                      <p class="text-xs text-gray-500 dark:text-slate-400">{{ $t('order_detail.click_view') }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Image Lightbox (full-screen, blurred backdrop, close button) -->
              <ImageLightbox
                v-if="lightboxOpen"
                v-model="lightboxOpen"
                :images="lightboxImages"
                :start-index="lightboxStartIndex"
              />
              <div v-else class="text-center py-6 text-gray-500 dark:text-slate-500 text-sm italic">
                {{ $t('order_detail.no_attachments') }}
              </div>
            </div>

            <!-- Product Options (Golden Path) -->
            <div v-if="request.options && request.options.length > 0" class="bg-indigo-50/40 dark:bg-slate-900/90 border border-indigo-100 dark:border-slate-800 rounded-2xl p-4 sm:p-6 mb-6 shadow-sm">
              <div class="mb-4">
                <h2 class="text-lg font-bold text-slate-900 dark:text-white">{{ $t('order_detail.select_product_options', { id: request.id.split('-')[0].toUpperCase() }) }}</h2>
                <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">{{ $t('request_details.admin_prepared_options', { count: request.options.length }) }}</p>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-for="opt in request.options" :key="opt.id" 
                     @click="request.status === 'menunggu_pemilihan_buyer' ? toggleOption(opt.id) : null"
                     :class="[
                       'border rounded-2xl overflow-hidden flex flex-col relative transition-all duration-300',
                       (request.status === 'menunggu_pemilihan_buyer' ? 'cursor-pointer hover:border-indigo-500/50' : ''),
                       (selectedOptionIds.includes(opt.id) || opt.is_selected) 
                         ? 'ring-4 ring-indigo-600 dark:ring-indigo-500 shadow-xl border-transparent bg-white dark:bg-slate-800' 
                         : 'bg-white dark:bg-slate-800/90 border-slate-200/80 dark:border-slate-700/80'
                     ]">
                     
                  <!-- Selected Badge -->
                  <div v-if="selectedOptionIds.includes(opt.id) || opt.is_selected" class="absolute top-2 right-2 z-10 px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-md">
                    <span class="material-symbols-outlined text-[14px]">check_circle</span> {{ $t('request_details.selected') }}
                  </div>

                  <!-- Image rendering -->
                  <div v-if="getOptionImages(opt).length > 0" class="w-full h-48 bg-slate-100 dark:bg-slate-800 shrink-0 border-b border-slate-200 dark:border-slate-700 relative overflow-hidden">
                    <img :src="getOptionImages(opt)[0]" class="w-full h-full object-cover absolute inset-0" alt="Product Option Image" />
                    <div v-if="getOptionImages(opt).length > 1" class="absolute bottom-2 right-2 z-20 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-md backdrop-blur-xs">
                      +{{ getOptionImages(opt).length - 1 }} photos
                    </div>
                  </div>
                  <div v-else class="w-full h-48 bg-slate-100 dark:bg-slate-800/60 shrink-0 border-b border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                    <span class="material-symbols-outlined text-4xl mb-1">inventory_2</span>
                    <span class="text-xs font-medium">No Image Uploaded</span>
                  </div>

                  <div class="p-4 flex-1 flex flex-col">
                    <h3 class="font-bold text-slate-900 dark:text-white text-lg mb-1">{{ opt.product_name }}</h3>
                    <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-3 flex-1 leading-relaxed">{{ opt.description }}</p>
                    
                    <div class="bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 rounded-xl p-3 mb-4">
                      <div class="flex items-center gap-1 text-amber-700 dark:text-amber-300 font-bold text-xs mb-1">
                        <span class="material-symbols-outlined text-[16px]">stars</span> {{ $t('order_detail.admin_recommendation') }}:
                      </div>
                      <p class="text-xs sm:text-sm text-slate-700 dark:text-slate-300">{{ opt.admin_reason }}</p>
                    </div>
                    
                    <div class="space-y-2 text-xs sm:text-sm mb-4">
                      <div class="flex items-center gap-2">
                        <span class="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0"><span class="material-symbols-outlined text-[14px]">payments</span></span>
                        <span class="font-bold text-indigo-600 dark:text-indigo-400">
                          {{ opt.is_fixed_price ? 'USD ' + opt.price_min + ' (Fixed)' : 'USD ' + opt.price_min + ' - ' + opt.price_max + ' (Range)' }}
                        </span>
                      </div>
                      
                      <div v-if="['sea', 'both'].includes(opt.shipping_method)" class="flex items-center gap-2">
                        <span class="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/80 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0"><span class="material-symbols-outlined text-[14px]">directions_boat</span></span>
                        <span class="font-semibold text-slate-800 dark:text-slate-200">{{ $t('order_detail.sea') }}: {{ opt.est_time_sea }}</span>
                      </div>
                      
                      <div v-if="['air', 'both'].includes(opt.shipping_method)" class="flex items-center gap-2">
                        <span class="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-950/80 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0"><span class="material-symbols-outlined text-[14px]">flight</span></span>
                        <span class="font-semibold text-slate-800 dark:text-slate-200">{{ $t('order_detail.air') }}: {{ opt.est_time_air }}</span>
                      </div>

                      <div v-if="opt.target_delivery" class="flex items-center gap-2">
                        <span class="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-950/80 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0"><span class="material-symbols-outlined text-[14px]">calendar_month</span></span>
                        <span class="font-semibold text-slate-800 dark:text-slate-200">{{ $t('order_detail.target') }}: {{ formatDate(opt.target_delivery).split(',')[0] }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Payment Details & Upload Payment Proof -->
            <div v-if="request.status === 'menunggu_pembayaran' && request.deal_finalized_at" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-md space-y-6">
              
              <!-- Rejection Warning Alert -->
              <div v-if="request.payment_rejection_reason" class="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 rounded-2xl text-rose-800 dark:text-rose-200 flex items-start gap-3">
                <span class="material-symbols-outlined text-rose-600 dark:text-rose-400 text-2xl shrink-0 mt-0.5">error</span>
                <div>
                  <h4 class="font-black text-sm text-rose-900 dark:text-rose-100">{{ $t('request_details.payment_rejected') }}</h4>
                  <p class="text-xs sm:text-sm text-rose-700 dark:text-rose-300 mt-1 font-medium">{{ $t('request_details.payment_rejected_reason') }} "{{ request.payment_rejection_reason }}"</p>
                  <p class="text-[11px] font-bold text-rose-600 dark:text-rose-400 mt-1.5">{{ $t('request_details.payment_rejected_reupload') }}</p>
                </div>
              </div>

              <!-- Header -->
              <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div class="flex items-center gap-3">
                  <div class="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <span class="material-symbols-outlined text-2xl">receipt_long</span>
                  </div>
                  <div>
                    <h3 class="font-black text-slate-900 dark:text-white text-base sm:text-lg">{{ $t('request_details.payment_instructions') }}</h3>
                    <p class="text-xs text-slate-500 dark:text-slate-400">{{ $t('request_details.payment_finalized') }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{{ $t('request_details.total_bill') }}</span>
                  <span class="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    USD {{ (request.final_price || request.quoted_price || 0).toLocaleString() }}
                  </span>
                </div>
              </div>

              <!-- Bank & QR Code Details -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Bank Info Box -->
                <div class="bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 space-y-3">
                  <h4 class="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-base">account_balance</span> {{ $t('request_details.direct_transfer') }}
                  </h4>
                  
                  <div class="space-y-2">
                    <div>
                      <span class="text-[11px] text-slate-400 block">{{ $t('request_details.bank_name') }}</span>
                      <span class="text-sm font-bold text-slate-900 dark:text-white">{{ request.bank_name || 'Bank Transfer (Admin)' }}</span>
                    </div>
                    <div>
                      <span class="text-[11px] text-slate-400 block">{{ $t('request_details.account_number') }}</span>
                      <div class="flex items-center gap-2">
                        <span class="text-base font-black tracking-wider text-indigo-600 dark:text-indigo-400 font-mono">{{ request.bank_account_number || '-' }}</span>
                        <button v-if="request.bank_account_number" @click="copyText(request.bank_account_number)" class="p-1 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer" :title="$t('request_details.copy_rekening')">
                          <span class="material-symbols-outlined text-sm">content_copy</span>
                        </button>
                      </div>
                    </div>
                    <div>
                      <span class="text-[11px] text-slate-400 block">{{ $t('request_details.account_name') }}</span>
                      <span class="text-xs font-bold text-slate-800 dark:text-slate-200">{{ request.bank_account_name || 'AfriChina Bridge Escrow' }}</span>
                    </div>
                  </div>
                </div>

                <!-- QR Code Box / Notes -->
                <div class="bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <h4 class="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mb-2">
                      <span class="material-symbols-outlined text-base">qr_code_2</span> {{ $t('request_details.qr_code_notes') }}
                    </h4>
                    <p v-if="request.payment_notes" class="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed mb-3">
                      "{{ request.payment_notes }}"
                    </p>
                  </div>

                  <div v-if="request.payment_qr_url" class="flex items-center gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <img :src="getMediaUrl(request.payment_qr_url)" alt="QR Code" class="w-16 h-16 object-cover rounded-xl border border-slate-300 dark:border-slate-600 shadow-xs cursor-pointer hover:scale-105 transition-transform" @click="openInNewTab(getMediaUrl(request.payment_qr_url))" />
                    <div>
                      <span class="text-xs font-bold text-slate-800 dark:text-white block">{{ $t('request_details.scan_qr_code') }}</span>
                      <span class="text-[11px] text-slate-400">{{ $t('request_details.scan_qr_enlarge') }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- File Upload Action Form -->
              <div class="pt-3 border-t border-slate-100 dark:border-slate-800">
                <h4 class="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">{{ $t('request_details.upload_proof') }}</h4>
                <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  <input type="file" ref="paymentProofInput" accept="image/*,.pdf" class="hidden" @change="handlePaymentProofChange">
                  <button @click="paymentProofInput.click()" class="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer">
                    <span class="material-symbols-outlined text-lg">upload_file</span>
                    <span class="truncate">{{ paymentProofFile ? paymentProofFile.name : $t('request_details.select_proof_file') }}</span>
                  </button>
                  <button @click="submitPaymentProof" :disabled="!paymentProofFile || uploadingProof" class="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90 text-white font-bold text-xs sm:text-sm rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center cursor-pointer shadow-md shadow-amber-500/20">
                    <span v-if="uploadingProof" class="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                    <span v-else class="flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-lg">send</span>
                      {{ $t('request_details.send_proof') }}
                    </span>
                  </button>
                </div>
              </div>

            </div>

            <!-- Negotiation Chat -->
            <div v-if="shouldShowChat">
              <ChatComponent :requestId="request.id" :isAdmin="false" />
            </div>

            <!-- Action to Confirm Delivery (menunggu_verifikasi_admin) -->
            <!-- Driver / Delivery Information (visible once delivery is assigned) -->
            <div v-if="['menunggu_pembayaran', 'sedang_diproses', 'dikirim', 'menunggu_verifikasi_admin'].includes(request.status) && (request.assigned_driver || request.delivery_method === 'trusted_provider')" class="bg-gradient-to-br from-indigo-50/80 to-purple-50/40 dark:from-indigo-950/30 dark:to-purple-950/20 border border-indigo-200 dark:border-indigo-900/50 rounded-2xl p-4 sm:p-5 shadow-sm">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-xl">{{ request.delivery_method === 'sea' ? 'directions_boat' : request.delivery_method === 'air' ? 'flight' : 'verified_user' }}</span>
                </div>
                <h3 class="font-bold text-base text-indigo-900 dark:text-indigo-300">
                  {{ $t('request_details.trusted_provider') }}
                </h3>
              </div>

              <div v-if="request.assigned_driver" class="flex items-center gap-3 p-3 bg-white/60 dark:bg-slate-900/60 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                  {{ (request.assigned_driver.full_name || request.assigned_driver.name) ? (request.assigned_driver.full_name || request.assigned_driver.name).charAt(0).toUpperCase() : 'D' }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-bold text-sm text-slate-900 dark:text-white truncate">{{ request.assigned_driver.full_name || request.assigned_driver.name }}</p>
                  <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ request.assigned_driver.email }}</p>
                  <p v-if="request.assigned_driver.phone" class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ request.assigned_driver.phone }}</p>
                </div>
                <span class="text-[10px] font-extrabold px-2 py-1 rounded-md uppercase shrink-0"
                  :class="request.delivery_method === 'sea' ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800' : request.delivery_method === 'air' ? 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800' : 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'">
                  {{ request.delivery_method === 'sea' ? 'Sea Freight' : request.delivery_method === 'air' ? 'Air Freight' : 'Trusted' }}
                </span>
              </div>

              <div v-else-if="request.delivery_method === 'trusted_provider'" class="flex items-center gap-3 p-3 bg-white/60 dark:bg-slate-900/60 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-xl">verified_user</span>
                </div>
                <div class="flex-1">
                  <p class="font-bold text-sm text-slate-900 dark:text-white">{{ $t('request_details.trusted_provider') }}</p>
                  <p class="text-xs text-slate-500 dark:text-slate-400">{{ $t('request_details.trusted_provider_desc') }}</p>
                </div>
              </div>

              <p class="text-[11px] text-indigo-700 dark:text-indigo-300 mt-3 leading-relaxed">
                💬 {{ $t('request_details.driver_contact_hint') }}
              </p>
            </div>

            <div v-if="request.status === 'dikirim'" class="bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-4 sm:p-6 shadow-sm">
              <h3 class="font-bold text-emerald-900 dark:text-emerald-300 mb-2">{{ $t('request_details.confirm_delivery') }}</h3>
              <p class="text-xs sm:text-sm text-emerald-700 dark:text-emerald-400 mb-4">{{ $t('request_details.confirm_delivery_desc') }}</p>
              <button @click="confirmDelivery" :disabled="confirming" class="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
                <span v-if="confirming" class="material-symbols-outlined animate-spin">progress_activity</span>
                <span class="material-symbols-outlined" v-else>done_all</span>
                {{ $t('request_details.goods_received') }}
              </button>
            </div>
            
            <!-- Cancel Action -->
            <div v-if="['menunggu_penawaran_admin', 'menunggu_pemilihan_buyer', 'menunggu_kesepakatan_final'].includes(request.status)" class="bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/50 rounded-2xl p-4 sm:p-6 mt-4 shadow-sm">
              <h3 class="font-bold text-rose-800 dark:text-rose-300 mb-2">{{ $t('request_details.cancel_request') }}</h3>
              <p class="text-xs sm:text-sm text-rose-600 dark:text-rose-400 mb-4">{{ $t('request_details.cancel_request_desc') }}</p>
              <button @click="showCancelModal = true" class="w-full px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-colors cursor-pointer">
                {{ $t('request_details.cancel_request_button') }}
              </button>
            </div>

            <!-- Dispute Action -->
            <div v-if="['dikirim', 'menunggu_verifikasi_admin'].includes(request.status)" class="bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 rounded-2xl p-4 sm:p-6 mt-4 shadow-sm">
              <h3 class="font-bold text-amber-800 dark:text-amber-300 mb-2">{{ $t('request_details.raise_complaint') }}</h3>
              <p class="text-xs sm:text-sm text-amber-600 dark:text-amber-400 mb-4">{{ $t('request_details.raise_complaint_desc') }}</p>
              <button @click="disputeModalOpen = true" class="w-full px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-colors cursor-pointer">
                {{ $t('request_details.raise_complaint_button') }}
              </button>
            </div>
            
            <!-- Rating Form (If Completed) -->
            <div v-if="request.status === 'selesai' && !existingRating" class="premium-card rounded-xl p-4 sm:p-6 bg-purple-50 border-purple-200">
              <h3 class="font-bold text-gray-800 mb-2">{{ $t('request_details.rate_order') }}</h3>
              <p class="text-sm text-gray-600 mb-4">{{ $t('request_details.rate_order_desc') }}</p>
              
              <div class="flex items-center gap-2 mb-4">
                <button 
                  v-for="star in 5" 
                  :key="star" 
                  @click="ratingScore = star"
                  @mouseover="hoverScore = star"
                  @mouseleave="hoverScore = 0"
                  class="text-3xl transition-colors"
                  :class="star <= (hoverScore || ratingScore) ? 'text-yellow-400' : 'text-gray-300'"
                >
                  ★
                </button>
              </div>
              
              <textarea 
                v-model="ratingReview"
                rows="3"
                :placeholder="$t('request_details.write_review')"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4f378a] mb-4 text-sm"
              ></textarea>
              
              <button 
                @click="submitRating" 
                :disabled="!ratingScore || submittingRating"
                class="px-6 py-2 bg-[#4f378a] text-white rounded-lg font-semibold disabled:opacity-50"
              >
                {{ $t('request_details.submit_review') }}
              </button>
            </div>
            
            <div v-if="existingRating" class="premium-card rounded-xl p-4 sm:p-6">
              <h3 class="font-bold text-gray-800 mb-2">{{ $t('request_details.your_review') }}</h3>
              <div class="flex text-yellow-400 text-xl mb-2">
                {{ '★'.repeat(existingRating.score) }}{{ '☆'.repeat(5 - existingRating.score) }}
              </div>
              <p class="text-sm text-gray-700 italic">"{{ existingRating.review }}"</p>
            </div>
          </div>

          <!-- Right Column: Timeline & Actions -->
          <div class="space-y-4 sm:space-y-6">
                   <!-- Status Timeline -->
            <div class="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-6 shadow-sm">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-[#4f378a]/10 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center">
                  <span class="material-symbols-outlined text-[#4f378a] dark:text-indigo-400">timeline</span>
                </div>
                <h2 class="text-lg font-bold text-gray-800 dark:text-white">{{ $t('order_detail.status_timeline') }}</h2>
              </div>

              <div class="space-y-4">
                <div v-for="(log, idx) in trackingLogs" :key="log.id" class="flex gap-3">
                  <div class="flex flex-col items-center">
                    <div :class="['w-8 h-8 rounded-full flex items-center justify-center', idx === trackingLogs.length - 1 ? 'bg-[#4f378a] dark:bg-indigo-600 ring-4 ring-[#4f378a]/20 dark:ring-indigo-500/20' : 'bg-emerald-500']">
                      <span v-if="idx === trackingLogs.length - 1" class="material-symbols-outlined text-white text-[16px]">radio_button_checked</span>
                      <span v-else class="material-symbols-outlined text-white text-[16px]">check</span>
                    </div>
                    <div v-if="idx < trackingLogs.length - 1" class="w-0.5 h-full bg-gray-200 dark:bg-slate-800 mt-2"></div>
                  </div>
                  <div class="flex-1 pb-4">
                    <p :class="['font-semibold text-sm', idx === trackingLogs.length - 1 ? 'text-[#4f378a] dark:text-indigo-400' : 'text-gray-800 dark:text-slate-200']">
                      {{ $t(`status.${log.status.toLowerCase()}`) }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-slate-400">{{ formatDate(log.created_at) }}</p>
                    <p v-if="log.notes" class="text-xs text-gray-600 dark:text-slate-300 mt-1">{{ log.notes }}</p>
                  </div>
                </div>
                <div v-if="trackingLogs.length === 0" class="text-sm text-gray-500 dark:text-slate-500 italic">No timeline events yet.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Cancel Modal -->
      <div v-if="showCancelModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showCancelModal = false"></div>
        <div class="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
          <h2 class="text-lg font-bold text-gray-800 dark:text-white mb-4">{{ $t('request_details.cancel_modal_title') }}</h2>
          <p class="text-sm text-gray-600 dark:text-slate-400 mb-4">{{ $t('request_details.cancel_modal_desc') }}</p>
          <textarea v-model="cancelReason" rows="3" class="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl mb-4 text-slate-900 dark:text-white" :placeholder="$t('request_details.cancel_reason_placeholder')"></textarea>
          <div class="flex gap-2 justify-end">
            <button @click="showCancelModal = false" class="px-4 py-2 text-gray-600 dark:text-slate-400 font-semibold hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer">{{ $t('common.cancel') }}</button>
            <button @click="submitCancel" :disabled="!cancelReason || cancelling" class="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-50 cursor-pointer">{{ $t('request_details.cancel_action') }}</button>
          </div>
        </div>
      </div>

      <!-- Dispute Modal -->
      <div v-if="disputeModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="disputeModalOpen = false"></div>
        <div class="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
          <h2 class="text-lg font-bold text-gray-800 dark:text-white mb-4">{{ $t('request_details.dispute_modal_title') }}</h2>
          <p class="text-sm text-gray-600 dark:text-slate-400 mb-4">{{ $t('request_details.dispute_modal_desc') }}</p>
          <textarea v-model="disputeReason" rows="3" class="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl mb-4 text-slate-900 dark:text-white" :placeholder="$t('request_details.dispute_reason_placeholder')"></textarea>
          <div class="flex gap-2 justify-end">
            <button @click="disputeModalOpen = false" class="px-4 py-2 text-gray-600 dark:text-slate-400 font-semibold hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer">{{ $t('common.cancel') }}</button>
            <button @click="submitDispute" :disabled="!disputeReason || disputing" class="px-4 py-2 bg-yellow-600 text-white font-bold rounded-lg hover:bg-yellow-700 disabled:opacity-50 cursor-pointer">{{ $t('request_details.dispute_action') }}</button>
          </div>
        </div>
      </div>

    </main>

    <!-- Multi-Select Options Action Bar -->
    <div v-if="request && request.status === 'menunggu_pemilihan_buyer'" class="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <p class="font-bold text-slate-900 dark:text-white text-base sm:text-lg">{{ selectedOptionIds.length }} {{ $t('request_details.your_selection') }}</p>
        <p class="text-xs text-slate-500 dark:text-slate-400">{{ $t('request_details.click_to_add_selection') }}</p>
      </div>
      <div class="flex w-full sm:w-auto gap-3">
        <button @click="submitSelection([], true)" :disabled="selectingOption" class="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold rounded-xl hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors disabled:opacity-50 text-xs sm:text-sm cursor-pointer">
          {{ $t('request_details.direct_approve') }}
        </button>
        <button @click="submitSelection([])" :disabled="selectingOption" class="flex-1 sm:flex-none px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 text-xs sm:text-sm cursor-pointer">
          {{ $t('request_details.request_other_options') }}
        </button>
        <button @click="submitSelection(selectedOptionIds)" :disabled="selectingOption || selectedOptionIds.length === 0" class="flex-1 sm:flex-none px-7 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:opacity-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 text-xs sm:text-sm cursor-pointer">
          <span v-if="selectingOption" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
          <span v-else class="material-symbols-outlined text-sm">check_circle</span>
          {{ $t('request_details.confirm_selection') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useToast } from '../../composables/useToast.js';
const { showToast } = useToast();
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ChatComponent from '../../components/chat/ChatComponent.vue'
import ImageLightbox from '../../components/ui/ImageLightbox.vue'
import { requestService } from '../../api/requestService.js'
import { ratingService } from '../../api/ratingService.js'
import { getMediaUrl } from '../../utils/mediaUrl.js'

const router = useRouter()
const route = useRoute()

// State
const request = ref(null)
const trackingLogs = ref([])
const loading = ref(true)
const confirming = ref(false)

// Safe LocalStorage JSON parse with fallback
const getStoredUserRole = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return user.role || 'buyer'
  } catch {
    return 'buyer'
  }
}
const userRole = ref(getStoredUserRole())

const ratingScore = ref(0)
const hoverScore = ref(0)
const ratingReview = ref('')
const existingRating = ref(null)
const submittingRating = ref(false)

const showCancelModal = ref(false)
const cancelReason = ref('')
const cancelling = ref(false)

const showEditModal = ref(false)
const activeEditSection = ref('')
const savingEdit = ref(false)
const editForm = ref({})
const editFiles = ref([])

// ---------------------------------------------------------------------------
// Inline edit (one field at a time)
// ---------------------------------------------------------------------------
const editingField = ref('')
const inlineEditValue = ref('')
const inlineUnitValue = ref('')
const savingInline = ref(false)

// Image lightbox state
const lightboxOpen = ref(false)
const lightboxStartIndex = ref(0)
const lightboxImages = computed(() => {
  if (!request.value || !request.value.image_urls) return []
  return request.value.image_urls.map(f => getMediaUrl(f))
})

const canInlineEdit = computed(() => {
  if (!request.value) return false
  return request.value.status === 'menunggu_penawaran_admin'
})

const todayIso = (() => {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
})()

const inlineDateInputValue = computed(() => {
  if (!request.value || !request.value.delivery_timeline) return ''
  // Expecting ISO timestamp; convert to YYYY-MM-DD
  const dt = request.value.delivery_timeline
  if (typeof dt === 'string' && dt.length >= 10) return dt.substring(0, 10)
  try {
    const d = new Date(dt)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  } catch (e) {
    return ''
  }
})

// Map frontend field key -> backend payload key (for fields with different names)
const INLINE_FIELD_MAP = {
  product_name:        { payload: 'product_name',         type: 'string' },
  category:            { payload: 'category',             type: 'string' },
  sub_category:        { payload: 'sub_category',         type: 'string' },
  description:         { payload: 'specifications',       type: 'string' },
  quality_requirements:{ payload: 'quality_requirements', type: 'string' },
  certifications:      { payload: 'certifications',       type: 'string' },
  quantity:            { payload: 'quantity',             type: 'number' },
  unit:                { payload: 'unit',                 type: 'string' },
  target_delivery:     { payload: 'target_delivery',      type: 'string' },
  budget_range:        { payload: 'budget_range',         type: 'string' },
  shipping_terms:      { payload: 'shipping_terms',       type: 'string' },
  payment_terms:       { payload: 'payment_terms',        type: 'string' },
}

const startInlineEdit = (field, currentValue) => {
  if (!canInlineEdit.value) return
  editingField.value = field
  inlineEditValue.value = currentValue == null ? '' : String(currentValue)
  // Special: quantity row also edits unit alongside
  inlineUnitValue.value = field === 'quantity' ? (request.value?.unit || '') : (request.value?.unit || '')
  // Focus after Vue paints the input
  setTimeout(() => {
    const el = document.querySelector('[data-edit-input="' + field + '"]')
    if (el && typeof el.focus === 'function') {
      el.focus()
      if (typeof el.select === 'function' && field !== 'target_delivery') {
        try { el.select() } catch (e) {}
      }
    }
  }, 30)
}

const cancelInlineEdit = () => {
  if (savingInline.value) return
  editingField.value = ''
  inlineEditValue.value = ''
  inlineUnitValue.value = ''
}

const openAttachmentLightbox = (idx) => {
  if (!request.value || !request.value.image_urls) return
  lightboxStartIndex.value = Math.max(0, Math.min(idx, request.value.image_urls.length - 1))
  lightboxOpen.value = true
}

const saveInlineField = async (field) => {
  if (!canInlineEdit.value) return
  if (savingInline.value) return
  if (!request.value) return

  savingInline.value = true
  try {
    const r = request.value
    const formData = new FormData()

    // Snapshot ALL current values for required backend fields
    const product_name = (r.product_name ?? '').toString()
    const category = (r.category ?? '').toString()
    const sub_category = (r.sub_category ?? '').toString()
    const specifications = (r.description ?? '').toString()
    const quality_requirements = (r.quality_requirements ?? '').toString()
    const certifications = (r.certifications ?? '').toString()

    // Quantity (special: combined edit row allows editing unit too)
    let qty = Number(r.quantity)
    let unit = (r.unit ?? '').toString()
    if (field === 'quantity') {
      const parsed = Number(inlineEditValue.value)
      qty = Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : qty
      unit = (inlineUnitValue.value || unit || '').toString()
    }

    // Target delivery date (special: convert YYYY-MM-DD to backend-acceptable format)
    let target_delivery = ''
    if (r.delivery_timeline) {
      const d = new Date(r.delivery_timeline)
      if (!isNaN(d.getTime())) target_delivery = d.toISOString().substring(0, 10)
    }
    if (field === 'target_delivery' && inlineEditValue.value) {
      target_delivery = inlineEditValue.value
    }

    const budget_range = (field === 'budget_range' ? inlineEditValue.value : (r.budget_range ?? '')).toString()
    const shipping_terms = (field === 'shipping_terms' ? inlineEditValue.value : (r.shipping_terms ?? '')).toString()
    const payment_terms = (field === 'payment_terms' ? inlineEditValue.value : (r.payment_terms ?? '')).toString()

    // The currently-edited text field (everything except quantity/target_delivery which are handled above)
    let activeValue = ''
    if (!['quantity', 'target_delivery'].includes(field)) {
      activeValue = (inlineEditValue.value ?? '').toString()
    }

    // Build snapshot for the active field
    let snap_product_name = product_name
    let snap_category = category
    let snap_sub_category = sub_category
    let snap_specifications = specifications
    let snap_quality_requirements = quality_requirements
    let snap_certifications = certifications
    let snap_budget_range = budget_range
    let snap_shipping_terms = shipping_terms
    let snap_payment_terms = payment_terms

    switch (field) {
      case 'product_name':         snap_product_name = activeValue; break
      case 'category':             snap_category = activeValue; break
      case 'sub_category':         snap_sub_category = activeValue; break
      case 'description':          snap_specifications = activeValue; break
      case 'quality_requirements': snap_quality_requirements = activeValue; break
      case 'certifications':       snap_certifications = activeValue; break
      case 'budget_range':         snap_budget_range = activeValue; break
      case 'shipping_terms':       snap_shipping_terms = activeValue; break
      case 'payment_terms':        snap_payment_terms = activeValue; break
    }

    // Append all required fields
    formData.append('product_name', snap_product_name)
    formData.append('category', snap_category || 'electronics')
    formData.append('sub_category', snap_sub_category)
    formData.append('specifications', snap_specifications)
    formData.append('quality_requirements', snap_quality_requirements)
    formData.append('certifications', snap_certifications)
    formData.append('quantity', String(qty))
    formData.append('unit', unit)
    formData.append('budget_range', snap_budget_range)
    if (target_delivery) formData.append('target_delivery', target_delivery)
    formData.append('shipping_terms', snap_shipping_terms || 'FOB')
    formData.append('payment_terms', snap_payment_terms || 'TT')
    // Laravel requires _method=PUT with FormData (PUT multipart requests are not processed correctly)
    formData.append('_method', 'PUT')
    formData.append('keep_images', 'true')

    // Optimistic local update so UI feels instant
    if (field === 'product_name') r.product_name = snap_product_name
    if (field === 'category') r.category = snap_category
    if (field === 'sub_category') r.sub_category = snap_sub_category
    if (field === 'description') r.description = snap_specifications
    if (field === 'quality_requirements') r.quality_requirements = snap_quality_requirements
    if (field === 'certifications') r.certifications = snap_certifications
    if (field === 'quantity') { r.quantity = qty; r.unit = unit }
    if (field === 'target_delivery' && target_delivery) r.delivery_timeline = target_delivery
    if (field === 'budget_range') r.budget_range = snap_budget_range
    if (field === 'shipping_terms') r.shipping_terms = snap_shipping_terms
    if (field === 'payment_terms') r.payment_terms = snap_payment_terms

    await requestService.updateRequestDetails(r.id, formData)
    cancelInlineEdit()
    // Background refresh from server (don't await for UI feel; we already updated optimistically)
    loadData().catch(() => {})
    showToast('Saved ✓', 'success')
  } catch (e) {
    showToast(e.response?.data?.message || 'Failed to save change', 'error')
    // Re-fetch to rollback any optimistic state — do NOT let this throw prevent cancelInlineEdit
    loadData().catch(() => {})
  } finally {
    cancelInlineEdit()
    savingInline.value = false
  }
}

const disputeModalOpen = ref(false)
const disputeReason = ref('')
const disputing = ref(false)

const selectingOption = ref(false)
const paymentProofInput = ref(null)
const paymentProofFile = ref(null)
const uploadingProof = ref(false)

// Device Detection
const isTablet = ref(false)
const isMobile = ref(false)
const isDesktop = ref(false)
const windowWidth = ref(0)
const activeRoute = ref('requests')

const updateDeviceType = () => {
  windowWidth.value = window.innerWidth
  if (windowWidth.value < 768) {
    isMobile.value = true; isTablet.value = false; isDesktop.value = false
  } else if (windowWidth.value < 1024) {
    isMobile.value = false; isTablet.value = true; isDesktop.value = false
  } else {
    isMobile.value = false; isTablet.value = false; isDesktop.value = true
  }
}
const showSidebar = computed(() => isTablet.value || isDesktop.value)

// The Golden Path Stages
const stages = [
  'menunggu_penawaran_admin', 
  'menunggu_pemilihan_buyer', 
  'menunggu_kesepakatan_final', 
  'menunggu_pembayaran', 
  'menunggu_verifikasi_pembayaran', 
  'sedang_diproses', 
  'dikirim', 
  'menunggu_verifikasi_admin', 
  'selesai'
];

const timelineStages = computed(() => {
  if (!request.value) return [];
  const currentIdx = Math.max(0, stages.indexOf(request.value.status));
  
  return [
    { value: 'menunggu_penawaran_admin', label: 'RFQ Sent', icon: 'edit_document', passed: currentIdx > 0, current: currentIdx === 0 },
    { value: 'menunggu_pemilihan_buyer', label: 'Options', icon: 'list_alt', passed: currentIdx > 1, current: currentIdx === 1 },
    { value: 'menunggu_kesepakatan_final', label: 'Negotiate', icon: 'forum', passed: currentIdx > 2, current: currentIdx === 2 },
    { value: 'menunggu_pembayaran', label: 'Payment', icon: 'payments', passed: currentIdx > 3, current: currentIdx === 3 },
    { value: 'sedang_diproses', label: 'Process', icon: 'conveyor_belt', passed: currentIdx > 5, current: currentIdx === 5 },
    { value: 'dikirim', label: 'Shipped', icon: 'local_shipping', passed: currentIdx > 6, current: currentIdx === 6 },
    { value: 'selesai', label: 'Complete', icon: 'task_alt', passed: currentIdx > 8, current: currentIdx === 8 }
  ];
});

const progressWidth = computed(() => {
  if (!request.value) return '0%';
  const currentIdx = Math.max(0, stages.indexOf(request.value.status));
  return `${(currentIdx / (stages.length - 1)) * 100}%`;
});

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const getOptionImages = (opt) => {
  if (!opt) return []
  let raw = opt.images || opt.image_url || opt.images_data
  if (!raw) return []
  
  if (typeof raw === 'string') {
    if (raw.startsWith('data:')) {
      return [raw]
    }
    if (raw.startsWith('[')) {
      try { raw = JSON.parse(raw) } catch (e) { raw = [raw] }
    } else {
      raw = [raw]
    }
  }
  
  if (!Array.isArray(raw)) raw = [raw]
  
  return raw.map(img => {
    if (!img || typeof img !== 'string') return ''
    return getMediaUrl(img)
  }).filter(Boolean)
}

const getStatusClass = (status) => {
  const classes = {
    'menunggu_penawaran_admin': 'bg-gray-500',
    'menunggu_pemilihan_buyer': 'bg-blue-500',
    'menunggu_kesepakatan_final': 'bg-indigo-500',
    'menunggu_pembayaran': 'bg-yellow-500',
    'menunggu_verifikasi_pembayaran': 'bg-orange-500',
    'sedang_diproses': 'bg-blue-600',
    'dikirim': 'bg-cyan-500',
    'menunggu_verifikasi_admin': 'bg-teal-500',
    'selesai': 'bg-green-500',
    'batal': 'bg-red-500',
    'dispute': 'bg-red-700'
  }
  return classes[status] || 'bg-gray-500'
}

const getStatusIcon = (status) => {
  const icons = {
    'menunggu_penawaran_admin': 'schedule',
    'menunggu_pemilihan_buyer': 'list_alt',
    'menunggu_kesepakatan_final': 'handshake',
    'menunggu_pembayaran': 'payments',
    'menunggu_verifikasi_pembayaran': 'pending_actions',
    'sedang_diproses': 'inventory',
    'dikirim': 'local_shipping',
    'menunggu_verifikasi_admin': 'fact_check',
    'selesai': 'task_alt',
    'batal': 'cancel',
    'dispute': 'report'
  }
  return icons[status] || 'help'
}

const shouldShowChat = computed(() => {
  if (!request.value) return false;
  const idx = stages.indexOf(request.value.status);
  return idx >= 2 && request.value.status !== 'batal'; // Show from 'menunggu_kesepakatan_final'
});

const loadData = async () => {
  try {
    const reqId = route.params.id
    request.value = await requestService.getRequestById(reqId)
    trackingLogs.value = await requestService.getTrackingLogs(reqId)
    if (request.value.status === 'selesai') {
      existingRating.value = await ratingService.getByRequest(reqId)
    }
  } catch (error) {
    console.error('Failed to load request:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  updateDeviceType()
  window.addEventListener('resize', updateDeviceType)
  loadData()
})
onUnmounted(() => window.removeEventListener('resize', updateDeviceType))

const selectedOptionIds = ref([])
const buyerNote = ref('')

const copyText = (text) => {
  if (!text) return
  navigator.clipboard.writeText(text)
  showToast(t('request_details.account_copied'))
}

const isImageFile = (path) => {
  if (!path) return false
  // Check for base64 data URL (starts with data:image/...)
  if (path.startsWith('data:')) {
    return path.startsWith('data:image/')
  }
  // Check for regular URLs with image extensions
  const ext = path.split('.').pop()?.toLowerCase()
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)
}

const getImageUrl = (path) => {
  return getMediaUrl(path)
}

const openInNewTab = (url) => {
  if (!url) return
  window.open(url, '_blank')
}

const toggleOption = (id) => {
  if (selectedOptionIds.value.includes(id)) {
    selectedOptionIds.value = selectedOptionIds.value.filter(oid => oid !== id);
  } else {
    selectedOptionIds.value.push(id);
  }
}

const submitSelection = async (optionIds, isDirectApproval = false) => {
  if (!isDirectApproval && optionIds.length === 0) {
    if (!confirm(t('request_details.no_selection_warning'))) return;
  }
  
  selectingOption.value = true;
  try {
    await requestService.selectOption(request.value.id, optionIds, buyerNote.value, isDirectApproval);
    await loadData();
    selectedOptionIds.value = [];
    buyerNote.value = '';
    showToast(isDirectApproval ? t('request_details.acc_direct_confirmed') : t('request_details.response_sent'), 'success');
  } catch (e) {
    showToast(e.response?.data?.message || 'Failed to submit selection', 'error');
  } finally {
    selectingOption.value = false;
  }
}

const handlePaymentProofChange = (e) => {
  if (e.target.files.length > 0) {
    paymentProofFile.value = e.target.files[0];
  }
}

const submitPaymentProof = async () => {
  if (!paymentProofFile.value) return;
  uploadingProof.value = true;
  try {
    const formData = new FormData();
    formData.append('payment_proof', paymentProofFile.value);
    await requestService.uploadPaymentProof(request.value.id, formData);
    paymentProofFile.value = null;
    await loadData();
  } catch (e) {
    showToast(e.response?.data?.message || 'Failed to upload payment proof', 'error');
  } finally {
    uploadingProof.value = false;
  }
}

const confirmDelivery = async () => {
  if (!confirm(t('request_details.confirm_delivery_confirm'))) return;
  confirming.value = true
  try {
    await requestService.confirmDelivery(request.value.id)
    await loadData()
  } catch (err) {
    showToast(err.response?.data?.message || 'Failed to confirm delivery', 'error')
  } finally {
    confirming.value = false
  }
}

const submitCancel = async () => {
  cancelling.value = true;
  try {
    await requestService.cancelRequest(request.value.id, cancelReason.value);
    showCancelModal.value = false;
    await loadData();
  } catch (error) {
    showToast(error.response?.data?.message || 'Failed to cancel request', 'error');
  } finally {
    cancelling.value = false;
  }
}

const openEditModal = (section) => {
  activeEditSection.value = section;
  editForm.value = {
    product_name: request.value.product_name,
    category: request.value.category,
    sub_category: request.value.sub_category,
    specifications: request.value.specifications,
    quality_requirements: request.value.quality_requirements,
    certifications: request.value.certifications,
    quantity: request.value.quantity,
    unit: request.value.unit,
    budget_range: request.value.budget_range,
    target_delivery: request.value.delivery_timeline ? request.value.delivery_timeline.split('T')[0] : '',
    shipping_terms: request.value.shipping_terms,
    payment_terms: request.value.payment_terms
  };
  editFiles.value = [];
  showEditModal.value = true;
}

const handleEditPhotoUpload = (e) => {
  if (e.target.files.length > 0) {
    editFiles.value = Array.from(e.target.files).slice(0, 3);
  }
}

const submitEdit = async () => {
  savingEdit.value = true;
  try {
    const formData = new FormData();
    for(const key in editForm.value) {
      if(editForm.value[key] !== null && editForm.value[key] !== undefined) {
        formData.append(key, editForm.value[key]);
      }
    }
    
    if (activeEditSection.value === 'attachments' && editFiles.value.length > 0) {
      for (const file of editFiles.value) {
        formData.append('images[]', file);
      }
    } else if (activeEditSection.value === 'attachments' && editFiles.value.length === 0) {
      formData.append('keep_images', 'true');
    }

    // Laravel requires _method=PUT with FormData
    formData.append('_method', 'PUT');

    await requestService.updateRequestDetails(request.value.id, formData);
    showEditModal.value = false;
    await loadData();
  } catch (e) {
    showToast(e.response?.data?.message || 'Gagal menyimpan perubahan', 'error');
  } finally {
    savingEdit.value = false;
  }
}

const submitDispute = async () => {
  disputing.value = true;
  try {
    await requestService.disputeRequest(request.value.id, disputeReason.value);
    disputeModalOpen.value = false;
    await loadData();
  } catch (error) {
    showToast(error.response?.data?.message || 'Failed to dispute request', 'error');
  } finally {
    disputing.value = false;
  }
}

const submitRating = async () => {
  submittingRating.value = true
  try {
    const data = await ratingService.createRating({
      request_id: request.value.id,
      supplier_id: request.value.assigned_supplier_id || request.value.user_id, // Fallback if no supplier explicitly attached to ratings in new schema
      score: ratingScore.value,
      review: ratingReview.value
    })
    existingRating.value = data
  } catch (error) {
    showToast(error.response?.data?.message || 'Failed to submit rating', 'error')
  } finally {
    submittingRating.value = false
  }
}

const goBack = () => {
  router.push('/buyer/requests');
}
const navigate = (r) => { activeRoute.value = r; if (r === 'dashboard') router.push('/buyer/dashboard') }
const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<style scoped>
.glass-header {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
}

.glass-sidebar {
  background: rgba(248, 250, 252, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.premium-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 1);
  box-shadow: 
    0 10px 25px -5px rgba(0, 0, 0, 0.05),
    0 8px 10px -6px rgba(0, 0, 0, 0.01),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.custom-scrollbar::-webkit-scrollbar {
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #c7c7cc;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #a1a1a6;
}
</style>

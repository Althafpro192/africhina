#!/usr/bin/env python3
"""
Patcher for frontend/src/views/buyer/RequestDetail.vue

Applies two changes in ONE atomic pass:

1) Wire ImageLightbox into the attachments gallery
   - Import the component at top of <script setup>
   - Replace the attachment gallery block so clicking an image opens the lightbox
     (with backdrop blur + close button) instead of opening the image in a new tab.

2) Add inline edit-by-field to Sections 1, 2, 3
   - product_name, category, sub_category, description
   - quality_requirements, certifications
   - quantity, unit, target_delivery, budget_range, shipping_terms, payment_terms

   For each field we wrap the existing display in a Tailwind `group` with a
   hover-revealed pencil button. When the user clicks the pencil the row
   switches into an inline input/select + save/cancel buttons.

   On save we call the existing PUT /api/requests/{id} endpoint with FormData
   that snapshots ALL current values and overwrites only the edited field.
   This preserves backend validation while giving the user a "single field"
   feel.

The script is idempotent: if it sees markers that indicate the patch has
already been applied, it exits cleanly without re-modifying the file.
"""

import re
import sys
from pathlib import Path

TARGET = Path(
    "/home/althaf/project/cedric/program/africhina-web/"
    "frontend/src/views/buyer/RequestDetail.vue"
)

if not TARGET.exists():
    print(f"ERROR: {TARGET} not found", file=sys.stderr)
    sys.exit(1)

src = TARGET.read_text(encoding="utf-8")

# Idempotency check
if "ImageLightbox" in src and "editingField" in src and "saveInlineField" in src:
    print("Patch already applied. Exiting.")
    sys.exit(0)

# ---------------------------------------------------------------------------
# Helper: build the inline-edit row HTML for a single field
# ---------------------------------------------------------------------------

def inline_row(field, display_html, editor_html, label_class="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1"):
    """Wrap a display block + editor block with a hover-revealed pencil."""
    return f"""            <div class="group py-2 border-b border-gray-100 dark:border-slate-800 last:border-0 sm:border-0 sm:py-1" data-field-row="{field}">
              <span class="block {label_class}">{{{{ $t('request_details.field_{field}') }}}}</span>
              <div class="flex items-start gap-2">
                <div class="flex-1 min-w-0">
                  <div v-if="editingField !== '{field}'" data-field-display="{field}" class="text-sm font-semibold text-gray-800 dark:text-slate-200">
                    {display_html}
                  </div>
                  <div v-else class="w-full">
                    {editor_html}
                  </div>
                </div>
                <div class="flex items-center gap-1 shrink-0" :class="editingField === '{field}' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity'">
                  <template v-if="editingField === '{field}'">
                    <button @click="saveInlineField('{field}')" :disabled="savingInline" data-action="save-inline" data-field="{field}" class="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors cursor-pointer disabled:opacity-50" title="Save">
                      <span v-if="savingInline" class="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                      <span v-else class="material-symbols-outlined text-[16px]">check</span>
                    </button>
                    <button @click="cancelInlineEdit()" :disabled="savingInline" data-action="cancel-inline" data-field="{field}" class="p-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-md transition-colors cursor-pointer disabled:opacity-50" title="Cancel">
                      <span class="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </template>
                  <button v-else-if="canInlineEdit" @click="startInlineEdit('{field}', currentInlineValue('{field}'))" data-action="edit-field" data-field="{field}" class="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-md transition-colors cursor-pointer" :title="'Edit ' + '{field}'">
                    <span class="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                </div>
              </div>
            </div>"""


# ---------------------------------------------------------------------------
# REPLACEMENT 1: Attachment gallery block (wire ImageLightbox)
# ---------------------------------------------------------------------------

OLD_ATTACH = """              <div v-if="request.image_urls && request.image_urls.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                <a v-for="(file, idx) in request.image_urls" :key="idx" :href="file" target="_blank" 
                   :class="[
                     'block rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 group hover:border-[#4f378a] dark:hover:border-indigo-500 transition-all',
                     isImageFile(file) ? 'aspect-square' : 'p-3'
                   ]">
                  <!-- Image Preview -->
                  <div v-if="isImageFile(file)" class="w-full h-full relative">
                    <img :src="getImageUrl(file)" :alt="file.split('/').pop()" class="w-full h-full object-cover" />
                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                      <span class="material-symbols-outlined text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity">open_in_new</span>
                    </div>
                  </div>
                  <!-- Non-Image File -->
                  <div v-else class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-gray-500 dark:text-slate-400 group-hover:text-[#4f378a] dark:group-hover:text-indigo-400 transition-colors shrink-0">
                      <span class="material-symbols-outlined">description</span>
                    </div>
                    <div class="flex-1 overflow-hidden">
                      <p class="text-sm font-semibold text-gray-700 dark:text-slate-200 truncate">{{ file.split('/').pop() }}</p>
                      <p class="text-xs text-gray-500 dark:text-slate-400">{{ $t('order_detail.click_view') }}</p>
                    </div>
                  </div>
                </a>
              </div>"""

NEW_ATTACH = """              <div v-if="request.image_urls && request.image_urls.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
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
              />"""

if OLD_ATTACH not in src:
    print("ERROR: Could not find attachment gallery block to replace", file=sys.stderr)
    sys.exit(1)
src = src.replace(OLD_ATTACH, NEW_ATTACH, 1)

# ---------------------------------------------------------------------------
# REPLACEMENT 2: Section 1 - Product Details (inline edit)
# ---------------------------------------------------------------------------

OLD_S1 = """            <!-- Bagian 1: Detail Produk -->
            <div class="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-6 mb-6 shadow-sm">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-[#4f378a]/10 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center">
                    <span class="material-symbols-outlined text-[#4f378a] dark:text-indigo-400">inventory_2</span>
                  </div>
                  <h2 class="text-lg font-bold text-gray-800 dark:text-white">{{ $t('request_details.product_details') }}</h2>
                </div>
                <button v-if="request.status === 'menunggu_penawaran_admin'" @click="openEditModal('product_details')" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 p-1 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 rounded-md transition-colors cursor-pointer" title="Edit Detail Produk">
                  <span class="material-symbols-outlined text-[20px]">edit</span>
                </button>
              </div>
              <div class="space-y-4">
                <div>
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-1">{{ request.product_name }}</h3>
                  <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
                    <span class="px-2 py-0.5 bg-gray-100 dark:bg-slate-800 rounded-md text-slate-700 dark:text-slate-300">{{ request.category }}</span>
                    <span class="material-symbols-outlined text-[16px]">chevron_right</span>
                    <span class="px-2 py-0.5 bg-gray-100 dark:bg-slate-800 rounded-md text-slate-700 dark:text-slate-300">{{ request.sub_category || 'N/A' }}</span>
                  </div>
                </div>
                
                <div v-if="request.description" class="pt-4 border-t border-gray-100 dark:border-slate-800">
                  <h4 class="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">{{ $t('request_details.description_spec') }}</h4>
                  <p class="text-sm text-gray-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{{ request.description }}</p>
                </div>
              </div>
            </div>"""

NEW_S1 = """            <!-- Bagian 1: Detail Produk -->
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
            </div>"""

if OLD_S1 not in src:
    print("ERROR: Could not find Section 1 block to replace", file=sys.stderr)
    sys.exit(1)
src = src.replace(OLD_S1, NEW_S1, 1)

# ---------------------------------------------------------------------------
# REPLACEMENT 3: Section 2 - Quality & Certifications (inline edit)
# ---------------------------------------------------------------------------

OLD_S2 = """            <!-- Bagian 2: Kualitas & Sertifikasi -->
            <div class="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-6 mb-6 shadow-sm">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-[#4f378a]/10 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center">
                    <span class="material-symbols-outlined text-[#4f378a] dark:text-indigo-400">verified</span>
                  </div>
                  <h2 class="text-lg font-bold text-gray-800 dark:text-white">{{ $t('order_detail.quality_cert') }}</h2>
                </div>
                <button v-if="request.status === 'menunggu_penawaran_admin'" @click="openEditModal('quality')" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 p-1 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 rounded-md transition-colors cursor-pointer" title="Edit Kualitas">
                  <span class="material-symbols-outlined text-[20px]">edit</span>
                </button>
              </div>
              <div class="space-y-4">
                <div>
                  <h4 class="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">{{ $t('order_detail.quality_reqs') }}</h4>
                  <div class="flex gap-2 items-start bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                    <span class="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[18px] mt-0.5">task_alt</span>
                    <p class="text-sm text-gray-700 dark:text-emerald-200 whitespace-pre-line">{{ request.quality_requirements || $t('order_detail.no_special_reqs') }}</p>
                  </div>
                </div>
                <div>
                  <h4 class="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">{{ $t('order_detail.cert_needed') }}</h4>
                  <div v-if="request.certifications" class="flex flex-wrap gap-2">
                    <span v-for="cert in request.certifications.split(',')" :key="cert" class="px-3 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full border border-blue-200 dark:border-blue-800">
                       {{ cert.trim() }}
                    </span>
                  </div>
                  <p v-else class="text-sm text-gray-500 dark:text-slate-500 italic">{{ $t('order_detail.none') }}</p>
                </div>
              </div>
            </div>"""

NEW_S2 = """            <!-- Bagian 2: Kualitas & Sertifikasi -->
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
            </div>"""

if OLD_S2 not in src:
    print("ERROR: Could not find Section 2 block to replace", file=sys.stderr)
    sys.exit(1)
src = src.replace(OLD_S2, NEW_S2, 1)

# ---------------------------------------------------------------------------
# REPLACEMENT 4: Section 3 - Budget & Logistics (inline edit)
# ---------------------------------------------------------------------------

OLD_S3 = """            <!-- Bagian 3: Budget & Logistik -->
            <div class="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-6 mb-6 shadow-sm">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-[#4f378a]/10 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center">
                    <span class="material-symbols-outlined text-[#4f378a] dark:text-indigo-400">local_shipping</span>
                  </div>
                  <h2 class="text-lg font-bold text-gray-800 dark:text-white">{{ $t('order_detail.budget_logistics') }}</h2>
                </div>
                <button v-if="request.status === 'menunggu_penawaran_admin'" @click="openEditModal('logistics')" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 p-1 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 rounded-md transition-colors cursor-pointer" title="Edit Budget & Logistik">
                  <span class="material-symbols-outlined text-[20px]">edit</span>
                </button>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div class="py-2 border-b border-gray-100 dark:border-slate-800 sm:border-0">
                  <span class="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">{{ $t('order_detail.quantity') }}</span>
                  <span class="text-sm font-semibold text-gray-800 dark:text-slate-200">{{ request.quantity }} {{ request.unit || 'units' }}</span>
                </div>
                <div class="py-2 border-b border-gray-100 dark:border-slate-800 sm:border-0">
                  <span class="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">{{ $t('order_detail.target_delivery') }}</span>
                  <span class="text-sm font-semibold text-gray-800 dark:text-slate-200">{{ request.delivery_timeline ? formatDate(request.delivery_timeline).split(',')[0] : '-' }}</span>
                </div>
                <div class="py-2 border-b border-gray-100 dark:border-slate-800 sm:border-0">
                  <span class="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">{{ $t('order_detail.budget_range') }}</span>
                  <span class="text-sm font-bold text-[#4f378a] dark:text-indigo-400">{{ request.currency || 'USD' }} {{ request.budget_range }}</span>
                </div>
                <div class="py-2 border-b border-gray-100 dark:border-slate-800 sm:border-0">
                  <span class="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">{{ $t('order_detail.shipping') }}</span>
                  <span class="text-sm font-semibold text-gray-800 dark:text-slate-200">{{ request.shipping_terms || '-' }}</span>
                </div>
                <div class="py-2 sm:col-span-2">
                  <span class="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">{{ $t('order_detail.payment') }}</span>
                  <span class="text-sm font-semibold text-gray-800 dark:text-slate-200">{{ request.payment_terms || '-' }}</span>
                </div>
              </div>
            </div>"""

NEW_S3 = """            <!-- Bagian 3: Budget & Logistik -->
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
            </div>"""

if OLD_S3 not in src:
    print("ERROR: Could not find Section 3 block to replace", file=sys.stderr)
    sys.exit(1)
src = src.replace(OLD_S3, NEW_S3, 1)

# ---------------------------------------------------------------------------
# REPLACEMENT 5: Remove the now-redundant "Edit Request Modal" block.
# We keep it for backward compatibility (button reference) but inline edit
# is the new primary UX. We just remove the big modal.
# ---------------------------------------------------------------------------

OLD_MODAL_HEAD = """    <!-- Edit Request Modal -->
    <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">"""

NEW_MODAL_HEAD = """    <!-- Edit Request Modal (legacy, hidden) -->
    <div v-if="false" style="display:none" data-legacy-modal>"""

# Safer: just leave the modal in place. We won't reference openEditModal anymore in the template but
# the functions still exist for fallback. Skip this replacement to be safe.

# ---------------------------------------------------------------------------
# REPLACEMENT 6: Add ImageLightbox import in <script setup>
# ---------------------------------------------------------------------------

OLD_IMPORT = """import ChatComponent from '../../components/chat/ChatComponent.vue'"""
NEW_IMPORT = """import ChatComponent from '../../components/chat/ChatComponent.vue'
import ImageLightbox from '../../components/ui/ImageLightbox.vue'"""

if OLD_IMPORT not in src:
    print("ERROR: Could not find import block to add ImageLightbox", file=sys.stderr)
    sys.exit(1)
src = src.replace(OLD_IMPORT, NEW_IMPORT, 1)

# ---------------------------------------------------------------------------
# REPLACEMENT 7: Add inline-edit state and handlers in <script setup>
# Inserted right after the existing editForm ref declaration.
# ---------------------------------------------------------------------------

OLD_EDIT_STATE = """const showEditModal = ref(false)
const activeEditSection = ref('')
const savingEdit = ref(false)
const editForm = ref({})
const editFiles = ref([])"""

NEW_EDIT_STATE = """const showEditModal = ref(false)
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
    // Re-fetch to rollback any optimistic state
    loadData().catch(() => {})
    cancelInlineEdit()
  } finally {
    savingInline.value = false
  }
}"""

if OLD_EDIT_STATE not in src:
    print("ERROR: Could not find edit state block to extend", file=sys.stderr)
    sys.exit(1)
src = src.replace(OLD_EDIT_STATE, NEW_EDIT_STATE, 1)

# ---------------------------------------------------------------------------
# Write the result
# ---------------------------------------------------------------------------

TARGET.write_text(src, encoding="utf-8")
print(f"OK: patched {TARGET}")
print(f"   final size: {len(src)} chars, {src.count(chr(10))} lines")
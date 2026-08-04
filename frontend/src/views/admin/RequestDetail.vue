 <template>
  <AdminLayout>

    <main class="flex-1 p-10 max-w-[1600px] mx-auto space-y-10">
      
      <!-- Header Area inside Main -->
      <header class="flex justify-between items-end gap-6 mb-8">
        <div>
          <button @click="goBack" class="flex items-center gap-2 text-[#4f378a] dark:text-white hover:underline mb-2 font-semibold transition-colors duration-200">
            <span class="material-symbols-outlined text-[#4f378a] dark:text-white">arrow_back</span>
            {{ $t('common.back') }}
          </button>
          <h2 class="text-[40px] leading-[1.1] tracking-[-0.02em] font-extrabold text-slate-900 dark:text-white">{{ $t('order_detail.title') }}</h2>
          <p class="text-[16px] leading-[1.6] font-normal text-[#494551] dark:text-white">{{ $t('order_detail.manage_desc') }}</p>
        </div>
        <div class="flex gap-4 items-center">
          <LanguageSwitcher />
        </div>
      </header>

      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <span class="material-symbols-outlined animate-spin text-[#4f378a] mb-4" style="font-size: 48px;">progress_activity</span>
      </div>
      <div v-else-if="!request" class="text-center py-20">
        <h2 class="text-xl font-bold text-gray-600">Request not found</h2>
      </div>
      <div v-else class="w-full max-w-5xl mx-auto">
        
        <!-- Request Header Card -->
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 mb-4 sm:mb-6 shadow-sm border border-slate-200/80 dark:border-slate-800">
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{{ $t('order_detail.order_no') }}</span>
                <span class="text-sm font-black text-indigo-600 dark:text-indigo-400 font-mono">{{ request.id.split('-')[0].toUpperCase() }}</span>
              </div>
              <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2">{{ request.product_name }}</h1>
            </div>
            <span :class="['font-extrabold text-xs px-3.5 py-1.5 rounded-full text-white self-start shadow-xs', getStatusClass(request.status)]">
              {{ $t(`status.${request.status.toLowerCase()}`) }}
            </span>
          </div>
        </div>

        <!-- Tracking Timeline Header -->
        <div class="mb-6">
          <div class="relative w-full flex justify-between items-center px-2">
            <div class="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800 -z-10 rounded-full transform -translate-y-1/2"></div>
            <div class="absolute top-1/2 left-0 h-1 bg-indigo-600 dark:bg-indigo-500 -z-10 rounded-full transform -translate-y-1/2 transition-all duration-1000" :style="{ width: progressWidth }"></div>
            
            <div v-for="stage in timelineStages" :key="stage.value" class="flex flex-col items-center gap-2 bg-slate-50 dark:bg-slate-900 px-1 relative">
              <div :class="[
                'w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500',
                stage.passed ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 scale-110' : 
                stage.current ? 'bg-white dark:bg-slate-900 border-2 border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 scale-110' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
              ]">
                <span class="material-symbols-outlined text-[18px]">{{ stage.icon }}</span>
              </div>
              <span :class="['text-[11px] font-bold uppercase tracking-wider hidden sm:block', stage.current || stage.passed ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500']">{{ stage.label }}</span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <!-- Left Column -->
          <div class="lg:col-span-2 space-y-4 sm:space-y-6">
            
            <!-- Buyer Information -->
            <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80 dark:border-slate-800">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl flex items-center justify-center">
                  <span class="material-symbols-outlined text-indigo-600 dark:text-indigo-400">person</span>
                </div>
                <h2 class="text-lg font-black text-slate-900 dark:text-white">{{ $t('order_detail.buyer_info') }}</h2>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p class="text-xs text-slate-400 dark:text-slate-500 font-semibold mb-1">{{ $t('order_detail.name') }}</p>
                  <p class="font-bold text-sm text-slate-900 dark:text-white">{{ request.buyer_name }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-400 dark:text-slate-500 font-semibold mb-1">{{ $t('order_detail.company') }}</p>
                  <p class="font-bold text-sm text-slate-900 dark:text-white">{{ request.buyer_company }}</p>
                </div>
                <div class="sm:col-span-2">
                  <p class="text-xs text-slate-400 dark:text-slate-500 font-semibold mb-1">{{ $t('order_detail.email') }}</p>
                  <p class="font-bold text-sm text-indigo-600 dark:text-indigo-400 font-mono">{{ request.buyer_email }}</p>
                </div>
              </div>
            </div>

            <!-- Bagian 1: Informasi Produk -->
            <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80 dark:border-slate-800">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl flex items-center justify-center">
                  <span class="material-symbols-outlined text-indigo-600 dark:text-indigo-400">inventory_2</span>
                </div>
                <h2 class="text-lg font-black text-slate-900 dark:text-white">{{ $t('order_detail.product_info') }}</h2>
              </div>
              <div class="space-y-4">
                <div>
                  <h3 class="text-xl font-black text-slate-900 dark:text-white">{{ request.product_name }}</h3>
                  <p class="text-sm text-indigo-600 dark:text-indigo-400 font-bold mt-1">
                    {{ request.category }} <span v-if="request.sub_category"> > {{ request.sub_category }}</span>
                  </p>
                </div>
                <div class="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/60">
                  <h4 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">{{ $t('order_detail.desc_spec') }}</h4>
                  <p class="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed font-medium">{{ request.specifications || '-' }}</p>
                </div>
              </div>
            </div>

            <!-- Bagian 2: Kualitas & Sertifikasi -->
            <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80 dark:border-slate-800">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl flex items-center justify-center">
                  <span class="material-symbols-outlined text-indigo-600 dark:text-indigo-400">verified</span>
                </div>
                <h2 class="text-lg font-black text-slate-900 dark:text-white">{{ $t('order_detail.quality_cert') }}</h2>
              </div>
              <div class="space-y-4">
                <div>
                  <h4 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">{{ $t('order_detail.quality_reqs') }}</h4>
                  <div class="flex gap-2 items-start bg-emerald-50 dark:bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
                    <span class="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[18px] mt-0.5">task_alt</span>
                    <p class="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line font-medium">{{ request.quality_requirements || $t('order_detail.no_special_reqs') }}</p>
                  </div>
                </div>
                <div>
                  <h4 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">{{ $t('order_detail.cert_needed') }}</h4>
                  <div v-if="request.certifications" class="flex flex-wrap gap-2">
                    <span v-for="cert in request.certifications.split(',')" :key="cert" class="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-full border border-indigo-200 dark:border-indigo-900/50">
                      {{ cert.trim() }}
                    </span>
                  </div>
                  <p v-else class="text-sm text-slate-400 dark:text-slate-500 italic">{{ $t('order_detail.none') }}</p>
                </div>
              </div>
            </div>

            <!-- Bagian 3: Budget & Logistik -->
            <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80 dark:border-slate-800">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl flex items-center justify-center">
                  <span class="material-symbols-outlined text-indigo-600 dark:text-indigo-400">local_shipping</span>
                </div>
                <h2 class="text-lg font-black text-slate-900 dark:text-white">{{ $t('order_detail.budget_logistics') }}</h2>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div class="py-2 border-b border-slate-100 dark:border-slate-800 sm:border-0">
                  <span class="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{{ $t('order_detail.quantity') }}</span>
                  <span class="text-sm font-bold text-slate-900 dark:text-white">{{ request.quantity }} {{ request.unit || 'units' }}</span>
                </div>
                <div class="py-2 border-b border-slate-100 dark:border-slate-800 sm:border-0">
                  <span class="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{{ $t('order_detail.target_delivery') }}</span>
                  <span class="text-sm font-bold text-slate-900 dark:text-white">{{ request.delivery_timeline ? formatDate(request.delivery_timeline).split(',')[0] : '-' }}</span>
                </div>
                <div class="py-2 border-b border-slate-100 dark:border-slate-800 sm:border-0">
                  <span class="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{{ $t('order_detail.budget_range') }}</span>
                  <span class="text-sm font-black text-indigo-600 dark:text-indigo-400">{{ request.currency || 'USD' }} {{ request.budget_range }}</span>
                </div>
                <div class="py-2 border-b border-slate-100 dark:border-slate-800 sm:border-0">
                  <span class="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{{ $t('order_detail.shipping') }}</span>
                  <span class="text-sm font-bold text-slate-900 dark:text-white">{{ request.shipping_terms || '-' }}</span>
                </div>
                <div class="py-2 sm:col-span-2">
                  <span class="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{{ $t('order_detail.payment') }}</span>
                  <span class="text-sm font-bold text-slate-900 dark:text-white">{{ request.payment_terms || '-' }}</span>
                </div>
              </div>
            </div>

            <!-- Bagian 4: Lampiran -->
            <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80 dark:border-slate-800">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl flex items-center justify-center">
                  <span class="material-symbols-outlined text-indigo-600 dark:text-indigo-400">attach_file</span>
                </div>
                <h2 class="text-lg font-black text-slate-900 dark:text-white">
                  {{ request.image_urls && request.image_urls.length === 1 
                     ? $t('order_detail.attachments_count', { count: request.image_urls.length })
                     : $t('order_detail.attachments_count_plural', { count: request.image_urls ? request.image_urls.length : 0 }) }}
                </h2>
              </div>
              <div v-if="request.image_urls && request.image_urls.length > 0" class="flex flex-col gap-3">
                <template v-for="(file, idx) in request.image_urls" :key="idx">
                  <!-- Image Preview (inline thumbnail, click to open lightbox) -->
                  <div v-if="isImageFile(file)" @click="openAttachmentLightbox(idx)"
                       class="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 cursor-zoom-in group aspect-video">
                    <img :src="getMediaUrl(file)" :alt="file.split('/').pop()"
                         class="w-full h-full object-contain bg-slate-50 dark:bg-slate-900" />
                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center pointer-events-none">
                      <span class="material-symbols-outlined text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity drop-shadow">zoom_in</span>
                    </div>
                    <div class="absolute bottom-2 left-2 right-2 text-[11px] font-semibold text-white truncate opacity-90 drop-shadow">
                      {{ file.split('/').pop() }}
                    </div>
                  </div>
                  <!-- Non-Image File (PDF, doc, etc.) — keep icon + open in new tab -->
                  <a v-else :href="getMediaUrl(file)" target="_blank"
                     class="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                    <div class="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      <span class="material-symbols-outlined">{{ getFileIcon(file) }}</span>
                    </div>
                    <div class="flex-1 overflow-hidden">
                      <p class="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{{ file.split('/').pop() }}</p>
                      <p class="text-xs text-slate-400">{{ $t('order_detail.click_view') }}</p>
                    </div>
                    <span class="material-symbols-outlined text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">open_in_new</span>
                  </a>
                </template>
              </div>
              <!-- Image Lightbox (full-screen preview) -->
              <ImageLightbox
                v-if="lightboxOpen"
                v-model="lightboxOpen"
                :images="lightboxImages"
                :start-index="lightboxStartIndex"
              />
              <div v-else class="text-center py-6 text-slate-400 dark:text-slate-500 text-sm italic">
                {{ $t('order_detail.no_attachments') }}
              </div>
            </div>

            <!-- Negotiation Chat -->
            <div v-if="shouldShowChat">
              <ChatComponent :requestId="request.id" :isAdmin="true" />
            </div>

          </div>

          <!-- Right Column: Timeline & Actions -->
          <div class="space-y-4 sm:space-y-6">
            
            <!-- Admin Golden Path Actions -->
            <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80 dark:border-slate-800">
              <h3 class="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span class="material-symbols-outlined text-indigo-600 dark:text-indigo-400">admin_panel_settings</span>
                {{ $t('order_detail.admin_ops') }}
              </h3>
              <div class="space-y-3">

                <button v-if="request.status === 'menunggu_penawaran_admin'" @click="submitOpenDiscussion" :disabled="loadingAction" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white rounded-2xl transition-all font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/20 cursor-pointer disabled:opacity-50">
                  <span class="material-symbols-outlined text-lg">forum</span>
                  {{ $t('request_details.open_discussion') }}
                </button>

                <button v-if="request.status === 'menunggu_kesepakatan_final'" @click="openFinalizeModal" :disabled="loadingAction" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white rounded-2xl transition-all font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/20 cursor-pointer disabled:opacity-50">
                  <span class="material-symbols-outlined text-lg">gavel</span>
                  Finalisasi Kesepakatan & Kirim Tagihan
                </button>

                <div v-if="request.status === 'menunggu_verifikasi_pembayaran'" class="space-y-3">
                  <a v-if="request.payment_proof_url" :href="getMediaUrl(request.payment_proof_url)" target="_blank" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-2xl transition-colors font-bold text-xs sm:text-sm hover:bg-indigo-50 dark:hover:bg-indigo-950/40">
                    <span class="material-symbols-outlined text-lg">receipt_long</span>
                    Lihat Bukti Bayar Buyer
                  </a>
                  
                  <div class="grid grid-cols-2 gap-2">
                    <button @click="verifyPayment" :disabled="loadingAction" class="w-full flex items-center justify-center gap-1.5 px-3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl transition-colors font-bold text-xs cursor-pointer disabled:opacity-50">
                      <span class="material-symbols-outlined text-base">verified_user</span>
                      Setujui
                    </button>

                    <button @click="showRejectModal = true" :disabled="loadingAction" class="w-full flex items-center justify-center gap-1.5 px-3 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl transition-colors font-bold text-xs cursor-pointer disabled:opacity-50">
                      <span class="material-symbols-outlined text-base">cancel</span>
                      Tolak
                    </button>
                  </div>
                </div>

                <!-- Driver Assignment Section -->
                <div v-if="['menunggu_pembayaran', 'sedang_diproses', 'dikirim', 'menunggu_verifikasi_admin'].includes(request.status)" class="bg-gradient-to-br from-indigo-50/80 to-purple-50/40 dark:from-indigo-950/30 dark:to-purple-950/20 border border-indigo-200/60 dark:border-indigo-800/60 rounded-2xl p-4 space-y-3">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-lg text-indigo-600 dark:text-indigo-400">local_shipping</span>
                      <h4 class="text-xs font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">Driver Assignment</h4>
                    </div>
                  </div>

                  <!-- Currently assigned driver info -->
                  <div v-if="request.assigned_driver" class="flex items-center gap-3 p-3 bg-white/60 dark:bg-slate-900/60 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                    <div class="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <span class="material-symbols-outlined text-lg">person</span>
                    </div>
                    <div class="flex-1 overflow-hidden">
                      <p class="text-xs font-bold text-slate-900 dark:text-white truncate">{{ request.assigned_driver.name }}</p>
                      <p class="text-[10px] text-slate-500 dark:text-slate-400 truncate">{{ request.assigned_driver.email }}</p>
                    </div>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 uppercase">
                      {{ request.delivery_method === 'sea' ? 'Sea' : request.delivery_method === 'air' ? 'Air' : 'Trusted Provider' }}
                    </span>
                  </div>
                  <div v-else-if="request.delivery_method === 'trusted_provider'" class="flex items-center gap-3 p-3 bg-white/60 dark:bg-slate-900/60 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                    <div class="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                      <span class="material-symbols-outlined text-lg">verified_user</span>
                    </div>
                    <div class="flex-1">
                      <p class="text-xs font-bold text-slate-900 dark:text-white">Trusted Provider</p>
                      <p class="text-[10px] text-slate-500 dark:text-slate-400">Delivery handled by our trusted provider (no driver assigned)</p>
                    </div>
                  </div>

                  <!-- Driver selection form -->
                  <div class="space-y-2">
                    <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Delivery Method</label>
                    <div class="grid grid-cols-3 gap-2">
                      <label :class="['flex items-center justify-center gap-1.5 px-3 py-2 border rounded-xl cursor-pointer text-xs font-bold transition-all', driverForm.delivery_method === 'sea' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300']">
                        <input type="radio" v-model="driverForm.delivery_method" value="sea" class="sr-only" />
                        <span class="material-symbols-outlined text-base">directions_boat</span>
                        Sea
                      </label>
                      <label :class="['flex items-center justify-center gap-1.5 px-3 py-2 border rounded-xl cursor-pointer text-xs font-bold transition-all', driverForm.delivery_method === 'air' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300']">
                        <input type="radio" v-model="driverForm.delivery_method" value="air" class="sr-only" />
                        <span class="material-symbols-outlined text-base">flight</span>
                        Air
                      </label>
                      <label :class="['flex items-center justify-center gap-1.5 px-3 py-2 border rounded-xl cursor-pointer text-xs font-bold transition-all', driverForm.delivery_method === 'trusted_provider' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300']">
                        <input type="radio" v-model="driverForm.delivery_method" value="trusted_provider" class="sr-only" />
                        <span class="material-symbols-outlined text-base">verified_user</span>
                        Trusted
                      </label>
                    </div>

                    <div v-if="driverForm.delivery_method !== 'trusted_provider'">
                      <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Select Driver</label>
                      <select v-model="driverForm.assigned_driver_id" class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30">
                        <option value="">-- Select a driver --</option>
                        <option v-for="d in availableDrivers" :key="d.id" :value="d.id">{{ d.name }} ({{ d.email }})</option>
                      </select>
                      <p v-if="availableDrivers.length === 0" class="text-[10px] text-amber-600 dark:text-amber-400 mt-1">No active drivers available. Create one in the Drivers page or use "Trusted Provider".</p>
                    </div>

                    <button @click="assignDriver" :disabled="loadingDriver || (driverForm.delivery_method !== 'trusted_provider' && !driverForm.assigned_driver_id)" class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors font-bold text-xs cursor-pointer disabled:opacity-50">
                      <span v-if="loadingDriver" class="material-symbols-outlined animate-spin text-base">progress_activity</span>
                      <span v-else class="material-symbols-outlined text-base">local_shipping</span>
                      {{ request.assigned_driver_id || request.delivery_method === 'trusted_provider' ? 'Reassign Driver' : 'Assign Driver' }}
                    </button>
                  </div>
                </div>

                <button v-if="request.status === 'sedang_diproses'" @click="shipOrder" :disabled="loadingAction" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-2xl transition-colors font-bold text-xs sm:text-sm cursor-pointer disabled:opacity-50">
                  <span class="material-symbols-outlined text-lg">local_shipping</span>
                  Kirim Barang (Ship)
                </button>


                <div v-if="request.status === 'menunggu_verifikasi_admin'" class="space-y-3">
                  <div class="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-2xl border border-amber-200 dark:border-amber-900/50">
                    Buyer telah menekan tombol barang tiba. Pastikan Anda telah memeriksa dokumen Bill of Lading.
                  </div>
                  <button @click="completeOrder" :disabled="loadingAction" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl transition-colors font-bold text-xs sm:text-sm cursor-pointer disabled:opacity-50">
                    <span class="material-symbols-outlined text-lg">done_all</span>
                    Selesaikan Order
                  </button>
                </div>
                
                <div v-if="['selesai', 'batal', 'dispute', 'menunggu_pembayaran'].includes(request.status)" class="text-xs text-slate-400 italic text-center py-2">
                  {{ $t('order_detail.no_action_required') }}
                </div>

              </div>
            </div>

            <!-- Status Timeline -->
            <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80 dark:border-slate-800">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl flex items-center justify-center">
                  <span class="material-symbols-outlined text-indigo-600 dark:text-indigo-400">timeline</span>
                </div>
                <h2 class="text-lg font-black text-slate-900 dark:text-white">{{ $t('order_detail.status_timeline') }}</h2>
              </div>

              <div class="space-y-4">
                <div v-for="(log, idx) in trackingLogs" :key="log.id" class="flex gap-3">
                  <div class="flex flex-col items-center">
                    <div :class="['w-8 h-8 rounded-full flex items-center justify-center', idx === trackingLogs.length - 1 ? 'bg-indigo-600 ring-4 ring-indigo-500/20' : 'bg-emerald-500']">
                      <span v-if="idx === trackingLogs.length - 1" class="material-symbols-outlined text-white text-[16px]">radio_button_checked</span>
                      <span v-else class="material-symbols-outlined text-white text-[16px]">check</span>
                    </div>
                    <div v-if="idx < trackingLogs.length - 1" class="w-0.5 h-full bg-slate-200 dark:bg-slate-800 mt-2"></div>
                  </div>
                  <div class="flex-1 pb-4">
                    <p :class="['font-bold text-xs sm:text-sm', idx === trackingLogs.length - 1 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200']">
                      {{ statusLabel(log.status) }}
                    </p>
                    <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{{ formatDate(log.created_at) }}</p>
                    <p v-if="log.notes" class="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">{{ log.notes }}</p>
                  </div>
                </div>
                <div v-if="trackingLogs.length === 0" class="text-sm text-slate-400 dark:text-slate-500 italic">No timeline events yet.</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
    
    <!-- Finalize Deal & Send Invoice Modal -->
    <div v-if="showFinalizeModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">
        <div class="px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold">
              <span class="material-symbols-outlined text-xl">receipt_long</span>
            </div>
            <div>
              <h2 class="font-bold text-base sm:text-lg text-slate-900 dark:text-white">Finalisasi Kesepakatan & Kirim Tagihan</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">Atur harga final dan metode pembayaran untuk buyer</p>
            </div>
          </div>
          <button @click="showFinalizeModal = false" class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl cursor-pointer">
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div class="p-6 overflow-y-auto space-y-4 flex-1">
          <!-- Total Price Input -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Total Harga Final (USD) *</label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">USD</span>
              <input v-model="finalizeForm.final_price" type="number" step="0.01" class="w-full pl-14 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30" placeholder="e.g. 1500.00" />
            </div>
          </div>

          <!-- Bank Details -->
          <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <span class="material-symbols-outlined text-base">account_balance</span> Pengaturan Bank Transfer
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Nama Bank *</label>
                <input v-model="finalizeForm.bank_name" type="text" placeholder="e.g. Bank Mandiri / BCA" class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none" />
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Nomor Rekening *</label>
                <input v-model="finalizeForm.bank_account_number" type="text" placeholder="e.g. 1234567890" class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white outline-none" />
              </div>
              <div class="sm:col-span-2">
                <label class="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Atas Nama Rekening *</label>
                <input v-model="finalizeForm.bank_account_name" type="text" placeholder="e.g. PT AfriChina Bridge Indonesia" class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none" />
              </div>
            </div>
          </div>

          <!-- QR Code Upload -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Foto Kode QR Pembayaran (Optional)</label>
            <input type="file" ref="qrFileInput" accept="image/*" class="hidden" @change="handleQrSelect" />
            <div class="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors" @click="qrFileInput.click()">
              <img v-if="qrPreviewUrl" :src="qrPreviewUrl" class="w-12 h-12 object-cover rounded-xl border border-slate-300 dark:border-slate-600" />
              <div v-else class="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                <span class="material-symbols-outlined text-2xl">qr_code</span>
              </div>
              <div class="flex-1">
                <span class="text-xs font-bold text-slate-800 dark:text-white block">{{ qrFile ? qrFile.name : 'Klik untuk upload gambar QR Code (QRIS / AliPay)' }}</span>
                <span class="text-[10px] text-slate-400">Format: JPG, PNG, WEBP</span>
              </div>
            </div>
          </div>

          <!-- Admin Notes -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Catatan / Instruksi Pembayaran</label>
            <textarea v-model="finalizeForm.payment_notes" rows="2" class="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none" placeholder="Instruksi khusus untuk buyer (misal: mohon cantumkan kode unik transfer)..."></textarea>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex justify-end gap-3">
          <button @click="showFinalizeModal = false" class="px-4 py-2.5 text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs cursor-pointer">Batal</button>
          <button @click="submitFinalizeDeal" :disabled="loadingAction" class="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50">
            <span v-if="loadingAction" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
            <span v-else class="material-symbols-outlined text-sm">send</span>
            Kirim Tagihan Ke Buyer
          </button>
        </div>
      </div>
    </div>

    <!-- Reject Payment Proof Modal -->
    <div v-if="showRejectModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-6 animate-slide-up">
        <h3 class="text-base font-bold text-slate-900 dark:text-white mb-2">Tolak Bukti Pembayaran</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mb-4">Tuliskan alasan penolakan bukti pembayaran agar buyer dapat melakukan perbaikan.</p>
        
        <textarea v-model="rejectionReason" rows="3" class="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white mb-4 outline-none focus:ring-2 focus:ring-rose-500/30" placeholder="e.g. Nominal transfer tidak sesuai dengan invoice / Bukti transfer buram..."></textarea>

        <div class="flex gap-2 justify-end">
          <button @click="showRejectModal = false" class="px-4 py-2 text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs cursor-pointer">Batal</button>
          <button @click="submitRejectPayment" :disabled="!rejectionReason || loadingAction" class="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer">
            <span v-if="loadingAction" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
            <span>Tolak Pembayaran</span>
          </button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '../../components/LanguageSwitcher.vue'
import ChatComponent from '../../components/chat/ChatComponent.vue'
import AdminLayout from '../../components/layout/AdminLayout.vue'
import ImageLightbox from '../../components/ui/ImageLightbox.vue'
import { adminService } from '../../api/adminService.js'
import { requestService } from '../../api/requestService.js'
import { useToast } from '../../composables/useToast.js'
import { useConfirm } from '../../composables/useConfirm.js'

const { showToast } = useToast()
const { confirm } = useConfirm()

const router = useRouter()
const route = useRoute()

// State
const request = ref(null)
const trackingLogs = ref([])
const loading = ref(true)
const loadingAction = ref(false)
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
  'menunggu_kesepakatan_final',
  'menunggu_pembayaran',
  'menunggu_verifikasi_pembayaran',
  'sedang_diproses',
  'dikirim',
  'menunggu_verifikasi_admin',
  'selesai'
];

const { t, te } = useI18n();

// Safe status label: tries $t() first, falls back to raw string with prefix
const statusLabel = (status) => {
  if (!status) return '';
  const key = `status.${status.toLowerCase()}`;
  if (te(key)) return t(key);
  // Legacy fallback for stale statuses (e.g. menunggu_pilihan_buyer)
  return `${t('request_details.unknown_status')}: ${status}`;
};

const timelineStages = computed(() => {
  if (!request.value) return [];
  const currentIdx = Math.max(0, stages.indexOf(request.value.status));
  
  return [
    { value: 'menunggu_penawaran_admin', label: t('request_details.steps.rfq'), icon: 'edit_document', passed: currentIdx > 0, current: currentIdx === 0 },
    { value: 'menunggu_kesepakatan_final', label: t('request_details.steps.negotiate'), icon: 'forum', passed: currentIdx > 1, current: currentIdx === 1 },
    { value: 'menunggu_pembayaran', label: t('request_details.steps.payment'), icon: 'payments', passed: currentIdx > 2, current: currentIdx === 2 },
    { value: 'sedang_diproses', label: t('request_details.steps.process'), icon: 'conveyor_belt', passed: currentIdx > 4, current: currentIdx === 4 },
    { value: 'dikirim', label: t('request_details.steps.shipped'), icon: 'local_shipping', passed: currentIdx > 5, current: currentIdx === 5 },
    { value: 'selesai', label: t('request_details.steps.complete'), icon: 'task_alt', passed: currentIdx > 7, current: currentIdx === 7 }
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

const getFileIcon = (filename) => {
  if (!filename) return 'description';
  const ext = filename.split('.').pop().toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
  if (ext === 'pdf') return 'picture_as_pdf';
  if (['doc', 'docx'].includes(ext)) return 'description';
  return 'insert_drive_file';
}

const getStatusClass = (status) => {
  const classes = {
    'menunggu_penawaran_admin': 'bg-gray-500',
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

const shouldShowChat = computed(() => {
  if (!request.value) return false;
  if (request.value.status === 'batal') return false;
  return true; // Chat visible from RFQ submission through completion
});

const loadData = async () => {
  try {
    const reqId = route.params.id
    request.value = await adminService.getAdminRequestById(reqId)
    trackingLogs.value = await requestService.getTrackingLogs(reqId)
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
  loadAvailableDrivers()
})

// Watch for request load to refresh driver info in form
watch(request, (newReq) => {
  if (newReq) {
    // Pre-fill driver form with existing assignment if any
    if (newReq.delivery_method) {
      driverForm.value.delivery_method = newReq.delivery_method
    }
    if (newReq.assigned_driver_id) {
      driverForm.value.assigned_driver_id = newReq.assigned_driver_id
    }
  }
}, { deep: true })
onUnmounted(() => window.removeEventListener('resize', updateDeviceType))

// Finalize Deal & Payment Setup State
const showFinalizeModal = ref(false)
const showRejectModal = ref(false)
const rejectionReason = ref('')
const qrFile = ref(null)
const qrPreviewUrl = ref(null)
const qrFileInput = ref(null)

const finalizeForm = ref({
  final_price: '',
  bank_name: 'Bank Mandiri',
  bank_account_number: '123-00-9876543-1',
  bank_account_name: 'PT AfriChina Bridge Indonesia',
  payment_notes: ''
})

const getMediaUrl = (path) => {
  if (!path) return ''
  // Handle base64 data URLs (data:image/png;base64,...)
  if (path.startsWith('data:')) return path
  if (path.startsWith('http')) return path
  // Use relative path so it resolves through Vite dev server / Nginx proxy
  return path.startsWith('/') ? path : `/${path}`
}

// Lightbox state for full-screen image preview
const lightboxOpen = ref(false)
const lightboxStartIndex = ref(0)
const lightboxImages = computed(() => {
  if (!request.value || !Array.isArray(request.value.image_urls)) return []
  return request.value.image_urls
    .filter((f) => isImageFile(f))
    .map((f) => getMediaUrl(f))
    .filter(Boolean)
})

const openAttachmentLightbox = (idx) => {
  // Map attachment index → lightbox index (filter to images only)
  if (!request.value || !Array.isArray(request.value.image_urls)) return
  const imageIndices = request.value.image_urls
    .map((f, i) => (isImageFile(f) ? i : -1))
    .filter((i) => i !== -1)
  const target = imageIndices.indexOf(idx)
  if (target >= 0) {
    lightboxStartIndex.value = target
    lightboxOpen.value = true
  }
}

// Detect if attachment is an image (data URL or extension)
const isImageFile = (path) => {
  if (!path) return false
  if (path.startsWith('data:')) return path.startsWith('data:image/')
  const ext = (path.split('.').pop() || '').toLowerCase()
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)
}

const handleQrSelect = (e) => {
  const file = e.target.files[0]
  if (!file) return
  qrFile.value = file
  qrPreviewUrl.value = URL.createObjectURL(file)
}

const openFinalizeModal = () => {
  let calcPrice = request.value.final_price || request.value.quoted_price || ''

  finalizeForm.value.final_price = calcPrice
  showFinalizeModal.value = true
}

const submitOpenDiscussion = async () => {
  const ok = await confirm({
    title: t('confirm.open_discussion_title'),
    message: t('request_details.open_discussion_confirm'),
    type: 'warning',
    confirmText: t('confirm.yes_open'),
    cancelText: t('common.cancel')
  })
  if (!ok) return
  loadingAction.value = true
  try {
    await adminService.openDiscussion(request.value.id)
    showToast(t('request_details.discussion_opened'), 'success')
    await loadData()
  } catch (e) {
    showToast(e.response?.data?.message || t('common.unknownError'))
  } finally {
    loadingAction.value = false
  }
}

const submitFinalizeDeal = async () => {
  if (!finalizeForm.value.final_price) return showToast('Final price is required')
  if (!finalizeForm.value.bank_name) return showToast('Bank name is required')
  if (!finalizeForm.value.bank_account_number) return showToast('Account number is required')

  loadingAction.value = true
  try {
    const formData = new FormData()
    formData.append('final_price', finalizeForm.value.final_price)
    formData.append('bank_name', finalizeForm.value.bank_name)
    formData.append('bank_account_number', finalizeForm.value.bank_account_number)
    formData.append('bank_account_name', finalizeForm.value.bank_account_name)
    formData.append('payment_notes', finalizeForm.value.payment_notes)
    if (qrFile.value) {
      formData.append('payment_qr', qrFile.value)
    }

    await adminService.finalizeDeal(request.value.id, formData)
    showToast('Kesepakatan difinalisasi & invoice terkirim ke Buyer!', 'success')
    showFinalizeModal.value = false
    await loadData()
  } catch (e) {
    showToast(e.response?.data?.message || 'Failed to finalize deal')
  } finally {
    loadingAction.value = false
  }
}

const verifyPayment = async () => {
  const ok = await confirm({
    title: t('confirm.verify_payment_title'),
    message: t('confirm.verify_payment_message'),
    type: 'info',
    confirmText: t('confirm.yes_verify'),
    cancelText: t('common.cancel')
  })
  if (!ok) return
  loadingAction.value = true
  try {
    await adminService.verifyPayment(request.value.id)
    showToast(t('request_details.payment_verified'), 'success')
    await loadData()
  } catch (e) {
    showToast(e.response?.data?.message || t('common.unknownError'))
  } finally {
    loadingAction.value = false
  }
}

const submitRejectPayment = async () => {
  if (!rejectionReason.value.trim()) return showToast('Rejection reason is required')
  loadingAction.value = true
  try {
    await adminService.rejectPayment(request.value.id, rejectionReason.value)
    showToast('Bukti pembayaran ditolak', 'info')
    showRejectModal.value = false
    rejectionReason.value = ''
    await loadData()
  } catch (e) {
    showToast(e.response?.data?.message || 'Failed to reject payment')
  } finally {
    loadingAction.value = false
  }
}

const shipOrder = async () => {
  loadingAction.value = true;
  try {
    await adminService.shipOrder(request.value.id);
    await loadData();
  } catch (e) {
    showToast(e.response?.data?.message || 'Failed');
  } finally {
    loadingAction.value = false;
  }
}

const completeOrder = async () => {
  const ok = await confirm({
    title: t('confirm.complete_order_title'),
    message: t('confirm.complete_order_message'),
    type: 'warning',
    confirmText: t('confirm.yes_complete'),
    cancelText: t('common.cancel')
  });
  if (!ok) return;
  loadingAction.value = true;
  try {
    await adminService.completeOrder(request.value.id);
    showToast(t('common.success'), 'success');
    await loadData();
  } catch (e) {
    showToast(e.response?.data?.message || t('common.unknownError'));
  } finally {
    loadingAction.value = false;
  }
}


// [NEW Driver Role] Driver Assignment
const driverForm = ref({
  delivery_method: 'sea',
  assigned_driver_id: ''
})
const availableDrivers = ref([])
const loadingDriver = ref(false)

const loadAvailableDrivers = async () => {
  try {
    availableDrivers.value = await adminService.getAvailableDrivers()
  } catch (e) {
    console.error('Failed to load drivers:', e)
  }
}

const assignDriver = async () => {
  if (driverForm.value.delivery_method !== 'trusted_provider' && !driverForm.value.assigned_driver_id) {
    return showToast(t('validation.driver_required'), 'error')
  }
  const isTrustedProvider = driverForm.value.delivery_method === 'trusted_provider'
  const ok = await confirm({
    title: t('confirm.assign_driver_title'),
    message: isTrustedProvider
      ? t('confirm.assign_driver_trusted')
      : t('confirm.assign_driver_assigned'),
    type: 'warning',
    confirmText: t('confirm.yes_assign'),
    cancelText: t('common.cancel')
  })
  if (!ok) return
  loadingDriver.value = true
  try {
    const payload = {
      delivery_method: driverForm.value.delivery_method,
      assigned_driver_id: isTrustedProvider ? null : driverForm.value.assigned_driver_id
    }
    await adminService.assignDriver(request.value.id, payload)
    // Refresh full request to get assigned_driver nested object
    await loadData()
    showToast(isTrustedProvider
      ? t('request_details.trusted_provider_assigned')
      : t('request_details.driver_assigned'), 'success')
  } catch (e) {
    showToast(e.response?.data?.message || t('common.unknownError'), 'error')
  } finally {
    loadingDriver.value = false
  }
}

const goBack = () => router.back()
const navigate = (r) => { activeRoute.value = r; if (r === 'dashboard') router.push('/admin/dashboard') }
</script>

<template>
  <AdminLayout>

    <main class="flex-1 p-10 max-w-[1600px] mx-auto space-y-10">
      
      <!-- Header Area inside Main -->
      <header class="flex justify-between items-end gap-6 mb-8">
        <div>
         <button @click="goBack" class="flex items-center gap-2 text-[#4f378a] dark:text-white hover:underline mb-2 font-semibold transition-colors duration-200">
  <span class="material-symbols-outlined text-[#4f378a] dark:text-white">arrow_back</span>
  Back
</button>
<h2 class="text-[40px] leading-[1.1] tracking-[-0.02em] font-extrabold text-slate-900 dark:text-white">Request Detail</h2>
<p class="text-[16px] leading-[1.6] font-normal text-[#494551] dark:text-white">Manage options and timeline</p>
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
              {{ request.status.replace(/_/g, ' ').toUpperCase() }}
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
                <h2 class="text-lg font-black text-slate-900 dark:text-white">Buyer Information</h2>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p class="text-xs text-slate-400 dark:text-slate-500 font-semibold mb-1">Name</p>
                  <p class="font-bold text-sm text-slate-900 dark:text-white">{{ request.buyer_name }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-400 dark:text-slate-500 font-semibold mb-1">Company</p>
                  <p class="font-bold text-sm text-slate-900 dark:text-white">{{ request.buyer_company }}</p>
                </div>
                <div class="sm:col-span-2">
                  <p class="text-xs text-slate-400 dark:text-slate-500 font-semibold mb-1">Email</p>
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
                <h2 class="text-lg font-black text-slate-900 dark:text-white">INFORMASI PRODUK</h2>
              </div>
              <div class="space-y-4">
                <div>
                  <h3 class="text-xl font-black text-slate-900 dark:text-white">{{ request.product_name }}</h3>
                  <p class="text-sm text-indigo-600 dark:text-indigo-400 font-bold mt-1">
                    {{ request.category }} <span v-if="request.sub_category"> > {{ request.sub_category }}</span>
                  </p>
                </div>
                <div class="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/60">
                  <h4 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Deskripsi & Spesifikasi Teknis:</h4>
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
                <h2 class="text-lg font-black text-slate-900 dark:text-white">KUALITAS & SERTIFIKASI</h2>
              </div>
              <div class="space-y-4">
                <div>
                  <h4 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Persyaratan Kualitas:</h4>
                  <div class="flex gap-2 items-start bg-emerald-50 dark:bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
                    <span class="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[18px] mt-0.5">task_alt</span>
                    <p class="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line font-medium">{{ request.quality_requirements || 'Tidak ada persyaratan khusus' }}</p>
                  </div>
                </div>
                <div>
                  <h4 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Sertifikasi Dibutuhkan:</h4>
                  <div v-if="request.certifications" class="flex flex-wrap gap-2">
                    <span v-for="cert in request.certifications.split(',')" :key="cert" class="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-full border border-indigo-200 dark:border-indigo-900/50">
                      {{ cert.trim() }}
                    </span>
                  </div>
                  <p v-else class="text-sm text-slate-400 dark:text-slate-500 italic">Tidak ada</p>
                </div>
              </div>
            </div>

            <!-- Bagian 3: Budget & Logistik -->
            <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80 dark:border-slate-800">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl flex items-center justify-center">
                  <span class="material-symbols-outlined text-indigo-600 dark:text-indigo-400">local_shipping</span>
                </div>
                <h2 class="text-lg font-black text-slate-900 dark:text-white">BUDGET & LOGISTIK</h2>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div class="py-2 border-b border-slate-100 dark:border-slate-800 sm:border-0">
                  <span class="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Quantity</span>
                  <span class="text-sm font-bold text-slate-900 dark:text-white">{{ request.quantity }} {{ request.unit || 'units' }}</span>
                </div>
                <div class="py-2 border-b border-slate-100 dark:border-slate-800 sm:border-0">
                  <span class="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Target Delivery</span>
                  <span class="text-sm font-bold text-slate-900 dark:text-white">{{ request.delivery_timeline ? formatDate(request.delivery_timeline).split(',')[0] : '-' }}</span>
                </div>
                <div class="py-2 border-b border-slate-100 dark:border-slate-800 sm:border-0">
                  <span class="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Budget Range</span>
                  <span class="text-sm font-black text-indigo-600 dark:text-indigo-400">{{ request.currency || 'USD' }} {{ request.budget_range }}</span>
                </div>
                <div class="py-2 border-b border-slate-100 dark:border-slate-800 sm:border-0">
                  <span class="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Shipping</span>
                  <span class="text-sm font-bold text-slate-900 dark:text-white">{{ request.shipping_terms || '-' }}</span>
                </div>
                <div class="py-2 sm:col-span-2">
                  <span class="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Payment</span>
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
                <h2 class="text-lg font-black text-slate-900 dark:text-white">LAMPIRAN ({{ request.image_urls ? request.image_urls.length : 0 }} file)</h2>
              </div>
              <div v-if="request.image_urls && request.image_urls.length > 0" class="flex flex-col gap-3">
                <a v-for="(file, idx) in request.image_urls" :key="idx" :href="getMediaUrl(file)" target="_blank" class="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                  <div class="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    <span class="material-symbols-outlined">{{ getFileIcon(file) }}</span>
                  </div>
                  <div class="flex-1 overflow-hidden">
                    <p class="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{{ file.split('/').pop() }}</p>
                    <p class="text-xs text-slate-400">Click to view</p>
                  </div>
                  <span class="material-symbols-outlined text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">open_in_new</span>
                </a>
              </div>
              <div v-else class="text-center py-6 text-slate-400 dark:text-slate-500 text-sm italic">
                Tidak ada lampiran
              </div>
            </div>

            <!-- Product Options -->
            <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80 dark:border-slate-800">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl flex items-center justify-center">
                    <span class="material-symbols-outlined text-indigo-600 dark:text-indigo-400">list_alt</span>
                  </div>
                  <h2 class="text-lg font-black text-slate-900 dark:text-white">Product Options</h2>
                </div>
                <button v-if="['menunggu_penawaran_admin', 'menunggu_pemilihan_buyer'].includes(request.status)" @click="showOptionsModal = true" class="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer">
                  <span class="material-symbols-outlined text-base">add</span> + Add Option
                </button>
              </div>
              
              <div v-if="request.options && request.options.length > 0" class="space-y-4">
                <div v-for="opt in request.options" :key="opt.id" class="border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/60 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 relative" :class="{'ring-2 ring-indigo-600 dark:ring-indigo-500': request.selected_option_id === opt.id}">
                  <div v-if="getOptionImages(opt).length > 0" class="w-full sm:w-32 h-32 relative shrink-0 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                    <img :src="getOptionImages(opt)[0]" class="w-full h-full object-cover absolute inset-0" alt="Product Option" />
                    <div v-if="getOptionImages(opt).length > 1" class="absolute bottom-1 right-1 z-20 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-xs">
                      +{{ getOptionImages(opt).length - 1 }}
                    </div>
                  </div>
                  <div v-else class="w-full sm:w-32 h-32 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                    <span class="material-symbols-outlined text-3xl mb-0.5">inventory_2</span>
                    <span class="text-[10px] font-medium">No Image</span>
                  </div>
                  <div class="flex-1">
                    <div class="flex justify-between items-start mb-2">
                      <h3 class="font-bold text-slate-900 dark:text-white text-base">{{ opt.product_name }}</h3>
                      <div class="flex items-center gap-2">
                        <span v-if="request.selected_option_id === opt.id" class="px-2.5 py-1 bg-indigo-600 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs">
                          <span class="material-symbols-outlined text-[14px]">check_circle</span> Selected by Buyer
                        </span>
                        <div v-if="request.status === 'menunggu_pemilihan_buyer'" class="flex items-center gap-1">
                          <button @click="editSavedOption(opt)" class="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-xl transition-colors cursor-pointer" title="Edit Option">
                            <span class="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button @click="deleteSavedOption(opt.id)" class="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl transition-colors cursor-pointer" title="Delete Option">
                            <span class="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    <p v-if="opt.description" class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">{{ opt.description }}</p>
                    
                    <div class="bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 rounded-2xl p-3.5 mb-3">
                      <div class="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-extrabold text-xs mb-1">
                        <span class="material-symbols-outlined text-base">stars</span> Admin's Recommendation
                      </div>
                      <p class="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">{{ opt.admin_reason }}</p>
                    </div>
                    
                    <div class="flex flex-wrap gap-x-6 gap-y-2 text-xs sm:text-sm">
                      <div>
                        <span class="text-slate-400 dark:text-slate-500 font-bold text-[11px] uppercase tracking-wider block mb-0.5">Price</span>
                        <span class="font-black text-indigo-600 dark:text-indigo-400">
                          {{ opt.is_fixed_price ? 'USD ' + opt.price_min + ' (Fixed)' : 'USD ' + opt.price_min + ' - ' + opt.price_max + ' (Range)' }}
                        </span>
                      </div>
                      <div v-if="opt.target_delivery">
                        <span class="text-slate-400 dark:text-slate-500 font-bold text-[11px] uppercase tracking-wider block mb-0.5">Target</span>
                        <span class="font-bold text-slate-800 dark:text-slate-200">{{ formatDate(opt.target_delivery).split(',')[0] }}</span>
                      </div>
                      <div v-if="opt.shipping_method">
                        <span class="text-slate-400 dark:text-slate-500 font-bold text-[11px] uppercase tracking-wider block mb-0.5">Shipping</span>
                        <div class="flex items-center gap-3">
                          <span v-if="['sea', 'both'].includes(opt.shipping_method)" class="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1"><span class="material-symbols-outlined text-base text-blue-500">directions_boat</span> {{ opt.est_time_sea }}</span>
                          <span v-if="['air', 'both'].includes(opt.shipping_method)" class="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1"><span class="material-symbols-outlined text-base text-cyan-500">flight</span> {{ opt.est_time_air }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-6 text-slate-400 dark:text-slate-500 text-sm">
                No options added yet. Please source from suppliers and add options for the buyer.
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
                Admin Operations
              </h3>
              <div class="space-y-3">
                
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
                
                <div v-if="['selesai', 'batal', 'dispute', 'menunggu_penawaran_admin', 'menunggu_pemilihan_buyer', 'menunggu_pembayaran'].includes(request.status)" class="text-xs text-slate-400 italic text-center py-2">
                  No action required at this stage or waiting for buyer.
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
                      {{ log.status.replace(/_/g, ' ').toUpperCase() }}
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
    
    <!-- Options Upload Modal / Editor -->
    <div v-if="showOptionsModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">
        <div class="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">{{ editingOptionId ? 'Edit Saved Option' : 'Add Product Options' }}</h2>
          <button @click="closeOptionsModal" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto flex-1 bg-slate-50/30 dark:bg-slate-950/20 space-y-5">

          <!-- Pending Options List -->
          <div v-if="pendingOptions.length > 0 && !editingOptionId" class="space-y-3 mb-6 border-b border-slate-200 dark:border-slate-800 pb-6">
            <h3 class="text-sm font-bold text-slate-700 dark:text-slate-300">Options to Save ({{ pendingOptions.length }})</h3>
            <div v-for="(opt, idx) in pendingOptions" :key="idx" 
                 @click="editPendingOption(idx)"
                 class="flex gap-4 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-indigo-500/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group relative">
              
              <div class="w-16 h-16 relative shrink-0">
                <div v-for="(preview, i) in opt.photoPreviews" :key="i"
                     class="absolute inset-0 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                     :style="{ zIndex: opt.photoPreviews.length - i, transform: i > 0 ? `translate(${i * 2}px, ${i * 2}px) rotate(${i}deg)` : '' }">
                  <img :src="preview" class="w-full h-full object-cover" />
                </div>
                <div v-if="opt.photoPreviews.length > 1" class="absolute bottom-0 right-0 z-50 bg-black/70 text-white text-[9px] font-bold px-1 py-0.5 rounded-xs">
                  +{{ opt.photoPreviews.length - 1 }}
                </div>
              </div>

              <div class="flex-1 min-w-0">
                <p class="font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{{ opt.data.product_name }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ opt.data.description || 'No description' }}</p>
                <p class="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-1">{{ opt.data.is_fixed_price ? 'Fixed: USD ' + opt.data.price_min : 'Range: USD ' + opt.data.price_min + ' - ' + opt.data.price_max }}</p>
              </div>
              <div class="flex flex-col gap-2 shrink-0 self-start">
                <button @click.stop="removePendingOption(idx)" class="text-slate-400 hover:text-rose-600 transition-colors bg-white dark:bg-slate-800 rounded-full p-1 shadow-xs border border-slate-200 dark:border-slate-700">
                  <span class="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
              <div class="absolute inset-0 rounded-2xl ring-2 ring-indigo-600 dark:ring-indigo-400 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"></div>
            </div>
          </div>

          <h3 class="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-2">{{ pendingOptions.length > 0 && !editingOptionId ? 'Add Another Option' : 'New Option Details' }}</h3>
          
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Option Name *</label>
            <input v-model="newOption.product_name" type="text" class="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30" placeholder="e.g. Premium Solar Panel 500W">
          </div>
          
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Description</label>
            <textarea v-model="newOption.description" rows="2" class="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30" placeholder="Brand, specs, materials..."></textarea>
          </div>
          
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Product Photos (Max 5) *</label>
            <div class="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer" @click="triggerPhotoUpload" @dragover.prevent @drop.prevent="handlePhotoDrop">
              <input type="file" ref="photoInput" class="hidden" accept="image/jpeg, image/png, image/webp" multiple @change="handlePhotoSelect" />
              <div v-if="newOptionPhotoPreviews.length > 0" class="flex flex-wrap gap-2 justify-center">
                <div v-for="(preview, idx) in newOptionPhotoPreviews" :key="idx" class="relative">
                  <img :src="preview" class="h-24 w-24 object-cover rounded-xl shadow-xs border border-slate-200 dark:border-slate-700" />
                  <button @click.stop="removeNewOptionPhoto(idx)" class="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-0.5 hover:bg-rose-700 shadow-md cursor-pointer">
                    <span class="material-symbols-outlined text-[14px] block">close</span>
                  </button>
                </div>
                <div v-if="newOptionPhotoPreviews.length < 5" class="h-24 w-24 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <span class="material-symbols-outlined">add</span>
                </div>
              </div>
              <div v-else class="text-slate-400 dark:text-slate-500">
                <span class="material-symbols-outlined text-4xl mb-2 text-indigo-600 dark:text-indigo-400">add_photo_alternate</span>
                <p class="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">Drag & drop images here or click to upload</p>
                <p class="text-[11px] mt-1 text-slate-400 dark:text-slate-500">Format: JPG, PNG, WEBP. Max 5MB per photo.</p>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Admin's Recommendation Reason *</label>
            <textarea v-model="newOption.admin_reason" rows="2" class="w-full px-4 py-2.5 border border-amber-300 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/30 font-medium" placeholder="Why should the buyer choose this option?"></textarea>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Pricing Type</label>
              <div class="flex gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" v-model="newOption.is_fixed_price" :value="true" class="text-indigo-600 focus:ring-indigo-500" />
                  <span class="text-xs font-bold text-slate-800 dark:text-slate-200">Fixed Price</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" v-model="newOption.is_fixed_price" :value="false" class="text-indigo-600 focus:ring-indigo-500" />
                  <span class="text-xs font-bold text-slate-800 dark:text-slate-200">Price Range</span>
                </label>
              </div>
              <div class="flex gap-2 pt-1">
                <div class="flex-1">
                  <input v-model="newOption.price_min" type="number" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white rounded-xl outline-none" :placeholder="newOption.is_fixed_price ? 'Price (USD)' : 'Min (USD)'">
                </div>
                <div class="flex-1" v-if="!newOption.is_fixed_price">
                  <input v-model="newOption.price_max" type="number" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white rounded-xl outline-none" placeholder="Max (USD)">
                </div>
              </div>
            </div>

            <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Target Delivery</label>
              <input v-model="newOption.target_delivery" type="date" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white rounded-xl outline-none mb-2">
              
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Shipping Method</label>
              <div class="flex gap-4">
                <label class="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" v-model="newOption.shipping_method" value="sea" class="text-indigo-600 focus:ring-indigo-500" /> <span class="text-xs font-bold text-slate-800 dark:text-slate-200">Sea</span>
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" v-model="newOption.shipping_method" value="air" class="text-indigo-600 focus:ring-indigo-500" /> <span class="text-xs font-bold text-slate-800 dark:text-slate-200">Air</span>
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" v-model="newOption.shipping_method" value="both" class="text-indigo-600 focus:ring-indigo-500" /> <span class="text-xs font-bold text-slate-800 dark:text-slate-200">Both</span>
                </label>
              </div>
              <div class="space-y-2 pt-1">
                <div v-if="['sea', 'both'].includes(newOption.shipping_method)">
                  <input v-model="newOption.est_time_sea" type="text" class="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl outline-none" placeholder="Est. Sea (e.g. 25-35 days)">
                </div>
                <div v-if="['air', 'both'].includes(newOption.shipping_method)">
                  <input v-model="newOption.est_time_air" type="text" class="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl outline-none" placeholder="Est. Air (e.g. 5-7 days)">
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800 mt-6">
            <div class="flex justify-end gap-3">
              <button @click="closeOptionsModal" class="px-5 py-2.5 text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-xs cursor-pointer">Cancel</button>
              <button v-if="editingOptionId" @click="updateSavedOption" :disabled="uploadingOption" class="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 text-xs cursor-pointer">
                <span v-if="uploadingOption" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                {{ uploadingOption ? 'Updating...' : 'Update Option' }}
              </button>
              <button v-else @click="addToPending" class="px-5 py-2.5 border border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 font-bold rounded-xl transition-all flex items-center gap-2 text-xs cursor-pointer">
                <span class="material-symbols-outlined text-sm">add</span> Add to List
              </button>
            </div>
          </div>
          
          <div v-if="!editingOptionId" class="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 rounded-2xl flex justify-between items-center">
            <div class="text-xs font-bold text-slate-600 dark:text-slate-400">Total Options: <span class="text-indigo-600 dark:text-indigo-400 text-base font-black">{{ pendingOptions.length }}</span></div>
            <div class="flex gap-3">
              <button @click="closeOptionsModal" class="px-4 py-2 text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-xs cursor-pointer">Cancel</button>
              <button @click="submitAllOptions" :disabled="uploadingOption" class="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 text-xs cursor-pointer">
                <span v-if="uploadingOption" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                {{ uploadingOption ? 'Saving...' : 'Save All Options' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

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
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import LanguageSwitcher from '../../components/LanguageSwitcher.vue'
import ChatComponent from '../../components/chat/ChatComponent.vue'
import AdminLayout from '../../components/layout/AdminLayout.vue'
import { adminService } from '../../api/adminService.js'
import { requestService } from '../../api/requestService.js'
import { useToast } from '../../composables/useToast.js'

const { showToast } = useToast()

const router = useRouter()
const route = useRoute()

// State
const request = ref(null)
const trackingLogs = ref([])
const loading = ref(true)
const loadingAction = ref(false)
const showOptionsModal = ref(false)
const uploadingOption = ref(false)
const pendingOptions = ref([])
const editingOptionId = ref(null)

const getResetOption = () => ({
  product_name: '', description: '', admin_reason: '', 
  is_fixed_price: false, price_min: '', price_max: '', 
  target_delivery: '', shipping_method: 'sea', 
  est_time_sea: '', est_time_air: '' 
})

const newOption = ref(getResetOption())
const newOptionPhotos = ref([])
const newOptionPhotoPreviews = ref([])
const photoInput = ref(null)

const closeOptionsModal = () => {
  showOptionsModal.value = false;
  editingOptionId.value = null;
  newOption.value = getResetOption();
  newOptionPhotos.value = [];
  newOptionPhotoPreviews.value = [];
}

const triggerPhotoUpload = () => { photoInput.value?.click() }

const processPhotos = (files) => {
  const allowedSlots = 5 - newOptionPhotos.value.length;
  const filesToProcess = Array.from(files).slice(0, allowedSlots);
  
  for (const file of filesToProcess) {
    if (file.size > 5 * 1024 * 1024) {
      showToast('Max 5MB per photo');
      continue;
    }
    newOptionPhotos.value.push(file);
    const reader = new FileReader();
    reader.onload = (e) => newOptionPhotoPreviews.value.push(e.target.result);
    reader.readAsDataURL(file);
  }
}

const removeNewOptionPhoto = (idx) => {
  newOptionPhotos.value.splice(idx, 1);
  newOptionPhotoPreviews.value.splice(idx, 1);
}

const handlePhotoSelect = (e) => {
  if (e.target.files.length) processPhotos(e.target.files)
  e.target.value = ''; // Reset input so same file can be selected again
}
const handlePhotoDrop = (e) => {
  if (e.dataTransfer.files.length) processPhotos(e.dataTransfer.files)
}

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
  let raw = opt.images || opt.image_url
  if (!raw) return []
  if (typeof raw === 'string') {
    if (raw.startsWith('[')) {
      try { raw = JSON.parse(raw) } catch (e) { raw = [raw] }
    } else {
      raw = [raw]
    }
  }
  if (!Array.isArray(raw)) raw = [raw]
  return raw.map(img => {
    if (!img) return ''
    if (typeof img !== 'string') return ''
    if (img.startsWith('http')) return img
    return `${window.location.protocol}//${window.location.hostname}:5000${img.startsWith('/') ? '' : '/'}${img}`
  }).filter(Boolean)
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

const shouldShowChat = computed(() => {
  if (!request.value) return false;
  const idx = stages.indexOf(request.value.status);
  return idx >= 2 && request.value.status !== 'batal'; // Show from 'menunggu_kesepakatan_final'
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
})
onUnmounted(() => window.removeEventListener('resize', updateDeviceType))

const addToPending = () => {
  if (!newOption.value.product_name) return showToast('Product name is required');
  if (!newOption.value.admin_reason) return showToast('Admin reason is required');
  if (newOptionPhotos.value.length === 0) return showToast('At least one product photo is required');
  
  pendingOptions.value.push({
    data: { ...newOption.value },
    photos: [...newOptionPhotos.value],
    photoPreviews: [...newOptionPhotoPreviews.value]
  });
  newOption.value = getResetOption();
  newOptionPhotos.value = [];
  newOptionPhotoPreviews.value = [];
}

const removePendingOption = (idx) => {
  pendingOptions.value.splice(idx, 1);
}

const editPendingOption = (idx) => {
  const opt = pendingOptions.value[idx];
  // If current form has unsaved data, push it to pending first (auto-save current work)
  if (hasActiveFormData.value) {
    addToPending();
  }
  // Load the clicked option into the form
  newOptionPhotos.value = [...opt.photos];
  newOptionPhotoPreviews.value = [...opt.photoPreviews];
  // Remove from pending list since it's now being edited
  pendingOptions.value.splice(idx, 1);
}

const hasActiveFormData = computed(() => {
  return newOption.value.product_name !== '' || newOptionPhotos.value.length > 0;
});

const submitAllOptions = async () => {
  // If there is active form data not added to list yet, auto-add it
  if (hasActiveFormData.value) {
    if (!newOption.value.product_name) return showToast('Product name is required for the active form');
    if (!newOption.value.admin_reason) return showToast('Admin reason is required for the active form');
    if (newOptionPhotos.value.length === 0) return showToast('At least one product photo is required for the active form');
    
    pendingOptions.value.push({
      data: { ...newOption.value },
      photos: [...newOptionPhotos.value],
      photoPreviews: [...newOptionPhotoPreviews.value]
    });
    newOption.value = getResetOption();
    newOptionPhotos.value = [];
    newOptionPhotoPreviews.value = [];
  }

  if (pendingOptions.value.length === 0) return showToast('No options to save');
  uploadingOption.value = true;
  try {
    for (const opt of pendingOptions.value) {
      const formData = new FormData();
      formData.append('product_name', opt.data.product_name);
      formData.append('description', opt.data.description);
      formData.append('price_min', opt.data.price_min);
      formData.append('price_max', opt.data.price_max);
      formData.append('admin_reason', opt.data.admin_reason);
      formData.append('target_delivery', opt.data.target_delivery);
      formData.append('shipping_method', opt.data.shipping_method);
      formData.append('est_time_sea', opt.data.est_time_sea);
      formData.append('est_time_air', opt.data.est_time_air);
      formData.append('is_fixed_price', opt.data.is_fixed_price);
      for (const photo of opt.photos) {
        formData.append('images', photo);
      }
      await adminService.uploadOptions(request.value.id, formData);
    }
    showOptionsModal.value = false;
    pendingOptions.value = [];
    newOption.value = getResetOption();
    await loadData();
  } catch (e) {
    showToast(e.response?.data?.message || 'Failed to save all options');
  } finally {
    uploadingOption.value = false;
  }
}

const editSavedOption = (opt) => {
  editingOptionId.value = opt.id;
  newOption.value = {
    product_name: opt.product_name || '',
    description: opt.description || '',
    admin_reason: opt.admin_reason || '',
    is_fixed_price: opt.is_fixed_price || false,
    price_min: opt.price_min || '',
    price_max: opt.price_max || '',
    target_delivery: opt.target_delivery ? opt.target_delivery.split('T')[0] : '',
    shipping_method: opt.shipping_method || 'sea',
    est_time_sea: opt.est_time_sea || '',
    est_time_air: opt.est_time_air || ''
  };
  newOptionPhotos.value = [];
  newOptionPhotoPreviews.value = [];
  showOptionsModal.value = true;
}

const updateSavedOption = async () => {
  if (!newOption.value.product_name) return showToast('Product name is required');
  if (!newOption.value.admin_reason) return showToast('Admin reason is required');
  
  uploadingOption.value = true;
  try {
    const formData = new FormData();
    formData.append('product_name', newOption.value.product_name);
    formData.append('description', newOption.value.description);
    formData.append('price_min', newOption.value.price_min);
    formData.append('price_max', newOption.value.price_max);
    formData.append('admin_reason', newOption.value.admin_reason);
    formData.append('target_delivery', newOption.value.target_delivery);
    formData.append('shipping_method', newOption.value.shipping_method);
    formData.append('est_time_sea', newOption.value.est_time_sea);
    formData.append('est_time_air', newOption.value.est_time_air);
    formData.append('is_fixed_price', newOption.value.is_fixed_price);
    
    for (const photo of newOptionPhotos.value) {
      formData.append('images', photo);
    }
    
    await adminService.updateOption(request.value.id, editingOptionId.value, formData);
    showToast('Option updated successfully', 'success');
    closeOptionsModal();
    await loadData();
  } catch (e) {
    showToast(e.response?.data?.message || 'Failed to update option');
  } finally {
    uploadingOption.value = false;
  }
}

const deleteSavedOption = async (optionId) => {
  if (!confirm('Are you sure you want to delete this option?')) return;
  try {
    await adminService.deleteOption(request.value.id, optionId);
    showToast('Option deleted successfully', 'success');
    await loadData();
  } catch (e) {
    showToast(e.response?.data?.message || 'Failed to delete option');
  }
}

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
  if (path.startsWith('http')) return path
  const backendUrl = window.location.origin.replace('5173', '5000')
  return `${backendUrl}${path.startsWith('/') ? '' : '/'}${path}`
}

const handleQrSelect = (e) => {
  const file = e.target.files[0]
  if (!file) return
  qrFile.value = file
  qrPreviewUrl.value = URL.createObjectURL(file)
}

const openFinalizeModal = () => {
  let calcPrice = request.value.final_price || request.value.quoted_price || ''
  if (!calcPrice && request.value.options && request.value.options.length > 0) {
    const selected = request.value.options.filter(o => o.is_selected)
    const optionsToSum = selected.length > 0 ? selected : request.value.options
    calcPrice = optionsToSum.reduce((sum, o) => sum + (parseFloat(o.price_min) || 0), 0)
  }
  
  finalizeForm.value.final_price = calcPrice
  showFinalizeModal.value = true
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
  if (!confirm('Verifikasi dan setujui bukti pembayaran ini?')) return
  loadingAction.value = true
  try {
    await adminService.verifyPayment(request.value.id)
    showToast('Pembayaran berhasil diverifikasi!', 'success')
    await loadData()
  } catch (e) {
    showToast(e.response?.data?.message || 'Failed to verify payment')
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
  if(!confirm('Selesaikan pesanan? (Sudah verifikasi B/L dan penerimaan?)')) return;
  loadingAction.value = true;
  try {
    await adminService.completeOrder(request.value.id);
    await loadData();
  } catch (e) {
    showToast(e.response?.data?.message || 'Failed');
  } finally {
    loadingAction.value = false;
  }
}

const goBack = () => router.back()
const navigate = (r) => { activeRoute.value = r; if (r === 'dashboard') router.push('/admin/dashboard') }
</script>

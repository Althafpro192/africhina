<template>
  <AdminLayout>

    <main class="flex-1 p-10 max-w-[1600px] mx-auto space-y-10">
      
      <!-- Header Area inside Main -->
      <header class="flex justify-between items-end gap-6 mb-8">
        <div>
          <button @click="goBack" class="flex items-center gap-2 text-[#4f378a] hover:underline mb-2 font-semibold">
            <span class="material-symbols-outlined">arrow_back</span>
            Back
          </button>
          <h2 class="text-[40px] leading-[1.1] tracking-[-0.02em] font-extrabold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">Request Detail</h2>
          <p class="text-[16px] leading-[1.6] font-normal text-[#494551]">Manage options and timeline</p>
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
        <div class="bg-white rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-sm border border-gray-100">
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">{{ $t('order_detail.order_no') }}</span>
                <span class="text-sm font-bold text-[#4f378a]">{{ request.id.split('-')[0].toUpperCase() }}</span>
              </div>
              <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{{ request.product_name }}</h1>
            </div>
            <span :class="['font-semibold text-xs px-3 py-1 rounded-full text-white self-start', getStatusClass(request.status)]">
              {{ request.status.replace(/_/g, ' ').toUpperCase() }}
            </span>
          </div>
        </div>

        <!-- Tracking Timeline Header -->
        <div class="mb-6">
          <div class="relative w-full flex justify-between items-center px-2">
            <div class="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -z-10 rounded-full transform -translate-y-1/2"></div>
            <div class="absolute top-1/2 left-0 h-1 bg-[#4f378a] -z-10 rounded-full transform -translate-y-1/2 transition-all duration-1000" :style="{ width: progressWidth }"></div>
            
            <div v-for="stage in timelineStages" :key="stage.value" class="flex flex-col items-center gap-2 bg-[#f3f0fa] px-1 relative">
              <div :class="[
                'w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500',
                stage.passed ? 'bg-[#4f378a] text-white shadow-lg shadow-[#4f378a]/30 scale-110' : 
                stage.current ? 'bg-white border-2 border-[#4f378a] text-[#4f378a] scale-110' : 'bg-gray-100 text-gray-400'
              ]">
                <span class="material-symbols-outlined text-[18px]">{{ stage.icon }}</span>
              </div>
              <span :class="['text-[11px] font-bold uppercase tracking-wider hidden sm:block', stage.current || stage.passed ? 'text-[#4f378a]' : 'text-gray-400']">{{ stage.label }}</span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <!-- Left Column -->
          <div class="lg:col-span-2 space-y-4 sm:space-y-6">
            
            <!-- Buyer Information -->
            <div class="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-[#4f378a]/10 rounded-xl flex items-center justify-center">
                  <span class="material-symbols-outlined text-[#4f378a]">person</span>
                </div>
                <h2 class="text-lg font-bold text-gray-800">Buyer Information</h2>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p class="text-xs text-gray-500 mb-1">Name</p>
                  <p class="font-semibold text-sm text-gray-800">{{ request.buyer_name }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-1">Company</p>
                  <p class="font-semibold text-sm text-gray-800">{{ request.buyer_company }}</p>
                </div>
                <div class="sm:col-span-2">
                  <p class="text-xs text-gray-500 mb-1">Email</p>
                  <p class="font-semibold text-sm text-[#4f378a]">{{ request.buyer_email }}</p>
                </div>
              </div>
            </div>

            <!-- Bagian 1: Informasi Produk -->
            <div class="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-[#4f378a]/10 rounded-xl flex items-center justify-center">
                  <span class="material-symbols-outlined text-[#4f378a]">inventory_2</span>
                </div>
                <h2 class="text-lg font-bold text-gray-800">INFORMASI PRODUK</h2>
              </div>
              <div class="space-y-4">
                <div>
                  <h3 class="text-xl font-bold text-gray-900">{{ request.product_name }}</h3>
                  <p class="text-sm text-[#4f378a] font-semibold mt-1">
                    {{ request.category }} <span v-if="request.sub_category"> > {{ request.sub_category }}</span>
                  </p>
                </div>
                <div class="bg-gray-50 rounded-lg p-4">
                  <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Deskripsi & Spesifikasi Teknis:</h4>
                  <p class="text-sm text-gray-700 whitespace-pre-line">{{ request.specifications || '-' }}</p>
                </div>
              </div>
            </div>

            <!-- Bagian 2: Kualitas & Sertifikasi -->
            <div class="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-[#4f378a]/10 rounded-xl flex items-center justify-center">
                  <span class="material-symbols-outlined text-[#4f378a]">verified</span>
                </div>
                <h2 class="text-lg font-bold text-gray-800">KUALITAS & SERTIFIKASI</h2>
              </div>
              <div class="space-y-4">
                <div>
                  <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Persyaratan Kualitas:</h4>
                  <div class="flex gap-2 items-start bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                    <span class="material-symbols-outlined text-emerald-600 text-[18px] mt-0.5">task_alt</span>
                    <p class="text-sm text-gray-700 whitespace-pre-line">{{ request.quality_requirements || 'Tidak ada persyaratan khusus' }}</p>
                  </div>
                </div>
                <div>
                  <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sertifikasi Dibutuhkan:</h4>
                  <div v-if="request.certifications" class="flex flex-wrap gap-2">
                    <span v-for="cert in request.certifications.split(',')" :key="cert" class="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
                      {{ cert.trim() }}
                    </span>
                  </div>
                  <p v-else class="text-sm text-gray-500 italic">Tidak ada</p>
                </div>
              </div>
            </div>

            <!-- Bagian 3: Budget & Logistik -->
            <div class="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-[#4f378a]/10 rounded-xl flex items-center justify-center">
                  <span class="material-symbols-outlined text-[#4f378a]">local_shipping</span>
                </div>
                <h2 class="text-lg font-bold text-gray-800">BUDGET & LOGISTIK</h2>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div class="py-2 border-b border-gray-100 sm:border-0">
                  <span class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Quantity</span>
                  <span class="text-sm font-semibold text-gray-800">{{ request.quantity }} {{ request.unit || 'units' }}</span>
                </div>
                <div class="py-2 border-b border-gray-100 sm:border-0">
                  <span class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Target Delivery</span>
                  <span class="text-sm font-semibold text-gray-800">{{ request.delivery_timeline ? formatDate(request.delivery_timeline).split(',')[0] : '-' }}</span>
                </div>
                <div class="py-2 border-b border-gray-100 sm:border-0">
                  <span class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Budget Range</span>
                  <span class="text-sm font-bold text-[#4f378a]">{{ request.currency || 'USD' }} {{ request.budget_range }}</span>
                </div>
                <div class="py-2 border-b border-gray-100 sm:border-0">
                  <span class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Shipping</span>
                  <span class="text-sm font-semibold text-gray-800">{{ request.shipping_terms || '-' }}</span>
                </div>
                <div class="py-2 sm:col-span-2">
                  <span class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Payment</span>
                  <span class="text-sm font-semibold text-gray-800">{{ request.payment_terms || '-' }}</span>
                </div>
              </div>
            </div>

            <!-- Bagian 4: Lampiran -->
            <div class="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-[#4f378a]/10 rounded-xl flex items-center justify-center">
                  <span class="material-symbols-outlined text-[#4f378a]">attach_file</span>
                </div>
                <h2 class="text-lg font-bold text-gray-800">LAMPIRAN ({{ request.image_urls ? request.image_urls.length : 0 }} file)</h2>
              </div>
              <div v-if="request.image_urls && request.image_urls.length > 0" class="flex flex-col gap-3">
                <a v-for="(file, idx) in request.image_urls" :key="idx" :href="'http://localhost:5000' + file" target="_blank" class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group">
                  <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 group-hover:text-[#4f378a] transition-colors">
                    <span class="material-symbols-outlined">{{ getFileIcon(file) }}</span>
                  </div>
                  <div class="flex-1 overflow-hidden">
                    <p class="text-sm font-semibold text-gray-700 truncate">{{ file.split('/').pop() }}</p>
                    <p class="text-xs text-gray-500">Click to view</p>
                  </div>
                  <span class="material-symbols-outlined text-gray-400 group-hover:text-[#4f378a]">open_in_new</span>
                </a>
              </div>
              <div v-else class="text-center py-6 text-gray-500 text-sm italic">
                Tidak ada lampiran
              </div>
            </div>

            <!-- Product Options -->
            <div class="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-[#4f378a]/10 rounded-xl flex items-center justify-center">
                    <span class="material-symbols-outlined text-[#4f378a]">list_alt</span>
                  </div>
                  <h2 class="text-lg font-bold text-gray-800">Product Options</h2>
                </div>
                <button v-if="['menunggu_penawaran_admin', 'menunggu_pemilihan_buyer'].includes(request.status)" @click="showOptionsModal = true" class="px-3 py-1.5 bg-[#4f378a] text-white text-xs font-bold rounded-lg hover:opacity-90">
                  + Add Option
                </button>
              </div>
              
              <div v-if="request.options && request.options.length > 0" class="space-y-4">
                <div v-for="opt in request.options" :key="opt.id" class="border border-gray-200 bg-gray-50/50 rounded-xl p-4 flex flex-col sm:flex-row gap-4 relative" :class="{'ring-2 ring-[#4f378a]': request.selected_option_id === opt.id}">
                  <div v-if="opt.images && opt.images.length > 0" class="w-full sm:w-32 h-32 relative shrink-0">
                    <div v-for="(img, i) in opt.images" :key="i" 
                         class="absolute inset-0 rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm transition-transform"
                         :style="{ zIndex: opt.images.length - i, transform: i > 0 ? `translate(${i * 4}px, ${i * 4}px) rotate(${i * 2}deg)` : '' }">
                      <img :src="'http://localhost:5000' + img" class="w-full h-full object-cover" alt="Product Option" />
                    </div>
                    <div v-if="opt.images.length > 1" class="absolute bottom-1 right-1 z-50 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      +{{ opt.images.length - 1 }}
                    </div>
                  </div>
                  <div v-else-if="opt.image_url" class="w-full sm:w-32 h-32 rounded-lg overflow-hidden shrink-0 bg-white border border-gray-200">
                    <img :src="'http://localhost:5000' + opt.image_url" class="w-full h-full object-cover" alt="Product Option" />
                  </div>
                  <div class="flex-1">
                    <div class="flex justify-between items-start mb-2">
                      <h3 class="font-bold text-gray-800">{{ opt.product_name }}</h3>
                      <div class="flex items-center gap-2">
                        <span v-if="request.selected_option_id === opt.id" class="px-2 py-1 bg-[#4f378a] text-white text-xs font-bold rounded-lg flex items-center gap-1">
                          <span class="material-symbols-outlined text-[14px]">check_circle</span> Selected by Buyer
                        </span>
                        <div v-if="request.status === 'menunggu_pemilihan_buyer'" class="flex items-center gap-1">
                          <button @click="editSavedOption(opt)" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200" title="Edit Option">
                            <span class="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button @click="deleteSavedOption(opt.id)" class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200" title="Delete Option">
                            <span class="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    <p v-if="opt.description" class="text-sm text-gray-600 mb-3">{{ opt.description }}</p>
                    
                    <div class="bg-amber-50 border border-amber-100 rounded-lg p-3 mb-3">
                      <div class="flex items-center gap-1 text-amber-700 font-bold text-xs mb-1">
                        <span class="material-symbols-outlined text-[16px]">stars</span> Admin's Recommendation
                      </div>
                      <p class="text-sm text-gray-700">{{ opt.admin_reason }}</p>
                    </div>
                    
                    <div class="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                      <div>
                        <span class="text-gray-500 font-semibold text-xs uppercase tracking-wider block mb-0.5">Price</span>
                        <span class="font-bold text-[#4f378a]">
                          {{ opt.is_fixed_price ? 'USD ' + opt.price_min + ' (Fixed)' : 'USD ' + opt.price_min + ' - ' + opt.price_max + ' (Range)' }}
                        </span>
                      </div>
                      <div v-if="opt.target_delivery">
                        <span class="text-gray-500 font-semibold text-xs uppercase tracking-wider block mb-0.5">Target</span>
                        <span class="font-semibold text-gray-800">{{ formatDate(opt.target_delivery).split(',')[0] }}</span>
                      </div>
                      <div v-if="opt.shipping_method">
                        <span class="text-gray-500 font-semibold text-xs uppercase tracking-wider block mb-0.5">Shipping</span>
                        <div class="flex items-center gap-3">
                          <span v-if="['sea', 'both'].includes(opt.shipping_method)" class="font-semibold text-gray-800 flex items-center gap-1"><span class="material-symbols-outlined text-[16px] text-blue-600">directions_boat</span> {{ opt.est_time_sea }}</span>
                          <span v-if="['air', 'both'].includes(opt.shipping_method)" class="font-semibold text-gray-800 flex items-center gap-1"><span class="material-symbols-outlined text-[16px] text-cyan-600">flight</span> {{ opt.est_time_air }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-6 text-gray-500 text-sm">
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
            <div class="bg-white rounded-xl p-4 sm:p-6 shadow-sm border-2 border-[#4f378a]/20">
              <h3 class="font-bold text-[#4f378a] mb-4">Admin Operations</h3>
              <div class="space-y-3">
                
                <button v-if="request.status === 'menunggu_kesepakatan_final'" @click="finalizeDeal" :disabled="loadingAction" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#4f378a] text-white rounded-lg transition-colors font-semibold disabled:opacity-50">
                  <span class="material-symbols-outlined text-[18px]">gavel</span>
                  Finalisasi Kesepakatan
                </button>

                <div v-if="request.status === 'menunggu_verifikasi_pembayaran'" class="space-y-3">
                  <a v-if="request.payment_proof_url" :href="'http://localhost:5000' + request.payment_proof_url" target="_blank" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-[#4f378a] border border-[#4f378a]/30 rounded-lg transition-colors font-semibold hover:bg-gray-200">
                    <span class="material-symbols-outlined text-[18px]">receipt_long</span>
                    Lihat Bukti Bayar Buyer
                  </a>
                  <button @click="verifyPayment" :disabled="loadingAction" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-lg transition-colors font-semibold hover:bg-orange-600 disabled:opacity-50">
                    <span class="material-symbols-outlined text-[18px]">verified_user</span>
                    Verifikasi Pembayaran
                  </button>
                </div>

                <button v-if="request.status === 'sedang_diproses'" @click="shipOrder" :disabled="loadingAction" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cyan-600 text-white rounded-lg transition-colors font-semibold hover:bg-cyan-700 disabled:opacity-50">
                  <span class="material-symbols-outlined text-[18px]">local_shipping</span>
                  Kirim Barang (Ship)
                </button>

                <div v-if="request.status === 'menunggu_verifikasi_admin'" class="space-y-3">
                  <div class="text-sm text-orange-600 bg-orange-50 p-2 rounded border border-orange-200 mb-2">
                    Buyer telah menekan tombol barang tiba. Pastikan Anda telah memeriksa dokumen Bill of Lading.
                  </div>
                  <button @click="completeOrder" :disabled="loadingAction" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 text-white rounded-lg transition-colors font-semibold hover:bg-teal-700 disabled:opacity-50">
                    <span class="material-symbols-outlined text-[18px]">done_all</span>
                    Selesaikan Order
                  </button>
                </div>
                
                <div v-if="['selesai', 'batal', 'dispute', 'menunggu_penawaran_admin', 'menunggu_pemilihan_buyer', 'menunggu_pembayaran'].includes(request.status)" class="text-sm text-gray-500 italic text-center py-2">
                  No action required at this stage or waiting for buyer.
                </div>

              </div>
            </div>

            <!-- Status Timeline -->
            <div class="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-[#4f378a]/10 rounded-xl flex items-center justify-center">
                  <span class="material-symbols-outlined text-[#4f378a]">timeline</span>
                </div>
                <h2 class="text-lg font-bold text-gray-800">{{ $t('order_detail.status_timeline') }}</h2>
              </div>

              <div class="space-y-4">
                <div v-for="(log, idx) in trackingLogs" :key="log.id" class="flex gap-3">
                  <div class="flex flex-col items-center">
                    <div :class="['w-8 h-8 rounded-full flex items-center justify-center', idx === trackingLogs.length - 1 ? 'bg-[#4f378a] ring-4 ring-[#4f378a]/20' : 'bg-green-500']">
                      <span v-if="idx === trackingLogs.length - 1" class="material-symbols-outlined text-white text-[16px]">radio_button_checked</span>
                      <span v-else class="material-symbols-outlined text-white text-[16px]">check</span>
                    </div>
                    <div v-if="idx < trackingLogs.length - 1" class="w-0.5 h-full bg-gray-200 mt-2"></div>
                  </div>
                  <div class="flex-1 pb-4">
                    <p :class="['font-semibold text-sm', idx === trackingLogs.length - 1 ? 'text-[#4f378a]' : 'text-gray-800']">
                      {{ log.status.replace(/_/g, ' ').toUpperCase() }}
                    </p>
                    <p class="text-xs text-gray-500">{{ formatDate(log.created_at) }}</p>
                    <p v-if="log.notes" class="text-xs text-gray-600 mt-1">{{ log.notes }}</p>
                  </div>
                </div>
                <div v-if="trackingLogs.length === 0" class="text-sm text-gray-500 italic">No timeline events yet.</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
    
    <!-- Options Upload Modal / Editor -->
      <div v-if="showOptionsModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">
          <div class="flex justify-between items-center p-6 border-b border-gray-100">
            <h2 class="text-xl font-bold text-gray-800">{{ editingOptionId ? 'Edit Saved Option' : 'Add Product Options' }}</h2>
            <button @click="closeOptionsModal" class="text-gray-400 hover:text-gray-600">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <div class="p-6 overflow-y-auto flex-1 bg-gray-50/30">

          <!-- Pending Options List -->
          <div v-if="pendingOptions.length > 0 && !editingOptionId" class="space-y-3 mb-6 border-b border-gray-100 pb-6">
            <h3 class="text-sm font-bold text-gray-700">Options to Save ({{ pendingOptions.length }})</h3>
            <div v-for="(opt, idx) in pendingOptions" :key="idx" 
                 @click="editPendingOption(idx)"
                 class="flex gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:border-[#4f378a]/50 hover:bg-gray-100 transition-colors group relative">
              
              <div class="w-16 h-16 relative shrink-0">
                <div v-for="(preview, i) in opt.photoPreviews" :key="i"
                     class="absolute inset-0 rounded-lg overflow-hidden border border-gray-200 bg-white"
                     :style="{ zIndex: opt.photoPreviews.length - i, transform: i > 0 ? `translate(${i * 2}px, ${i * 2}px) rotate(${i}deg)` : '' }">
                  <img :src="preview" class="w-full h-full object-cover" />
                </div>
                <div v-if="opt.photoPreviews.length > 1" class="absolute bottom-0 right-0 z-50 bg-black/60 text-white text-[9px] font-bold px-1 rounded-sm">
                  +{{ opt.photoPreviews.length - 1 }}
                </div>
              </div>

              <div class="flex-1 min-w-0">
                <p class="font-bold text-sm text-gray-800 truncate group-hover:text-[#4f378a]">{{ opt.data.product_name }}</p>
                <p class="text-xs text-gray-500 truncate">{{ opt.data.description || 'No description' }}</p>
                <p class="text-xs font-semibold text-[#4f378a] mt-1">{{ opt.data.is_fixed_price ? 'Fixed: ' + opt.data.price_min : 'Range: ' + opt.data.price_min + '-' + opt.data.price_max }}</p>
              </div>
              <div class="flex flex-col gap-2 shrink-0 self-start">
                <button @click.stop="removePendingOption(idx)" class="text-gray-400 hover:text-red-600 transition-colors bg-white rounded-full p-1 shadow-sm border border-gray-200">
                  <span class="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
              <div class="absolute inset-0 rounded-xl ring-2 ring-[#4f378a] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"></div>
            </div>
          </div>

          <h3 class="text-sm font-bold text-[#4f378a] mb-2">{{ pendingOptions.length > 0 && !editingOptionId ? 'Add Another Option' : 'New Option Details' }}</h3>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Option Name *</label>
            <input v-model="newOption.product_name" type="text" class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white" placeholder="e.g. Premium Solar Panel 500W">
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea v-model="newOption.description" rows="2" class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white" placeholder="Brand, specs, materials..."></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Product Photos (Max 5) *</label>
            <div class="relative border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer" @click="triggerPhotoUpload" @dragover.prevent @drop.prevent="handlePhotoDrop">
              <input type="file" ref="photoInput" class="hidden" accept="image/jpeg, image/png, image/webp" multiple @change="handlePhotoSelect" />
              <div v-if="newOptionPhotoPreviews.length > 0" class="flex flex-wrap gap-2 justify-center">
                <div v-for="(preview, idx) in newOptionPhotoPreviews" :key="idx" class="relative">
                  <img :src="preview" class="h-24 w-24 object-cover rounded-lg shadow-sm border border-gray-200" />
                  <button @click.stop="removeNewOptionPhoto(idx)" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow-md">
                    <span class="material-symbols-outlined text-[14px] block">close</span>
                  </button>
                </div>
                <div v-if="newOptionPhotoPreviews.length < 5" class="h-24 w-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:bg-gray-100">
                  <span class="material-symbols-outlined">add</span>
                </div>
              </div>
              <div v-else class="text-gray-400">
                <span class="material-symbols-outlined text-4xl mb-2">add_photo_alternate</span>
                <p class="text-sm font-semibold text-gray-600">Drag & drop images here or click to upload</p>
                <p class="text-xs mt-1">Format: JPG, PNG, WEBP. Max 5MB per photo.</p>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Admin's Recommendation Reason *</label>
            <textarea v-model="newOption.admin_reason" rows="2" class="w-full px-4 py-2 border border-amber-300 bg-amber-50 rounded-lg" placeholder="Why should the buyer choose this option?"></textarea>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Pricing Type</label>
              <div class="flex gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" v-model="newOption.is_fixed_price" :value="true" class="text-[#4f378a] focus:ring-[#4f378a]" />
                  <span class="text-sm text-gray-700">Fixed Price</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" v-model="newOption.is_fixed_price" :value="false" class="text-[#4f378a] focus:ring-[#4f378a]" />
                  <span class="text-sm text-gray-700">Price Range</span>
                </label>
              </div>
              <div class="flex gap-2 mt-3">
                <div class="flex-1">
                  <input v-model="newOption.price_min" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg" :placeholder="newOption.is_fixed_price ? 'Price' : 'Min'">
                </div>
                <div class="flex-1" v-if="!newOption.is_fixed_price">
                  <input v-model="newOption.price_max" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Max">
                </div>
              </div>
            </div>

            <div class="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <label class="block text-sm font-semibold text-gray-700 mb-1">Target Delivery</label>
              <input v-model="newOption.target_delivery" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3">
              
              <label class="block text-sm font-semibold text-gray-700 mb-2">Shipping Method</label>
              <div class="flex gap-4 mb-3">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" v-model="newOption.shipping_method" value="sea" class="text-[#4f378a] focus:ring-[#4f378a]" /> <span class="text-sm">Sea</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" v-model="newOption.shipping_method" value="air" class="text-[#4f378a] focus:ring-[#4f378a]" /> <span class="text-sm">Air</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" v-model="newOption.shipping_method" value="both" class="text-[#4f378a] focus:ring-[#4f378a]" /> <span class="text-sm">Both</span>
                </label>
              </div>
              <div class="space-y-2">
                <div v-if="['sea', 'both'].includes(newOption.shipping_method)">
                  <input v-model="newOption.est_time_sea" type="text" class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg" placeholder="Est. Sea (e.g. 25-35 days)">
                </div>
                <div v-if="['air', 'both'].includes(newOption.shipping_method)">
                  <input v-model="newOption.est_time_air" type="text" class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg" placeholder="Est. Air (e.g. 5-7 days)">
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex justify-end pt-2 border-t border-gray-200 mt-6">
            <div class="mt-6 flex justify-end gap-3">
              <button @click="closeOptionsModal" class="px-5 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
              <button v-if="editingOptionId" @click="updateSavedOption" :disabled="uploadingOption" class="px-5 py-2.5 bg-[#4f378a] hover:bg-[#3d2a6b] text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2">
                <span v-if="uploadingOption" class="material-symbols-outlined animate-spin">progress_activity</span>
                {{ uploadingOption ? 'Updating...' : 'Update Option' }}
              </button>
              <button v-else @click="addToPending" class="px-5 py-2.5 border-2 border-[#4f378a] text-[#4f378a] hover:bg-[#4f378a]/5 font-bold rounded-xl transition-all flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px]">add</span> Add to List
              </button>
            </div>
          </div>
          
          <div v-if="!editingOptionId" class="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
            <div class="text-sm font-semibold text-gray-600">Total Options: <span class="text-[#4f378a] text-lg">{{ pendingOptions.length }}</span></div>
            <div class="flex gap-3">
              <button @click="closeOptionsModal" class="px-5 py-2.5 text-gray-600 font-semibold hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
              <button @click="submitAllOptions" :disabled="uploadingOption" class="px-6 py-2.5 bg-[#4f378a] hover:bg-[#3d2a6b] text-white font-bold rounded-xl shadow-lg shadow-[#4f378a]/20 transition-all flex items-center gap-2">
                <span v-if="uploadingOption" class="material-symbols-outlined animate-spin">progress_activity</span>
                {{ uploadingOption ? 'Saving...' : 'Save All Options' }}
              </button>
            </div>
          </div></div>
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

const finalizeDeal = async () => {
  if(!confirm('Finalisasi deal? Ini akan memunculkan form bayar ke buyer.')) return;
  loadingAction.value = true;
  try {
    await adminService.finalizeDeal(request.value.id);
    await loadData();
  } catch (e) {
    showToast(e.response?.data?.message || 'Failed');
  } finally {
    loadingAction.value = false;
  }
}

const verifyPayment = async () => {
  if(!confirm('Verifikasi pembayaran? Order akan diproses.')) return;
  loadingAction.value = true;
  try {
    await adminService.verifyPayment(request.value.id);
    await loadData();
  } catch (e) {
    showToast(e.response?.data?.message || 'Failed');
  } finally {
    loadingAction.value = false;
  }
}

const shipOrder = async () => {
  if(!confirm('Kirim pesanan?')) return;
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

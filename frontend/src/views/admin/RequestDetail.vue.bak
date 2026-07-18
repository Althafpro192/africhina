<template>
  <div class="flex min-h-screen text-[#1d1b20]" style="background: radial-gradient(circle at top left, #fdf7ff, #f2ecf4); font-family: 'Inter', sans-serif; overflow-x: hidden;">
    
    
    <!-- SIDEBAR -->
    <aside class="glass-panel w-72 h-screen sticky top-0 flex flex-col p-6 z-40 border-r-0 rounded-r-3xl deep-shadow">
      <div class="mb-10 flex items-center gap-3">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4f378a] to-[#6750a4] flex items-center justify-center shadow-lg border-t border-white/40">
          <span class="material-symbols-outlined text-white text-2xl" style="font-variation-settings: 'FILL' 1;">badge</span>
        </div>
        <div>
          <h1 class="text-[24px] leading-[1.3] font-bold text-[#4f378a] tracking-tight">{{ $t('auth.title') }}</h1>
          <p class="text-[10px] font-bold text-[#7a7582] tracking-widest uppercase">{{ $t('nav.admin_terminal') }}</p>
        </div>
      </div>

      <nav class="flex-1 space-y-3">
        <a @click="router.push('/admin/dashboard')" class="flex items-center gap-4 px-4 py-3 rounded-xl text-[#494551] hover:bg-[#ece6ee] transition-all lift-effect group cursor-pointer">
          <div class="w-8 h-8 rounded-lg bg-[#e6e0e9] flex items-center justify-center shadow-sm border border-white/50">
            <span class="material-symbols-outlined text-xl text-[#4f378a]" style="font-variation-settings: 'FILL' 0;">dashboard</span>
          </div>
          <span class="text-[14px] leading-[1.2] tracking-[0.01em] font-semibold">{{ $t('nav.dashboard') }}</span>
        </a>
      </nav>
      
      <!-- Profile Section -->
      <div class="mt-auto pt-6 border-t border-[#cbc4d2] space-y-4">
        <div class="flex items-center gap-3 p-2 rounded-2xl bg-[#f8f2fa] border border-white/30">
          <div class="relative">
            <div class="w-10 h-10 rounded-full border-2 border-[#4f378a] overflow-hidden shadow-md flex items-center justify-center bg-gray-200">
              <span class="material-symbols-outlined text-[#4f378a]">person</span>
            </div>
            <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div class="flex-1 overflow-hidden">
            <p class="text-[14px] leading-[1.2] tracking-[0.01em] font-semibold text-[#1d1b20] truncate">{{ userRole }}</p>
            <p class="text-[10px] text-[#494551]">Administrator</p>
          </div>
        </div>
        <button @click="logout" class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#e6e0e9] text-[#4f378a] font-semibold shadow-md hover:bg-[#ffdad6] hover:text-[#93000a] transition-colors lift-effect">
          <span class="material-symbols-outlined text-xl">logout</span>
          <span class="text-[14px] leading-[1.2] tracking-[0.01em] font-semibold">{{ $t('nav.logout') }}</span>
        </button>
      </div>
    </aside>

<main class="flex-1 p-10 max-w-[1600px] mx-auto space-y-10">
      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <span class="material-symbols-outlined animate-spin text-[#4f378a] mb-4" style="font-size: 48px;">progress_activity</span>
      </div>
      <div v-else-if="!request" class="text-center py-20">
        <h2 class="text-xl font-bold text-gray-600">Request not found</h2>
      </div>
      <div v-else class="w-full max-w-5xl mx-auto">
        
        <!-- Request Header Card -->
        <div class="glass-panel deep-shadow rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">{{ $t('order_detail.order_no') }}</span>
                <span class="text-sm font-bold text-[#4f378a]">{{ request.id.split('-')[0].toUpperCase() }}</span>
              </div>
              <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{{ request.product_name }}</h1>
            </div>
            <span :class="['font-semibold text-xs px-3 py-1 rounded-full text-white self-start', getStatusClass(request.status)]">
              {{ $t('status.' + request.status) || request.status }}
            </span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
            <div>
              <p class="text-xs text-gray-500 mb-1">{{ $t('admin.category') }}</p>
              <p class="font-semibold text-sm text-gray-800">{{ request.category }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-1">{{ $t('admin.request_date') }}</p>
              <p class="font-semibold text-sm text-gray-800">{{ formatDate(request.created_at) }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-1">{{ $t('request_details.quantity') }}</p>
              <p class="font-semibold text-sm text-gray-800">{{ request.quantity }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-1">{{ $t('admin.est_volume') }}</p>
              <p class="font-semibold text-sm text-[#4f378a]">{{ request.quoted_price ? '$' + Number(request.quoted_price).toLocaleString() : 'N/A' }}</p>
            </div>
          </div>
          
          <!-- Visual Timeline Progress Bar -->
          <div class="mt-8 pt-6 border-t border-gray-100 hidden sm:block">
            <div class="flex items-center justify-between relative">
              <!-- Background line -->
              <div class="absolute left-0 right-0 h-1 bg-gray-200 top-4 -z-10"></div>
              <!-- Progress line -->
              <div class="absolute left-0 h-1 bg-gradient-to-r from-[#4f46e5] to-[#4f378a] top-4 -z-10 transition-all duration-1000" :style="{ width: progressWidth }"></div>
              
              <div v-for="(stage, index) in timelineStages" :key="stage.value" class="flex flex-col items-center gap-2 bg-white px-2">
                <div :class="[
                  'w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500',
                  stage.passed ? 'bg-[#4f378a] text-white shadow-lg shadow-[#4f378a]/30 scale-110' : 
                  stage.current ? 'bg-white border-2 border-[#4f378a] text-[#4f378a] scale-110' : 'bg-gray-100 text-gray-400'
                ]">
                  <span class="material-symbols-outlined text-[18px]">{{ stage.icon }}</span>
                </div>
                <span :class="['text-[11px] font-bold uppercase tracking-wider', stage.current || stage.passed ? 'text-[#4f378a]' : 'text-gray-400']">{{ stage.label }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Two Column Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          
          <!-- Left Column: Product Details & Specs -->
          <div class="lg:col-span-2 space-y-4 sm:space-y-6">
            
            <!-- Buyer Information -->
            <div class="glass-panel deep-shadow rounded-xl p-4 sm:p-6">
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

            <!-- Product Details -->
            <div class="glass-panel deep-shadow rounded-xl p-4 sm:p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-[#4f378a]/10 rounded-xl flex items-center justify-center">
                  <span class="material-symbols-outlined text-[#4f378a]">inventory_2</span>
                </div>
                <h2 class="text-lg font-bold text-gray-800">{{ $t('request_details.product_details') }}</h2>
              </div>
              <div class="space-y-3">
                <div class="flex justify-between py-2 border-b border-gray-100">
                  <span class="text-sm text-gray-600">{{ $t('request_details.product_name') }}</span>
                  <span class="text-sm font-semibold text-gray-800">{{ request.product_name }}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-gray-100">
                  <span class="text-sm text-gray-600">{{ $t('admin.category') }}</span>
                  <span class="text-sm font-semibold text-gray-800">{{ request.category }}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-gray-100">
                  <span class="text-sm text-gray-600">{{ $t('request_details.quantity') }}</span>
                  <span class="text-sm font-semibold text-gray-800">{{ request.quantity }} units</span>
                </div>
                <div class="flex justify-between py-2">
                  <span class="text-sm text-gray-600">{{ $t('request_details.budget') }}</span>
                  <span class="text-sm font-semibold text-[#4f378a]">{{ request.budget_range }}</span>
                </div>
              </div>
            </div>

            <!-- Specifications -->
            <div class="glass-panel deep-shadow rounded-xl p-4 sm:p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-[#4f378a]/10 rounded-xl flex items-center justify-center">
                  <span class="material-symbols-outlined text-[#4f378a]">description</span>
                </div>
                <h2 class="text-lg font-bold text-gray-800">{{ $t('request_details.specifications') }}</h2>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {{ request.specifications }}
                </p>
              </div>
            </div>

            <!-- Reference Images -->
            <div v-if="request.image_urls && request.image_urls.length > 0" class="glass-panel deep-shadow rounded-xl p-4 sm:p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-[#4f378a]/10 rounded-xl flex items-center justify-center">
                  <span class="material-symbols-outlined text-[#4f378a]">image</span>
                </div>
                <h2 class="text-lg font-bold text-gray-800">{{ $t('request_details.references') }}</h2>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div v-for="(img, idx) in request.image_urls" :key="idx" class="relative group">
                  <img :src="'http://localhost:5000' + img" class="w-full h-32 object-cover rounded-lg border border-gray-200" />
                </div>
              </div>
            </div>

            <!-- Production Updates (Progress & QC Media) -->
            <div v-if="['processing', 'production', 'inspected', 'shipped', 'completed'].includes(request.status)" class="glass-panel deep-shadow rounded-xl p-4 sm:p-6 bg-indigo-50/50 border-indigo-100">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-[#4f378a] rounded-xl flex items-center justify-center shadow-lg shadow-[#4f378a]/30">
                    <span class="material-symbols-outlined text-white">manufacturing</span>
                  </div>
                  <h2 class="text-lg font-bold text-gray-800">Production Updates</h2>
                </div>
                <span class="text-2xl font-black text-[#4f378a]">{{ request.production_progress || 0 }}%</span>
              </div>
              
              <!-- Progress Bar -->
              <div class="w-full h-3 bg-white rounded-full overflow-hidden shadow-inner mb-6 border border-gray-100">
                <div class="h-full bg-gradient-to-r from-indigo-400 to-[#4f378a] transition-all duration-1000" :style="{ width: (request.production_progress || 0) + '%' }"></div>
              </div>

              <!-- QC Media Gallery -->
              <div v-if="request.production_media && request.production_media.length > 0">
                <h3 class="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <span class="material-symbols-outlined text-[18px]">verified</span> Quality Control Media
                </h3>
                <div class="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                  <div v-for="(media, idx) in request.production_media" :key="idx" class="shrink-0 w-32 h-32 rounded-xl overflow-hidden border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-all group">
                    <img v-if="media.match(/\.(jpeg|jpg|gif|png)$/i)" :src="'http://localhost:5000' + media" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div v-else class="w-full h-full bg-gray-100 flex flex-col items-center justify-center">
                      <span class="material-symbols-outlined text-gray-400 text-3xl">videocam</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Supplier Information (If Assigned) -->
            <div v-if="request.assigned_supplier_id" class="glass-panel deep-shadow rounded-xl p-4 sm:p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-[#4f378a]/10 rounded-xl flex items-center justify-center">
                    <span class="material-symbols-outlined text-[#4f378a]">business</span>
                  </div>
                  <h2 class="text-lg font-bold text-gray-800">Assigned Supplier</h2>
                </div>
              </div>

              <div class="border border-gray-200 rounded-lg p-4">
                <div class="flex items-start justify-between mb-2">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span class="material-symbols-outlined text-blue-600 text-[20px]">verified</span>
                    </div>
                    <div>
                      <p class="font-semibold text-sm text-gray-800">{{ request.supplier_name }}</p>
                      <p class="text-xs text-gray-500">{{ request.factory_address }} • {{ request.verification_level }}</p>
                    </div>
                  </div>
                  <span class="text-lg font-bold text-[#4f378a]">${{ Number(request.quoted_price).toLocaleString() }}</span>
                </div>
                <div v-if="request.status === 'quoted' && userRole !== 'admin'" class="flex gap-2 mt-4">
                  <button @click="rejectQuote" :disabled="accepting || rejecting" class="flex-1 px-3 py-2 bg-red-50 text-red-600 border border-red-200 text-sm font-semibold rounded-lg hover:bg-red-100 transition-colors disabled:opacity-70">
                    <span v-if="rejecting" class="material-symbols-outlined animate-spin align-middle text-sm">progress_activity</span>
                    <span v-else>Reject Quote</span>
                  </button>
                  <button @click="acceptQuote" :disabled="accepting || rejecting" class="flex-1 px-3 py-2 bg-[#4f378a] text-white text-sm font-semibold rounded-lg hover:opacity-95 transition-opacity disabled:opacity-70">
                    <span v-if="accepting" class="material-symbols-outlined animate-spin align-middle text-sm">progress_activity</span>
                    <span v-else>{{ $t('order_detail.accept_quote') }}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Action to Confirm Delivery -->
            <div v-if="request.status === 'shipped' && userRole !== 'admin'" class="glass-panel deep-shadow rounded-xl p-4 sm:p-6 bg-emerald-50 border border-emerald-200">
              <h3 class="font-bold text-gray-800 mb-2">Order Delivered?</h3>
              <p class="text-sm text-gray-600 mb-4">Please confirm if you have received your order in good condition.</p>
              <button @click="confirmDelivery" :disabled="confirming" class="w-full px-4 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                <span v-if="confirming" class="material-symbols-outlined animate-spin">progress_activity</span>
                <span class="material-symbols-outlined" v-else>done_all</span>
                Confirm Delivery
              </button>
            </div>
            
            <!-- Rating Form (If Completed) -->
            <div v-if="request.status === 'completed' && request.assigned_supplier_id && !existingRating && userRole !== 'admin'" class="glass-panel deep-shadow rounded-xl p-4 sm:p-6 bg-purple-50 border-purple-200">
              <h3 class="font-bold text-gray-800 mb-2">Rate your supplier</h3>
              <p class="text-sm text-gray-600 mb-4">How was your experience with {{ request.supplier_name }}?</p>
              
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
                placeholder="Write a review..."
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4f378a] mb-4 text-sm"
              ></textarea>
              
              <button 
                @click="submitRating" 
                :disabled="!ratingScore || submittingRating"
                class="px-6 py-2 bg-[#4f378a] text-white rounded-lg font-semibold disabled:opacity-50"
              >
                Submit Review
              </button>
            </div>
            
            <div v-if="existingRating" class="glass-panel deep-shadow rounded-xl p-4 sm:p-6">
              <h3 class="font-bold text-gray-800 mb-2">Your Review</h3>
              <div class="flex text-yellow-400 text-xl mb-2">
                {{ '★'.repeat(existingRating.score) }}{{ '☆'.repeat(5 - existingRating.score) }}
              </div>
              <p class="text-sm text-gray-700 italic">"{{ existingRating.review }}"</p>
            </div>
          </div>

          <!-- Right Column: Timeline & Actions -->
          <div class="space-y-4 sm:space-y-6">
            
            <!-- Status Timeline -->
            <div class="glass-panel deep-shadow rounded-xl p-4 sm:p-6">
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
                      {{ $t('status.' + log.status) || log.status }}
                    </p>
                    <p class="text-xs text-gray-500">{{ formatDate(log.created_at) }}</p>
                    <p v-if="log.notes" class="text-xs text-gray-600 mt-1">{{ log.notes }}</p>
                  </div>
                </div>
                <div v-if="trackingLogs.length === 0" class="text-sm text-gray-500 italic">No timeline events yet.</div>
              </div>
            </div>

            <!-- Admin Actions (Only if admin) -->
            <div v-if="userRole === 'admin'" class="glass-panel deep-shadow rounded-xl p-4 sm:p-6 bg-blue-50 border border-blue-200">
              <h3 class="font-bold text-gray-800 mb-4">Admin Actions</h3>
              <div class="space-y-2">
                <button @click="openUpdateModal" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#4f378a] text-white rounded-lg transition-colors font-semibold">
                  <span class="material-symbols-outlined text-[18px]">update</span>
                  Update Order Status
                </button>
              </div>
            </div>
            
            <!-- Danger Zone (Delete Pending Request) -->
            <div v-if="request.status === 'pending' && userRole !== 'admin'" class="glass-panel deep-shadow rounded-xl p-4 sm:p-6 bg-red-50/50 border border-red-100">
              <h3 class="font-bold text-gray-800 mb-2">Danger Zone</h3>
              <p class="text-sm text-gray-600 mb-4">You can delete this request since it hasn't been quoted yet.</p>
              <button @click="deleteRequest" :disabled="deleting" class="w-full px-4 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                <span v-if="deleting" class="material-symbols-outlined animate-spin">progress_activity</span>
                <span v-else class="material-symbols-outlined text-[18px]">delete</span>
                Delete Request
              </button>
            </div>

            <!-- Quick Actions -->
            <div class="glass-panel deep-shadow rounded-xl p-4 sm:p-6">
              <h3 class="font-bold text-gray-800 mb-4">{{ $t('order_detail.quick_actions') }}</h3>
              <div class="space-y-2">
                <button class="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <span class="material-symbols-outlined text-gray-600">download</span>
                  <span class="text-sm font-semibold text-gray-700">{{ $t('order_detail.download_pdf') }}</span>
                </button>
                <button class="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <span class="material-symbols-outlined text-gray-600">share</span>
                  <span class="text-sm font-semibold text-gray-700">{{ $t('order_detail.share_request') }}</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </main>
    
    <!-- Admin Update Status Modal -->
    <div 
      v-if="showUpdateModal && userRole === 'admin'" 
      class="fixed inset-0 z-[100] flex items-center justify-center p-4"
      @click.self="closeUpdateModal"
    >
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b border-gray-100 p-4 sm:p-6 rounded-t-2xl">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg sm:text-xl font-bold text-gray-800">{{ $t('admin.update_status_title') }}</h2>
            </div>
            <button @click="closeUpdateModal" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <span class="material-symbols-outlined text-gray-600">close</span>
            </button>
          </div>
        </div>

        <div class="p-4 sm:p-6 space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-3">{{ $t('admin.update_status_to') }}</label>
            <div class="grid grid-cols-2 gap-2">
              <button 
                v-for="status in statusOptions" 
                :key="status.value"
                @click="selectedStatus = status.value"
                :class="[
                  'flex items-center gap-2 p-3 rounded-lg border-2 transition-all',
                  selectedStatus === status.value 
                    ? 'border-[#4f378a] bg-[#4f378a]/5' 
                    : 'border-gray-200 hover:border-gray-300'
                ]"
              >
                <span class="material-symbols-outlined" :class="selectedStatus === status.value ? 'text-[#4f378a]' : 'text-gray-400'">
                  {{ status.icon }}
                </span>
                <span class="text-sm font-semibold" :class="selectedStatus === status.value ? 'text-[#4f378a]' : 'text-gray-700'">
                  {{ status.label }}
                </span>
              </button>
            </div>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Price Quote</label>
            <div class="flex gap-2">
              <select v-model="adminCurrency" class="w-1/3 px-4 py-3 border border-gray-200 rounded-lg text-sm bg-white">
                <option value="USD">USD ($)</option>
                <option value="CNY">CNY (¥)</option>
                <option value="EUR">EUR (€)</option>
              </select>
              <input type="number" v-model="adminPrice" class="w-2/3 px-4 py-3 border border-gray-200 rounded-lg text-sm" placeholder="e.g. 4500" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Assign Supplier</label>
            <select v-model="selectedSupplier" class="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm bg-white">
              <option value="">None</option>
              <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
                {{ supplier.company_name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Internal Notes</label>
            <textarea v-model="internalNotes" class="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm h-24 resize-none" placeholder="Internal updates (not visible to buyer)..."></textarea>
          </div>
          <div v-if="['processing', 'production', 'inspected'].includes(selectedStatus)">
            <label class="flex justify-between text-sm font-semibold text-gray-700 mb-2">
              Production Progress <span>{{ productionProgress }}%</span>
            </label>
            <input v-model="productionProgress" type="range" min="0" max="100" step="5" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#4f378a]" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Upload QC Media (Photos/Videos)</label>
            <div @click="triggerQcUpload" class="border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl p-6 text-center cursor-pointer hover:border-[#4f378a] transition-all">
              <span class="material-symbols-outlined text-gray-400 text-3xl mb-2">cloud_upload</span>
              <p class="text-sm text-gray-600 font-semibold mb-1">Click or drag files to upload</p>
              <p class="text-xs text-gray-400">Max 5 files (Images/Videos), 10MB each</p>
              <input type="file" ref="qcFileInput" @change="handleQcFiles" class="hidden" multiple accept="image/*,video/*" />
            </div>
            <!-- Preview -->
            <div v-if="qcFiles.length > 0" class="mt-4 grid grid-cols-4 gap-2">
              <div v-for="(file, index) in qcFiles" :key="index" class="relative rounded-lg overflow-hidden border border-gray-200 aspect-square group">
                <img v-if="file.type.startsWith('image/')" :src="file.url" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full bg-gray-100 flex items-center justify-center">
                  <span class="material-symbols-outlined text-gray-400">movie</span>
                </div>
                <button @click.stop="removeQcFile(index)" class="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                  <span class="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="sticky bottom-0 bg-gray-50 border-t border-gray-100 p-4 sm:p-6 rounded-b-2xl">
          <div class="flex gap-3">
            <button @click="closeUpdateModal" class="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
              {{ $t('admin.cancel') }}
            </button>
            <button @click="saveStatusUpdate" class="flex-1 px-4 py-3 text-white font-semibold rounded-lg transition-all hover:opacity-95" style="background: linear-gradient(135deg, #4f46e5 0%, #4f378a 100%);">
              {{ $t('admin.save_changes') }}
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import LanguageSwitcher from '../../components/LanguageSwitcher.vue'
import { requestService } from '../../api/requestService.js'
import { adminService } from '../../api/adminService.js'
import { ratingService } from '../../api/ratingService.js'

const router = useRouter()
const route = useRoute()

// State
const request = ref(null)
const trackingLogs = ref([])
const loading = ref(true)
const accepting = ref(false)
const rejecting = ref(false)
const confirming = ref(false)
const deleting = ref(false)
const userRole = ref(JSON.parse(localStorage.getItem('user') || '{}').role)

const ratingScore = ref(0)
const hoverScore = ref(0)
const ratingReview = ref('')
const existingRating = ref(null)
const submittingRating = ref(false)

// Admin Modal
const showUpdateModal = ref(false)
const selectedStatus = ref('')
const adminPrice = ref('')
const adminCurrency = ref('USD')
const selectedSupplier = ref('')
const internalNotes = ref('')
const productionProgress = ref(0)
const suppliers = ref([])
const qcFiles = ref([])
const qcFileInput = ref(null)

const statusOptions = [
  { value: 'quoted', label: 'Quoted', icon: 'request_quote' },
  { value: 'processing', label: 'Processing', icon: 'conveyor_belt' },
  { value: 'inspected', label: 'Inspected', icon: 'verified' },
  { value: 'shipped', label: 'Shipped', icon: 'local_shipping' },
  { value: 'completed', label: 'Completed', icon: 'task_alt' }
]

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

const stages = ['pending', 'quoted', 'approved', 'processing', 'inspected', 'shipped', 'completed'];

const timelineStages = computed(() => {
  if (!request.value) return [];
  const currentIdx = Math.max(0, stages.indexOf(request.value.status));
  
  return [
    { value: 'pending', label: 'Created', icon: 'edit_document', passed: currentIdx > 0, current: currentIdx === 0 },
    { value: 'quoted', label: 'Quoted', icon: 'request_quote', passed: currentIdx > 1, current: currentIdx === 1 },
    { value: 'approved', label: 'Active', icon: 'verified', passed: currentIdx > 2, current: currentIdx === 2 },
    { value: 'processing', label: 'Processing', icon: 'conveyor_belt', passed: currentIdx > 3, current: currentIdx === 3 },
    { value: 'inspected', label: 'QC Done', icon: 'fact_check', passed: currentIdx > 4, current: currentIdx === 4 },
    { value: 'shipped', label: 'Shipped', icon: 'local_shipping', passed: currentIdx > 5, current: currentIdx === 5 },
    { value: 'completed', label: 'Delivered', icon: 'task_alt', passed: currentIdx > 6, current: currentIdx === 6 }
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

const getStatusClass = (status) => {
  const classes = {
    'pending': 'status-pending',
    'quoted': 'status-quoted',
    'approved': 'status-quoted',
    'processing': 'status-processing',
    'production': 'status-processing',
    'shipped': 'status-processing',
    'completed': 'status-completed'
  }
  return classes[status] || 'status-pending'
}

const loadData = async () => {
  try {
    const reqId = route.params.id
    request.value = await adminService.getAdminRequestById(reqId)
    trackingLogs.value = await requestService.getTrackingLogs(reqId)
    if (request.value.status === 'completed') {
      existingRating.value = await ratingService.getByRequest(reqId)
    }
    if (userRole.value === 'admin') {
      import('../../api/supplierService.js').then(module => {
        module.supplierService.getAll().then(data => {
          suppliers.value = data
        })
      })
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

const triggerQcUpload = () => {
  qcFileInput.value.click()
}

const handleQcFiles = (e) => {
  const files = Array.from(e.target.files)
  if (qcFiles.value.length + files.length > 5) {
    alert('Maximum 5 files allowed')
    return
  }
  files.forEach(file => {
    if (file.size > 10 * 1024 * 1024) {
      alert(`${file.name} is too large (max 10MB)`)
      return
    }
    qcFiles.value.push({
      file,
      type: file.type,
      url: URL.createObjectURL(file)
    })
  })
}

const removeQcFile = (index) => {
  URL.revokeObjectURL(qcFiles.value[index].url)
  qcFiles.value.splice(index, 1)
}

const acceptQuote = async () => {
  if (!confirm('Are you sure you want to accept this quotation?')) return;
  accepting.value = true;
  try {
    await requestService.acceptQuote(request.value.id)
    await loadData()
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to accept quote')
  } finally {
    accepting.value = false
  }
}

const rejectQuote = async () => {
  if (!confirm('Are you sure you want to reject this quotation? You can create a new request if needed.')) return;
  rejecting.value = true;
  try {
    await requestService.updateRequest(request.value.id, { status: 'rejected' })
    await loadData()
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to reject quote')
  } finally {
    rejecting.value = false
  }
}

const confirmDelivery = async () => {
  if (!confirm('Have you physically received the items in good condition? This action cannot be undone.')) return;
  confirming.value = true;
  try {
    await requestService.updateRequest(request.value.id, { status: 'completed' })
    await loadData()
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to confirm delivery')
  } finally {
    confirming.value = false
  }
}

const deleteRequest = async () => {
  if (!confirm('Are you sure you want to delete this pending request? This action cannot be undone.')) return;
  deleting.value = true;
  try {
    await requestService.deleteRequest(request.value.id)
    router.push('/buyer/requests')
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to delete request')
  } finally {
    deleting.value = false
  }
}

const submitRating = async () => {
  submittingRating.value = true
  try {
    const data = await ratingService.createRating({
      request_id: request.value.id,
      supplier_id: request.value.assigned_supplier_id,
      score: ratingScore.value,
      review: ratingReview.value
    })
    existingRating.value = data
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to submit rating')
  } finally {
    submittingRating.value = false
  }
}

const openUpdateModal = () => {
  selectedStatus.value = request.value.status
  adminPrice.value = request.value.quoted_price || ''
  adminCurrency.value = request.value.currency || 'USD'
  selectedSupplier.value = request.value.assigned_supplier_id || ''
  internalNotes.value = ''
  productionProgress.value = request.value.production_progress || 0
  qcFiles.value = []
  showUpdateModal.value = true
}

const closeUpdateModal = () => {
  showUpdateModal.value = false
}

const savingStatus = ref(false)
const saveStatusUpdate = async () => {
  savingStatus.value = true
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
    qcFiles.value.forEach(f => formData.append('qc_images', f.file))

    await adminService.updateRequest(request.value.id, formData)
    
    closeUpdateModal()
    await loadData()
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to update status')
  } finally {
    savingStatus.value = false
  }
}

const goBack = () => router.back()
const navigate = (r) => { activeRoute.value = r; if (r === 'dashboard') router.push('/buyer/dashboard') }
const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; display: inline-block; line-height: 1; }
.glass-header { background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(24px); border-bottom: 1px solid rgba(255, 255, 255, 0.5); }
.glass-sidebar { background: rgba(255, 255, 255, 0.3); backdrop-filter: blur(12px); }
.glass-panel deep-shadow { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.8); box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 1); }
.glass-panel deep-shadow:hover { box-shadow: 0 20px 40px -12px rgba(53, 37, 205, 0.12), inset 0 1px 0 0 rgba(255, 255, 255, 1); }
.active-glow { box-shadow: 0 4px 12px rgba(53, 37, 205, 0.2); }
.status-quoted { background: linear-gradient(135deg, #4f46e5 0%, #4f378a 100%); box-shadow: inset 0 -2px 4px rgba(0,0,0,0.1); }
.status-processing { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); box-shadow: inset 0 -2px 4px rgba(0,0,0,0.1); }
.status-pending { background: linear-gradient(135deg, #facc15 0%, #eab308 100%); box-shadow: inset 0 -2px 4px rgba(0,0,0,0.1); }
.status-completed { background: linear-gradient(135deg, #10b981 0%, #059669 100%); box-shadow: inset 0 -2px 4px rgba(0,0,0,0.1); }
.fab-premium { background: linear-gradient(135deg, #4f46e5 0%, #4f378a 100%); box-shadow: 0 15px 30px rgba(53, 37, 205, 0.3), inset 0 1px 0 rgba(255,255,255,0.4); }
</style>
<template>
  <div class="min-h-screen bg-[#f8fafc] text-on-surface antialiased font-['Inter',_sans-serif]">
    
    <!-- Top Navigation Bar -->
    <header class="fixed top-0 left-0 right-0 z-50 glass-header flex justify-between items-center w-full px-4 sm:px-6 py-4 shadow-sm" style="height: 72px;">
      <div class="flex items-center gap-4">
        <button @click="goBack" class="p-2 hover:bg-white/50 rounded-lg transition-colors">
          <span class="material-symbols-outlined text-gray-600">arrow_back</span>
        </button>
        <span class="text-lg sm:text-xl font-bold text-[#3525cd]">Request Details</span>
      </div>
      
      <div class="flex items-center gap-2 sm:gap-3">
        <button @click="editRequest" class="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <span class="material-symbols-outlined text-gray-600 text-[18px]">edit</span>
          <span class="font-medium text-sm text-gray-700">Edit</span>
        </button>
        <button @click="openUpdateModal" class="flex items-center gap-2 px-3 sm:px-4 py-2 text-white rounded-lg transition-colors" style="background: linear-gradient(135deg, #4f46e5 0%, #3525cd 100%);">
          <span class="material-symbols-outlined text-[18px]">update</span>
          <span class="font-medium text-sm">Update Status</span>
        </button>
      </div>
    </header>

    <!-- Side Navigation Bar -->
    <aside 
      v-if="showSidebar"
      class="flex flex-col h-screen w-64 fixed left-0 glass-sidebar border-r border-white/50 z-40"
      :style="{ top: '72px', height: 'calc(100vh - 72px)' }"
    >
      <div class="mb-6 px-2 pt-4">
        <h2 class="text-xl font-black text-[#3525cd]">Global Sourcing</h2>
        <p class="text-sm text-gray-500/70">Verified Buyer</p>
      </div>

      <nav class="flex-grow flex flex-col gap-1 px-2">
        <button @click="navigate('dashboard')" :class="['flex items-center gap-4 p-4 rounded-lg transition-all duration-200', activeRoute === 'dashboard' ? 'bg-white/40 translate-x-1' : 'text-gray-600 hover:bg-white/40 hover:translate-x-1']">
          <span class="material-symbols-outlined">dashboard</span>
          <span class="font-semibold text-sm">Dashboard</span>
        </button>
        <button @click="navigate('requests')" :class="['flex items-center gap-4 p-4 text-white active-glow rounded-lg font-bold translate-x-1 transition-all duration-200 bg-[#3525cd]']">
          <span class="material-symbols-outlined">request_quote</span>
          <span class="font-semibold text-sm">Requests</span>
        </button>
        <button @click="navigate('orders')" :class="['flex items-center gap-4 p-4 rounded-lg transition-all duration-200', activeRoute === 'orders' ? 'bg-white/40 translate-x-1' : 'text-gray-600 hover:bg-white/40 hover:translate-x-1']">
          <span class="material-symbols-outlined">shopping_cart</span>
          <span class="font-semibold text-sm">Orders</span>
        </button>
        <button @click="navigate('suppliers')" :class="['flex items-center gap-4 p-4 rounded-lg transition-all duration-200', activeRoute === 'suppliers' ? 'bg-white/40 translate-x-1' : 'text-gray-600 hover:bg-white/40 hover:translate-x-1']">
          <span class="material-symbols-outlined">business</span>
          <span class="font-semibold text-sm">Suppliers</span>
        </button>
        <button @click="navigate('settings')" :class="['flex items-center gap-4 p-4 rounded-lg transition-all duration-200', activeRoute === 'settings' ? 'bg-white/40 translate-x-1' : 'text-gray-600 hover:bg-white/40 hover:translate-x-1']">
          <span class="material-symbols-outlined">settings</span>
          <span class="font-semibold text-sm">Settings</span>
        </button>
      </nav>

      <div class="px-2 pb-4">
        <button @click="createNewRequest" class="w-full fab-premium text-white py-4 rounded-lg font-semibold transition-all hover:opacity-95 active:scale-95 flex items-center justify-center gap-2">
          <span class="material-symbols-outlined text-[20px]">add</span>
          New Request
        </button>
      </div>

      <div class="flex flex-col gap-1 border-t border-white/50 pt-4 px-2 pb-4">
        <button @click="openHelp" class="flex items-center gap-4 p-4 text-gray-600 hover:text-[#3525cd] transition-colors rounded-lg hover:bg-white/30">
          <span class="material-symbols-outlined">help</span>
          <span class="font-semibold text-sm">Help Center</span>
        </button>
        <button @click="logout" class="flex items-center gap-4 p-4 text-gray-600 hover:text-red-500 transition-colors rounded-lg hover:bg-white/30">
          <span class="material-symbols-outlined">logout</span>
          <span class="font-semibold text-sm">Sign Out</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main 
      class="min-h-screen transition-all duration-300"
      :style="{ 
        paddingTop: '88px',
        paddingLeft: showSidebar ? '272px' : '16px',
        paddingRight: '16px',
        paddingBottom: isMobile ? '100px' : '32px'
      }"
    >
      <div class="w-full max-w-5xl mx-auto">
        
        <!-- Request Header Card -->
        <div class="premium-card rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Order #</span>
                <span class="text-sm font-bold text-[#3525cd]">AF-2023-9921</span>
              </div>
              <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Industrial Generator 50kVA</h1>
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-gray-500 text-[18px]">business</span>
                <span class="text-sm text-gray-600">Lagos Build Ltd. • Lagos, Nigeria</span>
              </div>
            </div>
            <span class="status-quoted font-semibold text-xs px-3 py-1 rounded-full text-white self-start">Quoted</span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
            <div>
              <p class="text-xs text-gray-500 mb-1">Category</p>
              <p class="font-semibold text-sm text-gray-800">Machinery</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-1">Request Date</p>
              <p class="font-semibold text-sm text-gray-800">Oct 25, 2023</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-1">Quantity</p>
              <p class="font-semibold text-sm text-gray-800">2 units</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-1">Est. Volume</p>
              <p class="font-semibold text-sm text-[#3525cd]">$4,500.00</p>
            </div>
          </div>
        </div>

        <!-- Two Column Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          
          <!-- Left Column: Product Details & Specs -->
          <div class="lg:col-span-2 space-y-4 sm:space-y-6">
            
            <!-- Product Details -->
            <div class="premium-card rounded-xl p-4 sm:p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-[#3525cd]/10 rounded-xl flex items-center justify-center">
                  <span class="material-symbols-outlined text-[#3525cd]">inventory_2</span>
                </div>
                <h2 class="text-lg font-bold text-gray-800">Product Details</h2>
              </div>
              <div class="space-y-3">
                <div class="flex justify-between py-2 border-b border-gray-100">
                  <span class="text-sm text-gray-600">Product Name</span>
                  <span class="text-sm font-semibold text-gray-800">Industrial Generator 50kVA</span>
                </div>
                <div class="flex justify-between py-2 border-b border-gray-100">
                  <span class="text-sm text-gray-600">Category</span>
                  <span class="text-sm font-semibold text-gray-800">Machinery</span>
                </div>
                <div class="flex justify-between py-2 border-b border-gray-100">
                  <span class="text-sm text-gray-600">Quantity</span>
                  <span class="text-sm font-semibold text-gray-800">2 units</span>
                </div>
                <div class="flex justify-between py-2">
                  <span class="text-sm text-gray-600">Budget Range</span>
                  <span class="text-sm font-semibold text-[#3525cd]">$4,000 - $5,000</span>
                </div>
              </div>
            </div>

            <!-- Specifications -->
            <div class="premium-card rounded-xl p-4 sm:p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-[#3525cd]/10 rounded-xl flex items-center justify-center">
                  <span class="material-symbols-outlined text-[#3525cd]">description</span>
                </div>
                <h2 class="text-lg font-bold text-gray-800">Specifications</h2>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-sm text-gray-700 leading-relaxed">
                  Diesel-powered industrial generator with automatic transfer switch. 
                  Must comply with ISO 8528 standards. CE certification required. 
                  Include installation manual and 2-year warranty. Palletized shipping preferred.
                </p>
              </div>
            </div>

            <!-- Supplier Quotes -->
            <div class="premium-card rounded-xl p-4 sm:p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-[#3525cd]/10 rounded-xl flex items-center justify-center">
                    <span class="material-symbols-outlined text-[#3525cd]">group</span>
                  </div>
                  <h2 class="text-lg font-bold text-gray-800">Supplier Quotes (3)</h2>
                </div>
                <span class="text-xs text-gray-500">Sorted by price</span>
              </div>

              <div class="space-y-3">
                <!-- Quote 1 -->
                <div class="border border-gray-200 rounded-lg p-4 hover:border-[#3525cd] transition-colors cursor-pointer">
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span class="material-symbols-outlined text-blue-600 text-[20px]">business</span>
                      </div>
                      <div>
                        <p class="font-semibold text-sm text-gray-800">Yiwu Global Manufacturing Ltd.</p>
                        <p class="text-xs text-gray-500">Yiwu, China • 4.8★</p>
                      </div>
                    </div>
                    <span class="text-lg font-bold text-[#3525cd]">$4,200</span>
                  </div>
                  <p class="text-xs text-gray-600 mb-3">Lead time: 15 days • MOQ: 1 unit • FOB Price</p>
                  <div class="flex gap-2">
                    <button class="flex-1 px-3 py-2 bg-[#3525cd] text-white text-xs font-semibold rounded-lg hover:opacity-95 transition-opacity">
                      Accept Quote
                    </button>
                    <button class="px-3 py-2 border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>

                <!-- Quote 2 -->
                <div class="border border-gray-200 rounded-lg p-4 hover:border-[#3525cd] transition-colors cursor-pointer">
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span class="material-symbols-outlined text-purple-600 text-[20px]">business</span>
                      </div>
                      <div>
                        <p class="font-semibold text-sm text-gray-800">Shenzhen Precision Parts</p>
                        <p class="text-xs text-gray-500">Shenzhen, China • 4.6★</p>
                      </div>
                    </div>
                    <span class="text-lg font-bold text-[#3525cd]">$4,500</span>
                  </div>
                  <p class="text-xs text-gray-600 mb-3">Lead time: 12 days • MOQ: 2 units • CIF Price</p>
                  <div class="flex gap-2">
                    <button class="flex-1 px-3 py-2 bg-[#3525cd] text-white text-xs font-semibold rounded-lg hover:opacity-95 transition-opacity">
                      Accept Quote
                    </button>
                    <button class="px-3 py-2 border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>

                <!-- Quote 3 -->
                <div class="border border-gray-200 rounded-lg p-4 hover:border-[#3525cd] transition-colors cursor-pointer">
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <span class="material-symbols-outlined text-green-600 text-[20px]">business</span>
                      </div>
                      <div>
                        <p class="font-semibold text-sm text-gray-800">Guangzhou Textile Export Corp</p>
                        <p class="text-xs text-gray-500">Guangzhou, China • 4.5★</p>
                      </div>
                    </div>
                    <span class="text-lg font-bold text-[#3525cd]">$4,800</span>
                  </div>
                  <p class="text-xs text-gray-600 mb-3">Lead time: 20 days • MOQ: 1 unit • FOB Price</p>
                  <div class="flex gap-2">
                    <button class="flex-1 px-3 py-2 bg-[#3525cd] text-white text-xs font-semibold rounded-lg hover:opacity-95 transition-opacity">
                      Accept Quote
                    </button>
                    <button class="px-3 py-2 border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Timeline & Actions -->
          <div class="space-y-4 sm:space-y-6">
            
            <!-- Status Timeline -->
            <div class="premium-card rounded-xl p-4 sm:p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-[#3525cd]/10 rounded-xl flex items-center justify-center">
                  <span class="material-symbols-outlined text-[#3525cd]">timeline</span>
                </div>
                <h2 class="text-lg font-bold text-gray-800">Status Timeline</h2>
              </div>

              <div class="space-y-4">
                <div class="flex gap-3">
                  <div class="flex flex-col items-center">
                    <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span class="material-symbols-outlined text-white text-[16px]">check</span>
                    </div>
                    <div class="w-0.5 h-full bg-gray-200 mt-2"></div>
                  </div>
                  <div class="flex-1 pb-4">
                    <p class="font-semibold text-sm text-gray-800">Request Created</p>
                    <p class="text-xs text-gray-500">Oct 25, 2023 • 10:30 AM</p>
                  </div>
                </div>

                <div class="flex gap-3">
                  <div class="flex flex-col items-center">
                    <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span class="material-symbols-outlined text-white text-[16px]">check</span>
                    </div>
                    <div class="w-0.5 h-full bg-gray-200 mt-2"></div>
                  </div>
                  <div class="flex-1 pb-4">
                    <p class="font-semibold text-sm text-gray-800">Suppliers Notified</p>
                    <p class="text-xs text-gray-500">Oct 25, 2023 • 11:00 AM</p>
                  </div>
                </div>

                <div class="flex gap-3">
                  <div class="flex flex-col items-center">
                    <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span class="material-symbols-outlined text-white text-[16px]">check</span>
                    </div>
                    <div class="w-0.5 h-full bg-gray-200 mt-2"></div>
                  </div>
                  <div class="flex-1 pb-4">
                    <p class="font-semibold text-sm text-gray-800">Quotes Received</p>
                    <p class="text-xs text-gray-500">Oct 26, 2023 • 02:15 PM</p>
                  </div>
                </div>

                <div class="flex gap-3">
                  <div class="flex flex-col items-center">
                    <div class="w-8 h-8 bg-[#3525cd] rounded-full flex items-center justify-center ring-4 ring-[#3525cd]/20">
                      <span class="material-symbols-outlined text-white text-[16px]">radio_button_checked</span>
                    </div>
                  </div>
                  <div class="flex-1">
                    <p class="font-semibold text-sm text-[#3525cd]">Awaiting Decision</p>
                    <p class="text-xs text-gray-500">Current status</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="premium-card rounded-xl p-4 sm:p-6">
              <h3 class="font-bold text-gray-800 mb-4">Quick Actions</h3>
              <div class="space-y-2">
                <button @click="openUpdateModal" class="w-full flex items-center gap-3 p-3 bg-[#3525cd]/5 hover:bg-[#3525cd]/10 rounded-lg transition-colors">
                  <span class="material-symbols-outlined text-[#3525cd]">update</span>
                  <span class="text-sm font-semibold text-[#3525cd]">Update Status</span>
                </button>
                <button @click="editRequest" class="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <span class="material-symbols-outlined text-gray-600">edit</span>
                  <span class="text-sm font-semibold text-gray-700">Edit Request</span>
                </button>
                <button @click="downloadPDF" class="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <span class="material-symbols-outlined text-gray-600">download</span>
                  <span class="text-sm font-semibold text-gray-700">Download PDF</span>
                </button>
                <button @click="shareRequest" class="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <span class="material-symbols-outlined text-gray-600">share</span>
                  <span class="text-sm font-semibold text-gray-700">Share Request</span>
                </button>
              </div>
            </div>

            <!-- Contact Info -->
            <div class="premium-card rounded-xl p-4 sm:p-6">
              <h3 class="font-bold text-gray-800 mb-4">Buyer Contact</h3>
              <div class="flex items-center gap-3 mb-3">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgjcDm9LUEt_9KYagQYGByJCOUAJOjnoylLj8Hz1fqa6l-Cb04JkhmiHs-34pwid1kWfCXm72UD0Z77HG84YXM1D36P69YKhYAzaUmjvgICMjtZ_SHa2cKUe8r1XD0J6LU8e8ERNbFrHI4y7DenwNcby71OxIRoV-HKCJPIW7mtwjLmvaQRKXSc00H_Ibwdlum73GIIOtW8t6U3jwrQwjuxgb6yj9-JBojC7so2N3pDo7CI6oUzh26FBjNjmNTawdZQeg7R0KnutpZ" 
                  alt="Buyer" 
                  class="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p class="font-semibold text-sm text-gray-800">Lagos Build Ltd.</p>
                  <p class="text-xs text-gray-500">Verified Buyer</p>
                </div>
              </div>
              <div class="space-y-2">
                <div class="flex items-center gap-2 text-sm text-gray-600">
                  <span class="material-symbols-outlined text-[18px]">mail</span>
                  <span>contact@lagosbuild.ng</span>
                </div>
                <div class="flex items-center gap-2 text-sm text-gray-600">
                  <span class="material-symbols-outlined text-[18px]">phone</span>
                  <span>+234 812 345 6789</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </main>

    <!-- Update Status Modal -->
    <div 
      v-if="showUpdateModal" 
      class="fixed inset-0 z-[100] flex items-center justify-center p-4"
      @click.self="closeUpdateModal"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      
      <!-- Modal Content -->
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" style="animation: modalSlideIn 0.3s ease-out;">
        
        <!-- Modal Header -->
        <div class="sticky top-0 bg-white border-b border-gray-100 p-4 sm:p-6 rounded-t-2xl">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg sm:text-xl font-bold text-gray-800">Update Request Status</h2>
              <p class="text-xs sm:text-sm text-gray-500 mt-1">Order #AF-2023-9921</p>
            </div>
            <button @click="closeUpdateModal" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <span class="material-symbols-outlined text-gray-600">close</span>
            </button>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="p-4 sm:p-6 space-y-4">
          
          <!-- Status Selection -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-3">Update Status to:</label>
            <div class="grid grid-cols-2 gap-2">
              <button 
                v-for="status in statusOptions" 
                :key="status.value"
                @click="selectedStatus = status.value"
                :class="[
                  'flex items-center gap-2 p-3 rounded-lg border-2 transition-all',
                  selectedStatus === status.value 
                    ? 'border-[#3525cd] bg-[#3525cd]/5' 
                    : 'border-gray-200 hover:border-gray-300'
                ]"
              >
                <span class="material-symbols-outlined" :class="selectedStatus === status.value ? 'text-[#3525cd]' : 'text-gray-400'">
                  {{ status.icon }}
                </span>
                <span class="text-sm font-semibold" :class="selectedStatus === status.value ? 'text-[#3525cd]' : 'text-gray-700'">
                  {{ status.label }}
                </span>
              </button>
            </div>
          </div>

          <!-- Assign Supplier -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Assign Supplier (Optional)
            </label>
            <div class="relative">
              <select 
                v-model="selectedSupplier"
                class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3525cd] focus:border-transparent outline-none transition-all appearance-none bg-white text-sm"
              >
                <option value="">Select supplier...</option>
                <option value="yiwu">Yiwu Global Manufacturing Ltd.</option>
                <option value="shenzhen">Shenzhen Precision Parts</option>
                <option value="guangzhou">Guangzhou Textile Export Corp</option>
              </select>
              <span class="material-symbols-outlined absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
            </div>
          </div>

          <!-- Internal Notes -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Internal Notes
            </label>
            <textarea 
              v-model="internalNotes"
              rows="4"
              placeholder="Add any internal notes about this status update..."
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3525cd] focus:border-transparent outline-none transition-all resize-none text-sm"
            ></textarea>
          </div>

        </div>

        <!-- Modal Footer -->
        <div class="sticky bottom-0 bg-gray-50 border-t border-gray-100 p-4 sm:p-6 rounded-b-2xl">
          <div class="flex gap-3">
            <button 
              @click="closeUpdateModal"
              class="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              @click="saveStatusUpdate"
              class="flex-1 px-4 py-3 text-white font-semibold rounded-lg transition-all hover:opacity-95"
              style="background: linear-gradient(135deg, #4f46e5 0%, #3525cd 100%);"
            >
              Save Changes
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- Floating Action Button - Mobile Only -->
    <button 
      v-if="isMobile"
      @click="openUpdateModal" 
      class="fixed fab-premium text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 shadow-2xl"
      :style="{
        bottom: '80px',
        right: '24px',
        width: '56px',
        height: '56px'
      }"
    >
      <span class="material-symbols-outlined" style="font-size: 24px;">update</span>
    </button>

    <!-- Bottom Navigation - Mobile Only -->
    <nav 
      v-if="isMobile"
      class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3 px-2 z-40"
    >
      <button @click="navigate('dashboard')" class="flex flex-col items-center text-gray-600 hover:text-[#3525cd] p-1">
        <span class="material-symbols-outlined text-[20px]">dashboard</span>
        <span class="text-[10px] font-semibold">Home</span>
      </button>
      <button @click="navigate('requests')" class="flex flex-col items-center text-[#3525cd] p-1">
        <span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">request_quote</span>
        <span class="text-[10px] font-semibold">Requests</span>
      </button>
      <button @click="navigate('orders')" class="flex flex-col items-center text-gray-600 hover:text-[#3525cd] p-1">
        <span class="material-symbols-outlined text-[20px]">shopping_cart</span>
        <span class="text-[10px] font-semibold">Orders</span>
      </button>
      <button @click="navigate('suppliers')" class="flex flex-col items-center text-gray-600 hover:text-[#3525cd] p-1">
        <span class="material-symbols-outlined text-[20px]">business</span>
        <span class="text-[10px] font-semibold">Suppliers</span>
      </button>
      <button @click="navigate('settings')" class="flex flex-col items-center text-gray-600 hover:text-[#3525cd] p-1">
        <span class="material-symbols-outlined text-[20px]">settings</span>
        <span class="text-[10px] font-semibold">Settings</span>
      </button>
    </nav>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

// Form State
const selectedStatus = ref('quoted')
const selectedSupplier = ref('')
const internalNotes = ref('')
const showUpdateModal = ref(false)
const activeRoute = ref('requests')

// Device Detection
const isTablet = ref(false)
const isMobile = ref(false)
const isDesktop = ref(false)
const windowWidth = ref(0)

const updateDeviceType = () => {
  windowWidth.value = window.innerWidth
  
  if (windowWidth.value < 768) {
    isMobile.value = true
    isTablet.value = false
    isDesktop.value = false
  } else if (windowWidth.value >= 768 && windowWidth.value < 1024) {
    isMobile.value = false
    isTablet.value = true
    isDesktop.value = false
  } else {
    isMobile.value = false
    isTablet.value = false
    isDesktop.value = true
  }
}

const showSidebar = computed(() => {
  return isTablet.value || isDesktop.value
})

// Status Options
const statusOptions = [
  { value: 'quoted', label: 'Quoted', icon: 'request_quote' },
  { value: 'processing', label: 'Processing', icon: 'conveyor_belt' },
  { value: 'inspected', label: 'Inspected', icon: 'verified' },
  { value: 'shipped', label: 'Shipped', icon: 'local_shipping' }
]

onMounted(() => {
  updateDeviceType()
  window.addEventListener('resize', updateDeviceType)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateDeviceType)
})

// Methods
const goBack = () => {
  console.log('Navigate back to requests list')
}

const navigate = (route) => {
  console.log(`Navigating to: ${route}`)
  activeRoute.value = route
}

const editRequest = () => {
  console.log('Edit request clicked')
}

const openUpdateModal = () => {
  showUpdateModal.value = true
  document.body.style.overflow = 'hidden'
}

const closeUpdateModal = () => {
  showUpdateModal.value = false
  document.body.style.overflow = ''
}

const saveStatusUpdate = () => {
  console.log('Saving status update:', {
    status: selectedStatus.value,
    supplier: selectedSupplier.value,
    notes: internalNotes.value
  })
  closeUpdateModal()
}

const downloadPDF = () => {
  console.log('Download PDF clicked')
}

const shareRequest = () => {
  console.log('Share request clicked')
}

const createNewRequest = () => {
  console.log('Create new request')
}

const openHelp = () => {
  console.log('Open help center')
}

const logout = () => {
  console.log('Logout')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  display: inline-block;
  line-height: 1;
}

.glass-header {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
}

.glass-sidebar {
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.premium-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 1);
}

.premium-card:hover {
  box-shadow: 0 20px 40px -12px rgba(53, 37, 205, 0.12), inset 0 1px 0 0 rgba(255, 255, 255, 1);
}

.active-glow {
  box-shadow: 0 4px 12px rgba(53, 37, 205, 0.2);
}

.status-quoted {
  background: linear-gradient(135deg, #4f46e5 0%, #3525cd 100%);
  box-shadow: inset 0 -2px 4px rgba(0,0,0,0.1);
}

.fab-premium {
  background: linear-gradient(135deg, #4f46e5 0%, #3525cd 100%);
  box-shadow: 0 15px 30px rgba(53, 37, 205, 0.3), inset 0 1px 0 rgba(255,255,255,0.4);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
<template>
  <BuyerLayout activeRoute="sourcing">
    <div class="w-full max-w-5xl mx-auto py-8">
      
      <!-- Header Section -->
      <div class="flex flex-col items-center justify-center text-center mb-12 mt-8">
        <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
          Global <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#4f378a] to-[#4f46e5]">Sourcing</span> Made Easy
        </h1>
        <p class="text-lg text-gray-500 max-w-2xl">Discover top-tier manufacturers and suppliers tailored to your business needs.</p>
      </div>

      <!-- Action Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        
        <div @click="$router.push('/buyer/rfq/create')" class="group bg-white rounded-2xl p-8 border-2 border-transparent hover:border-[#4f378a] shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col items-center text-center relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-[#4f378a]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div class="w-16 h-16 bg-[#4f378a]/10 rounded-2xl flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform">
            <span class="material-symbols-outlined text-[#4f378a] text-3xl">add_circle</span>
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-2 relative z-10">Post a Request</h3>
          <p class="text-gray-500 text-sm relative z-10">Tell us what you need, and we'll match you with verified suppliers.</p>
        </div>

        <div @click="$router.push('/buyer/suppliers')" class="group bg-white rounded-2xl p-8 border-2 border-transparent hover:border-[#4f378a] shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col items-center text-center relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-[#4f378a]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div class="w-16 h-16 bg-[#4f378a]/10 rounded-2xl flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform">
            <span class="material-symbols-outlined text-[#4f378a] text-3xl">manage_search</span>
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-2 relative z-10">Browse Suppliers</h3>
          <p class="text-gray-500 text-sm relative z-10">Explore our directory of verified factories and trading companies.</p>
        </div>

      </div>

    </div>
  </BuyerLayout>
</template>

<script setup>
import BuyerLayout from '../../components/layout/BuyerLayout.vue'
</script>

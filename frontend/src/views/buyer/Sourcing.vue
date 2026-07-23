<template>
  <BuyerLayout activeRoute="sourcing">
    <div class="w-full max-w-5xl mx-auto py-6 sm:py-10">
      
      <!-- Header Section -->
      <div class="flex flex-col items-center justify-center text-center mb-10 sm:mb-14">
        <h1 class="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4 leading-tight">
          Global <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Sourcing</span> Made Easy
        </h1>
        <p class="text-xs sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
          Directly connect with top-tier verified Chinese manufacturers and request tailored quotations for your business.
        </p>
      </div>

      <!-- Action Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
        
        <div 
          @click="$router.push('/buyer/rfq/create')" 
          class="group bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-indigo-500/5 hover:shadow-2xl hover:shadow-indigo-500/15 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col items-center text-center relative overflow-hidden"
        >
          <div class="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
            <span class="material-symbols-outlined text-3xl">add_circle</span>
          </div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Create RFQ Request</h3>
          <p class="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">Specify product details, volume, and target budget to receive competitive factory quotes.</p>
        </div>

        <div 
          @click="$router.push('/buyer/suppliers')" 
          class="group bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-indigo-500/5 hover:shadow-2xl hover:shadow-indigo-500/15 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col items-center text-center relative overflow-hidden"
        >
          <div class="w-16 h-16 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 rounded-2xl flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
            <span class="material-symbols-outlined text-3xl">manage_search</span>
          </div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Browse Factory Directory</h3>
          <p class="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">Explore verified suppliers, factory certifications, and order histories.</p>
        </div>

      </div>

    </div>
  </BuyerLayout>
</template>

<script setup>
import BuyerLayout from '../../components/layout/BuyerLayout.vue'
</script>

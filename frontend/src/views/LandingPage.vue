<template>
  <div class="min-h-screen bg-[#fdf7ff] text-[#1d1b20] font-['Inter',_sans-serif] overflow-x-hidden selection:bg-[#4f46e5]/20">
    
    <!-- HEADER -->
    <header class="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-sm transition-all duration-300 h-[72px] flex items-center">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center w-full max-w-7xl">
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4f46e5] to-[#3525cd] flex items-center justify-center shadow-lg">
            <span class="material-symbols-outlined text-white" style="font-variation-settings: 'FILL' 1;">badge</span>
          </div>
          <span class="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-slate-900 to-[#4f46e5] bg-clip-text text-transparent tracking-tight">AfriChina Bridge</span>
        </div>
        
        <nav class="hidden md:flex items-center gap-8 font-semibold text-gray-600">
          <a href="#features" class="hover:text-[#4f46e5] transition-colors">Features</a>
          <a href="#how-it-works" class="hover:text-[#4f46e5] transition-colors">How it Works</a>
          <a href="#testimonials" class="hover:text-[#4f46e5] transition-colors">Testimonials</a>
        </nav>
        
        <div class="flex items-center gap-3">
          <LanguageSwitcher />
          <button 
            class="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl border-2 border-[#4f46e5] text-[#4f46e5] hover:bg-[#4f46e5]/10 transition-all duration-200 min-h-[44px]"
            @click="$router.push('/login')"
          >
            Login
          </button>
          <button 
            class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#3525cd] text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all duration-200 min-h-[44px]"
            @click="$router.push('/login')"
          >
            Daftar
          </button>
        </div>
      </div>
    </header>

    <!-- HERO SECTION -->
    <section class="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden px-4">
      <div class="absolute inset-0 z-0">
        <div class="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div class="absolute top-40 right-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div class="absolute -bottom-8 left-40 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>
      
      <div class="container mx-auto max-w-7xl relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div class="space-y-8 text-center lg:text-left">
          <h1 class="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight text-slate-900">
            {{ $t('landing.title') }}
          </h1>
          <p class="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0">
            {{ $t('landing.subtitle') }}
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <button 
              class="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#3525cd] text-white shadow-xl shadow-indigo-200 hover:shadow-indigo-300 transition-all duration-200 min-h-[56px]"
              @click="$router.push('/login')"
            >
              {{ $t('landing.cta_start') }}
            </button>
            <button 
              class="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl border-2 border-[#4f46e5] text-[#4f46e5] hover:bg-[#4f46e5]/10 transition-all duration-200 min-h-[56px]"
              @click="scrollTo('#how-it-works')"
            >
              {{ $t('landing.cta_learn') }}
            </button>
          </div>
          <div class="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200/60 max-w-lg mx-auto lg:mx-0">
            <div>
              <p class="text-3xl font-black text-[#4f46e5]">500+</p>
              <p class="text-xs text-gray-500 font-semibold uppercase tracking-wide mt-1">{{ $t('landing.stats_suppliers') }}</p>
            </div>
            <div>
              <p class="text-3xl font-black text-[#4f46e5]">15+</p>
              <p class="text-xs text-gray-500 font-semibold uppercase tracking-wide mt-1">{{ $t('landing.stats_countries') }}</p>
            </div>
            <div>
              <p class="text-3xl font-black text-[#4f46e5]">98%</p>
              <p class="text-xs text-gray-500 font-semibold uppercase tracking-wide mt-1">{{ $t('landing.stats_success') }}</p>
            </div>
          </div>
        </div>
        
        <!-- PREVIEW CARD (Timeline) -->
        <div class="relative hidden lg:block">
          <div class="absolute inset-0 bg-gradient-to-tr from-[#4f46e5]/20 to-transparent rounded-3xl transform rotate-3"></div>
          <div class="relative transform -rotate-1 bg-slate-900 border border-gray-800 text-white shadow-2xl rounded-3xl p-8 bg-white/10 backdrop-blur-xl">
            <div class="flex items-center gap-3 border-b border-gray-800 pb-4 mb-6">
              <span class="material-symbols-outlined text-green-400">check_circle</span>
              <span class="font-semibold">Live Tracking View</span>
            </div>
            <div class="space-y-6 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
              <div v-for="(step, i) in ['Request Placed', 'Options Quoted', 'Payment Verified', 'Production QC', 'Shipped to Africa']" :key="i" class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div class="flex items-center justify-center w-8 h-8 rounded-full border border-white bg-slate-800 text-slate-300 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <span class="material-symbols-outlined text-[14px]">
                    {{ i === 0 ? 'request_quote' : i === 1 ? 'list_alt' : i === 2 ? 'payments' : i === 3 ? 'factory' : 'flight_takeoff' }}
                  </span>
                </div>
                <div class="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-700 bg-slate-800/50 shadow">
                  <div class="font-bold text-slate-200">{{ step }}</div>
                  <div class="text-xs text-slate-400">Completed seamlessly</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURES -->
    <section id="features" class="py-24 bg-white/50">
      <div class="container mx-auto px-4 max-w-7xl">
        <div class="text-center max-w-3xl mx-auto mb-16">
          <h2 class="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Why AfriChina Bridge?</h2>
          <p class="text-lg text-gray-600">We eliminate friction in cross-continental B2B trade through structured and transparent processes.</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard icon="verified_user" iconBg="bg-green-100" iconColor="text-green-600" :title="$t('landing.features.trust')" :desc="$t('landing.features.trust_desc')" />
          <FeatureCard icon="visibility" iconBg="bg-blue-100" iconColor="text-blue-600" :title="$t('landing.features.transparency')" :desc="$t('landing.features.transparency_desc')" />
          <FeatureCard icon="forum" iconBg="bg-purple-100" iconColor="text-purple-600" :title="$t('landing.features.communication')" :desc="$t('landing.features.communication_desc')" />
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section id="how-it-works" class="py-24">
      <div class="container mx-auto px-4 max-w-7xl">
        <h2 class="text-3xl md:text-4xl font-extrabold text-slate-900 mb-16 text-center">{{ $t('landing.how_it_works.title') }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          <div class="hidden md:block absolute top-12 left-1/8 right-1/8 h-0.5 bg-gradient-to-r from-[#4f46e5]/20 via-[#4f46e5] to-[#4f46e5]/20 z-0"></div>
          
          <div class="relative z-10 text-center" v-for="i in 4" :key="i">
            <div class="w-24 h-24 mx-auto bg-white rounded-full shadow-xl border-4 border-[#fdf7ff] flex items-center justify-center mb-6">
              <span class="text-3xl font-black bg-gradient-to-br from-[#4f46e5] to-[#3525cd] bg-clip-text text-transparent">{{ i }}</span>
            </div>
            <h4 class="text-xl font-bold text-slate-900 mb-2">{{ $t(`landing.how_it_works.step${i}`) }}</h4>
            <p class="text-gray-600 text-sm px-4">{{ $t(`landing.how_it_works.step${i}_desc`) }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- TESTIMONIALS -->
    <section id="testimonials" class="py-24 bg-slate-900 text-white rounded-t-[3rem]">
      <div class="container mx-auto px-4 max-w-7xl">
        <h2 class="text-3xl md:text-4xl font-extrabold text-center mb-16">{{ $t('landing.testimonials.title') }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="(t, i) in testimonials" :key="i" class="bg-slate-800 p-8 rounded-3xl border border-slate-700">
            <div class="flex gap-1 text-yellow-400 mb-6">
              <span v-for="s in 5" :key="s" class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
            </div>
            <p class="text-slate-300 italic mb-8">"{{ t.quote }}"</p>
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center font-bold text-xl">{{ t.name.charAt(0) }}</div>
              <div>
                <p class="font-bold">{{ t.name }}</p>
                <p class="text-sm text-slate-400">{{ t.country }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-24 bg-gradient-to-br from-[#4f46e5] to-[#3525cd]">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-4xl md:text-5xl font-extrabold text-white mb-8">{{ $t('landing.cta_footer') }}</h2>
        <button 
          class="inline-flex items-center justify-center px-12 py-5 text-xl font-bold rounded-xl bg-white text-[#4f46e5] shadow-xl hover:shadow-2xl transition-all duration-200 min-h-[56px]"
          @click="$router.push('/login')"
        >
          {{ $t('landing.cta_footer_button') }}
        </button>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="bg-slate-950 text-slate-400 py-12">
      <div class="container mx-auto px-4 max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <span class="material-symbols-outlined text-white text-sm" style="font-variation-settings: 'FILL' 1;">badge</span>
          </div>
          <span class="text-white font-bold tracking-tight">AfriChina Bridge</span>
        </div>
        <p class="text-sm">© 2026 AfriChina Bridge. All rights reserved.</p>
        <div class="flex gap-4 text-sm">
          <a href="#" class="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" class="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';

import LanguageSwitcher from '../components/LanguageSwitcher.vue';

// ===== KOMPONEN LOKAL (agar tidak bergantung pada file eksternal) =====

// FeatureCard komponen sederhana
const FeatureCard = {
  props: ['icon', 'iconBg', 'iconColor', 'title', 'desc'],
  template: `
    <div class="bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_20px_50px_rgba(79,70,229,0.10)] transition-all duration-300 hover:shadow-[0_30px_60px_rgba(79,70,229,0.18)] p-8 text-center group">
      <div class="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform" :class="iconBg">
        <span class="material-symbols-outlined text-3xl" :class="iconColor">{{ icon }}</span>
      </div>
      <h3 class="text-xl font-bold mb-3 text-slate-900">{{ title }}</h3>
      <p class="text-gray-600">{{ desc }}</p>
    </div>
  `
};

// ===== DATA =====
const testimonials = [
  { name: 'Kwame Osei', country: 'Ghana', quote: 'Finding verified suppliers used to be a nightmare. AfriChina Bridge gave me the transparency I needed. Their QC photos from the factory floor saved my business.' },
  { name: 'Fatoumata Diallo', country: 'Senegal', quote: 'Language barriers are gone. I type my specs, and the platform handles the negotiation. The shipping timeline is perfectly integrated.' },
  { name: 'Emmanuel Kiprono', country: 'Kenya', quote: 'The most reliable B2B platform I have used. I love how I can request a quote without exposing my identity until the deal is finalized.' }
];

// ===== METHODS =====
const scrollTo = (selector) => {
  const el = document.querySelector(selector);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
};
</script>

<style>
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
.animate-blob {
  animation: blob 7s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}
.animation-delay-4000 {
  animation-delay: 4s;
}
</style>
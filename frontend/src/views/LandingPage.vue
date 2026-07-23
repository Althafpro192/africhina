<template>
  <div :class="['min-h-screen font-[\'Inter\',_sans-serif] transition-colors duration-300 overflow-x-hidden selection:bg-indigo-500/20', isDark ? 'dark bg-[#0b0f19] text-slate-100' : 'bg-[#f8f9ff] text-slate-900']">
    
    <!-- HEADER -->
    <header class="fixed top-0 left-0 right-0 z-50 bg-white/85 dark:bg-[#0b0f19]/85 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/80 shadow-sm transition-all duration-300 h-[76px] flex items-center">
      <div class="container mx-auto px-6 sm:px-8 lg:px-12 flex justify-between items-center w-full max-w-7xl">
        
        <!-- LOGO -->
        <div class="flex items-center gap-3 cursor-pointer group" @click="$router.push('/')">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-200">
            <span class="material-symbols-outlined text-white text-2xl" style="font-variation-settings: 'FILL' 1;">account_tree</span>
          </div>
          <span class="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            AfriChina Bridge
          </span>
        </div>
        
        <!-- NAV LINKS -->
        <nav class="hidden md:flex items-center gap-8 font-semibold text-slate-600 dark:text-slate-300 text-sm">
          <a href="#features" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{{ $t('landing.nav_features') }}</a>
          <a href="#how-it-works" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{{ $t('landing.nav_how_it_works') }}</a>
          <a href="#testimonials" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{{ $t('landing.nav_testimonials') }}</a>
        </nav>
        
        <!-- ACTIONS & CONTROLS -->
        <div class="flex items-center gap-3">
          <!-- Dark Mode Toggle Button -->
          <button 
            @click="toggleTheme" 
            class="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 shadow-sm flex items-center justify-center cursor-pointer"
            :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
          >
            <span class="material-symbols-outlined text-xl">{{ isDark ? 'light_mode' : 'dark_mode' }}</span>
          </button>

          <!-- Language Switcher -->
          <LanguageSwitcher />

          <!-- Login Button -->
          <button 
            class="hidden sm:inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 min-h-[44px]"
            @click="$router.push('/login')"
          >
            {{ $t('landing.nav_login') }}
          </button>

          <!-- Register Button -->
          <button 
            class="inline-flex items-center justify-center px-5 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 min-h-[44px]"
            @click="$router.push('/login')"
          >
            {{ $t('landing.nav_register') }}
          </button>
        </div>
      </div>
    </header>

    <!-- HERO SECTION -->
    <section class="relative pt-32 pb-20 lg:pt-48 lg:pb-36 overflow-hidden px-6 sm:px-8 lg:px-12">
      <!-- Background Blobs -->
      <div class="absolute inset-0 z-0 pointer-events-none">
        <div class="absolute top-20 left-10 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-600/15 rounded-full filter blur-3xl animate-blob"></div>
        <div class="absolute top-40 right-10 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/15 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
        <div class="absolute -bottom-8 left-1/3 w-96 h-96 bg-pink-400/20 dark:bg-pink-600/15 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>
      
      <div class="container mx-auto max-w-7xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <!-- Hero Text -->
        <div class="lg:col-span-7 space-y-8 text-center lg:text-left">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm font-semibold backdrop-blur-md">
            <span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            <span>B2B Cross-Border Supply Chain Platform</span>
          </div>

          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.15] tracking-tight text-slate-900 dark:text-white">
            {{ $t('landing.title') }}
          </h1>

          <p class="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            {{ $t('landing.subtitle') }}
          </p>

          <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
            <button 
              class="inline-flex items-center justify-center px-8 py-4 text-base sm:text-lg font-bold rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 min-h-[56px]"
              @click="$router.push('/login')"
            >
              <span>{{ $t('landing.cta_start') }}</span>
              <span class="material-symbols-outlined ml-2 text-xl">arrow_forward</span>
            </button>

            <button 
              class="inline-flex items-center justify-center px-8 py-4 text-base sm:text-lg font-semibold rounded-2xl border-2 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 min-h-[56px]"
              @click="scrollTo('#how-it-works')"
            >
              {{ $t('landing.cta_learn') }}
            </button>
          </div>

          <!-- Statistics Bar -->
          <div class="grid grid-cols-3 gap-6 pt-8 border-t border-slate-200 dark:border-slate-800 max-w-lg mx-auto lg:mx-0">
            <div>
              <p class="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">500+</p>
              <p class="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mt-1">{{ $t('landing.stats_suppliers') }}</p>
            </div>
            <div>
              <p class="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">15+</p>
              <p class="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mt-1">{{ $t('landing.stats_countries') }}</p>
            </div>
            <div>
              <p class="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">98%</p>
              <p class="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mt-1">{{ $t('landing.stats_success') }}</p>
            </div>
          </div>
        </div>

        <!-- Hero Preview (Live Tracking Glass Panel) -->
        <div class="lg:col-span-5 relative hidden lg:block">
          <div class="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-3xl transform rotate-2 blur-sm"></div>
          <div class="relative bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white shadow-2xl rounded-3xl p-7 backdrop-blur-xl">
            <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
              <div class="flex items-center gap-3">
                <span class="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                <span class="font-bold text-sm text-slate-900 dark:text-white tracking-wide">{{ $t('landing.tracking_title') }}</span>
              </div>
              <span class="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">Active RFQ #9402</span>
            </div>

            <div class="space-y-4">
              <div 
                v-for="(step, i) in timelineSteps" 
                :key="i" 
                class="flex items-center gap-4 p-3.5 rounded-2xl border transition-all duration-200"
                :class="i === 4 ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800/80' : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800/60'"
              >
                <div 
                  class="flex items-center justify-center w-9 h-9 rounded-xl font-bold text-sm shrink-0 shadow-sm"
                  :class="i <= 3 ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white'"
                >
                  <span class="material-symbols-outlined text-lg">{{ i <= 3 ? 'check' : 'local_shipping' }}</span>
                </div>
                <div class="flex-1">
                  <p class="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">{{ $t(`landing.timeline_step${i+1}`) }}</p>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ i <= 3 ? $t('landing.completed') : 'In transit to Mombasa Port' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURES SECTION -->
    <section id="features" class="py-24 bg-white/60 dark:bg-slate-900/40 border-y border-slate-200/60 dark:border-slate-800/60 px-6 sm:px-8 lg:px-12 transition-colors duration-300">
      <div class="container mx-auto max-w-7xl">
        <div class="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {{ $t('landing.features_title') }}
          </h2>
          <p class="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            {{ $t('landing.features_subtitle') }}
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon="verified_user" 
            iconBg="bg-emerald-100 dark:bg-emerald-950/60" 
            iconColor="text-emerald-600 dark:text-emerald-400" 
            :title="$t('landing.features.trust')" 
            :desc="$t('landing.features.trust_desc')" 
          />
          <FeatureCard 
            icon="visibility" 
            iconBg="bg-indigo-100 dark:bg-indigo-950/60" 
            iconColor="text-indigo-600 dark:text-indigo-400" 
            :title="$t('landing.features.transparency')" 
            :desc="$t('landing.features.transparency_desc')" 
          />
          <FeatureCard 
            icon="forum" 
            iconBg="bg-purple-100 dark:bg-purple-950/60" 
            iconColor="text-purple-600 dark:text-purple-400" 
            :title="$t('landing.features.communication')" 
            :desc="$t('landing.features.communication_desc')" 
          />
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS SECTION -->
    <section id="how-it-works" class="py-24 px-6 sm:px-8 lg:px-12">
      <div class="container mx-auto max-w-7xl">
        <div class="text-center max-w-3xl mx-auto mb-16">
          <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {{ $t('landing.how_it_works.title') }}
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          <!-- Step connector line -->
          <div class="hidden md:block absolute top-12 left-1/8 right-1/8 h-0.5 bg-gradient-to-r from-indigo-500/20 via-indigo-500 to-indigo-500/20 z-0"></div>
          
          <div 
            v-for="i in 4" 
            :key="i"
            class="relative z-10 text-center bg-white/80 dark:bg-slate-900/80 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 group"
          >
            <div class="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/30 flex items-center justify-center mb-6 text-white font-black text-2xl group-hover:scale-110 transition-transform duration-300">
              {{ i }}
            </div>
            <h4 class="text-lg font-bold text-slate-900 dark:text-white mb-3">
              {{ $t(`landing.how_it_works.step${i}`) }}
            </h4>
            <p class="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
              {{ $t(`landing.how_it_works.step${i}_desc`) }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- TESTIMONIALS SECTION (Dynamic Theme Adaptable) -->
    <section id="testimonials" class="py-24 bg-slate-100/80 dark:bg-slate-950 text-slate-900 dark:text-white rounded-t-[3rem] px-6 sm:px-8 lg:px-12 border-t border-slate-200/80 dark:border-slate-800 transition-colors duration-300">
      <div class="container mx-auto max-w-7xl">
        <h2 class="text-3xl sm:text-4xl font-extrabold text-center mb-16 tracking-tight text-slate-900 dark:text-white">
          {{ $t('landing.testimonials.title') }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div 
            v-for="(userKey, i) in ['user1', 'user2', 'user3']" 
            :key="i" 
            class="bg-white/90 dark:bg-slate-900/90 p-8 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl dark:shadow-2xl flex flex-col justify-between hover:border-indigo-500/50 transition-all duration-300"
          >
            <div>
              <div class="flex gap-1 text-amber-400 mb-6">
                <span v-for="s in 5" :key="s" class="material-symbols-outlined text-xl" style="font-variation-settings: 'FILL' 1;">star</span>
              </div>
              <p class="text-slate-700 dark:text-slate-300 text-sm leading-relaxed italic mb-8">
                "{{ $t(`landing.testimonials.${userKey}.quote`) }}"
              </p>
            </div>
            <div class="flex items-center gap-4 pt-4 border-t border-slate-200/80 dark:border-slate-800">
              <div class="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center font-bold text-white shadow-md">
                {{ $t(`landing.testimonials.${userKey}.name`).charAt(0) }}
              </div>
              <div>
                <p class="font-bold text-sm text-slate-900 dark:text-white">{{ $t(`landing.testimonials.${userKey}.name`) }}</p>
                <p class="text-xs text-indigo-600 dark:text-indigo-300">{{ $t(`landing.testimonials.${userKey}.country`) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CALL TO ACTION (CTA - Light & Dark Adaptable) -->
    <section class="py-24 bg-gradient-to-br from-indigo-600 via-indigo-600 to-purple-700 dark:from-indigo-950 dark:via-purple-950 dark:to-slate-950 text-white px-6 sm:px-8 lg:px-12 relative overflow-hidden transition-colors duration-300">
      <div class="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="container mx-auto max-w-7xl text-center relative z-10">
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
          {{ $t('landing.cta_footer') }}
        </h2>
        <p class="text-base sm:text-lg text-indigo-100 dark:text-indigo-200 mb-10 max-w-2xl mx-auto leading-relaxed">
          {{ $t('landing.cta_footer_sub') }}
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            class="inline-flex items-center justify-center px-10 py-4 text-lg font-bold rounded-2xl bg-white text-indigo-700 shadow-xl hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all duration-200 min-h-[56px]"
            @click="$router.push('/login')"
          >
            {{ $t('landing.cta_footer_button') }}
          </button>
          <button 
            class="inline-flex items-center justify-center px-10 py-4 text-lg font-bold rounded-2xl border-2 border-white/40 text-white hover:bg-white/10 transition-all duration-200 min-h-[56px]"
            @click="$router.push('/login')"
          >
            {{ $t('landing.cta_footer_secondary') }}
          </button>
        </div>
      </div>
    </section>

    <!-- FOOTER (Dynamic Theme Adaptable) -->
    <footer class="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 py-16 px-6 sm:px-8 lg:px-12 border-t border-slate-200 dark:border-slate-800/80 transition-colors duration-300">
      <div class="container mx-auto max-w-7xl">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-12">
          <!-- Brand -->
          <div class="md:col-span-5 space-y-6">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                <span class="material-symbols-outlined text-white text-2xl" style="font-variation-settings: 'FILL' 1;">account_tree</span>
              </div>
              <span class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">AfriChina Bridge</span>
            </div>
            <p class="text-sm max-w-md leading-relaxed text-slate-600 dark:text-slate-400 opacity-90">
              {{ $t('landing.footer_description') }}
            </p>
            <div class="flex gap-3">
              <a href="#" class="w-10 h-10 rounded-xl bg-slate-200/80 dark:bg-white/5 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white transition-all duration-200">
                <span class="material-symbols-outlined text-sm">public</span>
              </a>
              <a href="#" class="w-10 h-10 rounded-xl bg-slate-200/80 dark:bg-white/5 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white transition-all duration-200">
                <span class="material-symbols-outlined text-sm">alternate_email</span>
              </a>
              <a href="#" class="w-10 h-10 rounded-xl bg-slate-200/80 dark:bg-white/5 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white transition-all duration-200">
                <span class="material-symbols-outlined text-sm">rss_feed</span>
              </a>
            </div>
          </div>

          <!-- Platform Links -->
          <div class="md:col-span-2 space-y-4">
            <h5 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider opacity-80">{{ $t('landing.footer_platform') }}</h5>
            <ul class="space-y-3 text-xs sm:text-sm">
              <li><a href="#" class="hover:text-indigo-600 dark:hover:text-white transition-colors flex items-center gap-1 group">{{ $t('landing.footer_sourcing') }}</a></li>
              <li><a href="#" class="hover:text-indigo-600 dark:hover:text-white transition-colors flex items-center gap-1 group">{{ $t('landing.footer_logistics') }}</a></li>
              <li><a href="#" class="hover:text-indigo-600 dark:hover:text-white transition-colors flex items-center gap-1 group">{{ $t('landing.footer_escrow') }}</a></li>
              <li><a href="#" class="hover:text-indigo-600 dark:hover:text-white transition-colors flex items-center gap-1 group">{{ $t('landing.footer_api') }}</a></li>
            </ul>
          </div>

          <!-- Company Links -->
          <div class="md:col-span-2 space-y-4">
            <h5 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider opacity-80">{{ $t('landing.footer_company') }}</h5>
            <ul class="space-y-3 text-xs sm:text-sm">
              <li><a href="#" class="hover:text-indigo-600 dark:hover:text-white transition-colors">{{ $t('landing.footer_vision') }}</a></li>
              <li><a href="#" class="hover:text-indigo-600 dark:hover:text-white transition-colors">{{ $t('landing.footer_intelligence') }}</a></li>
              <li><a href="#" class="hover:text-indigo-600 dark:hover:text-white transition-colors">{{ $t('landing.footer_compliance') }}</a></li>
              <li><a href="#" class="hover:text-indigo-600 dark:hover:text-white transition-colors">{{ $t('landing.footer_support') }}</a></li>
            </ul>
          </div>

          <!-- Newsletter -->
          <div class="md:col-span-3 space-y-4">
            <h5 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider opacity-80">{{ $t('landing.footer_newsletter') }}</h5>
            <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 opacity-90 leading-relaxed">{{ $t('landing.footer_newsletter_desc') }}</p>
            <div class="relative">
              <input 
                type="email" 
                :placeholder="$t('landing.footer_email_placeholder')"
                class="w-full bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
              />
              <button class="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-500 transition-all flex items-center justify-center">
                <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Bottom Copyright -->
        <div class="pt-12 mt-12 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
          <p>{{ $t('landing.footer_copyright') }}</p>
          <div class="flex gap-8">
            <a href="#" class="hover:text-indigo-600 dark:hover:text-white transition-colors">{{ $t('landing.footer_privacy') }}</a>
            <a href="#" class="hover:text-indigo-600 dark:hover:text-white transition-colors">{{ $t('landing.footer_terms') }}</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import LanguageSwitcher from '../components/LanguageSwitcher.vue';
import { useTheme } from '../composables/useTheme';

// ===== GLOBAL THEME COMPOSABLE =====
const { isDark, toggleTheme } = useTheme();

// ===== KOMPONEN LOKAL =====
const FeatureCard = {
  props: ['icon', 'iconBg', 'iconColor', 'title', 'desc'],
  template: `
    <div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xl shadow-indigo-500/5 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 p-8 text-center group">
      <div class="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300" :class="iconBg">
        <span class="material-symbols-outlined text-3xl" :class="iconColor">{{ icon }}</span>
      </div>
      <h3 class="text-xl font-bold mb-3 text-slate-900 dark:text-white">{{ title }}</h3>
      <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{{ desc }}</p>
    </div>
  `
};

// ===== TIMELINE STEPS =====
const timelineSteps = ['step1', 'step2', 'step3', 'step4', 'step5'];

// ===== METHODS =====
const scrollTo = (selector) => {
  const el = document.querySelector(selector);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
};
</script>

<style>
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.08); }
  66% { transform: translate(-20px, 20px) scale(0.92); }
  100% { transform: translate(0px, 0px) scale(1); }
}
.animate-blob {
  animation: blob 8s infinite ease-in-out;
}
.animation-delay-2000 {
  animation-delay: 2s;
}
.animation-delay-4000 {
  animation-delay: 4s;
}
</style>
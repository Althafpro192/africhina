<template>
  <AdminLayout>
    <main class="w-full max-w-[1600px] mx-auto space-y-8">
      <!-- Header -->
      <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 class="text-3xl sm:text-4xl font-black bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent tracking-tight">
            {{ $t('ratings.title') }}
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {{ $t('ratings.sub') }}
          </p>
        </div>
      </header>

      <!-- Table Section -->
      <section class="bg-white/80 dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-indigo-500/5 overflow-hidden transition-colors duration-300">
        <div class="p-6 border-b border-slate-200/80 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <h3 class="text-base font-extrabold text-slate-900 dark:text-white">{{ $t('landing.testimonials.title') }}</h3>
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400">{{ ratings.length }} reviews</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr class="text-slate-400 dark:text-slate-500 uppercase text-[10px] font-bold tracking-widest bg-slate-50/80 dark:bg-slate-950/40 border-b border-slate-200/60 dark:border-slate-800">
                <th class="px-6 py-4">{{ $t('ratings.date') }}</th>
                <th class="px-6 py-4">{{ $t('ratings.buyer') }}</th>
                <th class="px-6 py-4">{{ $t('ratings.rating') }}</th>
                <th class="px-6 py-4">{{ $t('ratings.comment') }}</th>
                <th class="px-6 py-4">{{ $t('ratings.status') }}</th>
                <th class="px-6 py-4 text-right">{{ $t('ratings.actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200/60 dark:divide-slate-800" v-if="!loading">
              <tr 
                v-for="rating in ratings" 
                :key="rating.id" 
                class="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td class="px-6 py-4 text-xs font-medium text-slate-600 dark:text-slate-400">{{ formatDate(rating.created_at) }}</td>
                
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center font-bold text-xs text-indigo-600 dark:text-indigo-400 shrink-0">
                      {{ rating.buyer_name ? rating.buyer_name.charAt(0) : 'B' }}
                    </div>
                    <div>
                      <p class="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">{{ rating.buyer_name }}</p>
                      <p class="text-xs text-slate-500 dark:text-slate-400">{{ rating.buyer_company }}</p>
                    </div>
                  </div>
                </td>

                <td class="px-6 py-4">
                  <div class="flex text-amber-400 text-sm">
                    {{ '★'.repeat(rating.score || 5) }}{{ '☆'.repeat(5 - (rating.score || 5)) }}
                  </div>
                </td>

                <td class="px-6 py-4">
                  <p class="text-xs sm:text-sm text-slate-700 dark:text-slate-300 line-clamp-2 max-w-sm">{{ rating.review }}</p>
                </td>

                <td class="px-6 py-4">
                  <span 
                    :class="['px-3 py-1 rounded-full text-[10px] font-extrabold border shadow-xs inline-flex items-center gap-1', rating.is_published ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800']"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" :class="rating.is_published ? 'bg-emerald-500' : 'bg-amber-500'"></span>
                    {{ rating.is_published ? $t('ratings.published') : $t('ratings.unpublished') }}
                  </span>
                </td>

                <td class="px-6 py-4 text-right">
                  <button 
                    @click="togglePublish(rating)" 
                    class="px-4 py-1.5 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                    :class="rating.is_published ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-200' : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90'"
                  >
                    {{ rating.is_published ? $t('ratings.unpublish') : $t('ratings.publish') }}
                  </button>
                </td>
              </tr>

              <tr v-if="ratings.length === 0">
                <td colspan="6" class="px-6 py-12 text-center text-slate-400 dark:text-slate-500 text-xs font-medium">
                  No buyer ratings found for moderation.
                </td>
              </tr>
            </tbody>

            <tbody v-else>
              <tr>
                <td colspan="6" class="px-6 py-16 text-center">
                  <span class="material-symbols-outlined animate-spin text-indigo-600 dark:text-indigo-400 text-3xl">progress_activity</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  </AdminLayout>
</template>

<script setup>
import { useToast } from '../../composables/useToast.js';
const { showToast } = useToast();

import { ref, onMounted } from 'vue'
import { adminService } from '../../api/adminService.js'
import { ratingService } from '../../api/ratingService.js'
import AdminLayout from '../../components/layout/AdminLayout.vue'

const loading = ref(true)
const ratings = ref([])

const loadRatings = async () => {
  try {
    const data = await ratingService.getRatings();
    ratings.value = data;
  } catch (error) {
    console.error('Failed to load ratings:', error);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadRatings()
})

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const togglePublish = async (rating) => {
  try {
    const updated = await adminService.togglePublishRating(rating.id, !rating.is_published);
    rating.is_published = updated.is_published;
    showToast(rating.is_published ? 'Rating published successfully' : 'Rating unpublished', 'success');
  } catch (error) {
    showToast(error.response?.data?.message || 'Failed to update rating status', 'error')
  }
}
</script>

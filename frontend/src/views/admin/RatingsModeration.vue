<template>
  <AdminLayout>
    <main class="flex-1 p-10 max-w-[1600px] mx-auto space-y-10">
      <!-- Header -->
      <header class="flex justify-between items-end gap-6">
        <div>
          <h2 class="text-[48px] leading-[1.1] tracking-[-0.02em] font-extrabold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">Ratings Moderation</h2>
          <p class="text-[16px] leading-[1.6] font-normal text-[#494551]">Review and manage buyer testimonials before publishing them to the landing page.</p>
        </div>
        <div class="flex gap-4 items-center">
          <LanguageSwitcher />
        </div>
      </header>

      <!-- Table Section -->
      <section class="glass-panel rounded-3xl p-6 deep-shadow relative">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr class="text-[#7a7582] uppercase text-[11px] font-bold tracking-widest bg-[#f8f2fa]/50">
                <th class="px-6 py-4">Date</th>
                <th class="px-6 py-4">Buyer</th>
                <th class="px-6 py-4">Score</th>
                <th class="px-6 py-4">Review</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#cbc4d2]/30" v-if="!loading">
              <tr v-for="rating in ratings" :key="rating.id" class="group hover:bg-gradient-to-r hover:from-[#4f378a]/5 hover:to-transparent transition-all">
                <td class="px-6 py-5 text-sm text-[#494551]">{{ formatDate(rating.created_at) }}</td>
                <td class="px-6 py-5">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full border-2 border-[#4f378a]/30 p-0.5 flex items-center justify-center bg-gray-100">
                      <span class="material-symbols-outlined text-[#4f378a]">person</span>
                    </div>
                    <div>
                      <p class="font-bold text-[#1d1b20]">{{ rating.buyer_name }}</p>
                      <p class="text-xs text-[#7a7582]">{{ rating.buyer_company }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-5">
                  <div class="flex text-yellow-400 text-sm">
                    {{ '★'.repeat(rating.score) }}{{ '☆'.repeat(5 - rating.score) }}
                  </div>
                </td>
                <td class="px-6 py-5">
                  <p class="text-sm text-[#494551] truncate max-w-xs">{{ rating.review }}</p>
                </td>
                <td class="px-6 py-5">
                  <span :class="['px-3 py-1 rounded-lg text-xs font-bold border shadow-sm', rating.is_published ? 'bg-[#e6f4ea] text-[#137333] border-green-200' : 'bg-[#fff8e1] text-[#f29900] border-yellow-200']">
                    {{ rating.is_published ? 'Published' : 'Pending' }}
                  </span>
                </td>
                <td class="px-6 py-5 text-right">
                  <button 
                    @click="togglePublish(rating)" 
                    class="px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm"
                    :class="rating.is_published ? 'bg-[#fce8e6] text-[#c5221f] hover:bg-red-200' : 'bg-gradient-to-r from-[#4f378a] to-[#6750a4] text-white hover:opacity-90'"
                  >
                    {{ rating.is_published ? 'Unpublish' : 'Publish' }}
                  </button>
                </td>
              </tr>
              <tr v-if="ratings.length === 0">
                <td colspan="6" class="px-6 py-10 text-center text-gray-500">
                  No ratings found.
                </td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr>
                <td colspan="6" class="px-6 py-10 text-center text-gray-500">
                  <span class="material-symbols-outlined animate-spin text-[#3525cd]" style="font-size: 32px;">progress_activity</span>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import LanguageSwitcher from '../../components/LanguageSwitcher.vue'
import { adminService } from '../../api/adminService.js'
import { ratingService } from '../../api/ratingService.js'
import AdminLayout from '../../components/layout/AdminLayout.vue'

const router = useRouter()
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
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to update rating status')
  }
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

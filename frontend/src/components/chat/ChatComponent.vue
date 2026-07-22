<template>
  <div class="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col h-full shadow-sm overflow-hidden transition-colors duration-300">
    <!-- Header -->
    <div class="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between shrink-0">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-xl">forum</span>
        </div>
        <div>
          <h3 class="font-bold text-sm sm:text-base text-slate-900 dark:text-white">Negotiation Chat</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">Live communication with {{ isAdmin ? 'Buyer' : 'Admin' }}</p>
        </div>
      </div>
    </div>
    
    <!-- Messages Area -->
    <div class="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3.5 bg-slate-50/30 dark:bg-[#0b0f19]/40" ref="messagesContainer">
      <div v-if="loading" class="flex justify-center py-8">
        <span class="material-symbols-outlined animate-spin text-indigo-600 dark:text-indigo-400 text-2xl">progress_activity</span>
      </div>
      <div v-else-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 py-12">
        <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2">
          <span class="material-symbols-outlined text-2xl opacity-60">chat_bubble</span>
        </div>
        <p class="text-xs font-semibold">No messages yet. Start the conversation!</p>
      </div>
      
      <div v-for="msg in messages" :key="msg.id" :class="['flex w-full', msg.sender_id === currentUserId ? 'justify-end' : 'justify-start']">
        <div :class="[
          'max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 relative group shadow-xs transition-all', 
          msg.sender_id === currentUserId 
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-xs shadow-md shadow-indigo-500/15' 
            : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-xs border border-slate-200/80 dark:border-slate-700/80'
        ]">
          
          <!-- Dropdown Menu for Sender -->
          <div v-if="msg.sender_id === currentUserId && !msg.is_deleted" class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button @click="toggleMenu(msg.id)" class="text-white/80 hover:text-white bg-black/20 rounded-full w-6 h-6 flex items-center justify-center cursor-pointer">
              <span class="material-symbols-outlined text-[14px]">more_vert</span>
            </button>
            <div v-if="activeMenu === msg.id" class="absolute right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl text-slate-800 dark:text-slate-200 overflow-hidden text-xs min-w-[110px] z-20">
              <button @click="startEdit(msg)" class="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer">
                <span class="material-symbols-outlined text-[14px]">edit</span> Edit
              </button>
              <button @click="deleteMsg(msg.id)" class="w-full text-left px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2 cursor-pointer">
                <span class="material-symbols-outlined text-[14px]">delete</span> Delete
              </button>
            </div>
          </div>

          <p :class="['text-[11px] font-bold mb-1 flex items-center gap-1', msg.sender_id === currentUserId ? 'text-indigo-100' : 'text-indigo-600 dark:text-indigo-400']">
            <span class="material-symbols-outlined text-[12px]" v-if="msg.sender_role === 'admin'">admin_panel_settings</span>
            {{ msg.sender_name }}
          </p>

          <!-- Deleted State -->
          <div v-if="msg.is_deleted" :class="['italic text-xs flex items-center gap-1.5 py-1', msg.sender_id === currentUserId ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-400']">
            <span class="material-symbols-outlined text-[15px]">block</span> This message was deleted
          </div>
          
          <!-- Active State -->
          <div v-else>
            <!-- Media Rendering -->
            <div v-if="msg.media_url" class="mb-2">
              <img v-if="msg.media_type === 'image'" :src="getMediaUrl(msg.media_url)" alt="Attachment" class="max-w-full rounded-xl max-h-56 object-cover cursor-pointer hover:opacity-90 transition-opacity" @click="window.open(getMediaUrl(msg.media_url), '_blank')" />
              <audio v-else-if="msg.media_type === 'audio'" controls :src="getMediaUrl(msg.media_url)" class="max-w-full h-10"></audio>
              <a v-else :href="getMediaUrl(msg.media_url)" target="_blank" :class="['flex items-center gap-2 underline text-xs font-bold', msg.sender_id === currentUserId ? 'text-white' : 'text-indigo-600 dark:text-indigo-400']">
                <span class="material-symbols-outlined text-[16px]">attach_file</span> View Attachment
              </a>
            </div>

            <!-- Text Content -->
            <div v-if="msg.content" :class="['text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-medium', msg.sender_id === currentUserId ? 'text-white' : 'text-slate-900 dark:text-white']">
              {{ expandedTranslation === msg.id ? getTranslationText(msg) : msg.content }}
            </div>

            <div :class="['flex items-center justify-between mt-1.5 pt-1 border-t', msg.sender_id === currentUserId ? 'border-white/20' : 'border-slate-200/60 dark:border-slate-700/60']">
              <div class="flex items-center gap-2">
                <!-- Translate Button -->
                <button 
                  v-if="msg.content && hasTranslation(msg)" 
                  @click="toggleTranslation(msg.id)" 
                  :class="['text-[10px] font-bold flex items-center gap-1 px-2 py-0.5 rounded cursor-pointer transition-colors', msg.sender_id === currentUserId ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600']"
                >
                  <span class="material-symbols-outlined text-[12px]">g_translate</span> 
                  {{ expandedTranslation === msg.id ? 'Show Original' : 'Translate' }}
                </button>
                <p v-if="msg.is_edited" :class="['text-[9px] italic', msg.sender_id === currentUserId ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-400']">(edited)</p>
              </div>
              <p :class="['text-[10px] text-right font-medium ml-4', msg.sender_id === currentUserId ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-400']">{{ formatTime(msg.created_at) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Input Area -->
    <div v-if="editingMsg" class="bg-indigo-50 dark:bg-indigo-950/60 p-2.5 px-4 text-xs flex justify-between items-center text-indigo-700 dark:text-indigo-300 border-t border-indigo-100 dark:border-indigo-900/50">
      <div class="flex items-center gap-2 font-medium">
        <span class="material-symbols-outlined text-[16px]">edit</span>
        <span>Editing message...</span>
      </div>
      <button @click="cancelEdit" class="hover:bg-indigo-100 dark:hover:bg-indigo-900/60 p-1 rounded-full text-indigo-700 dark:text-indigo-300 cursor-pointer"><span class="material-symbols-outlined text-[16px]">close</span></button>
    </div>
    
    <div v-if="previewUrl && !isRecording" class="bg-slate-100 dark:bg-slate-800/80 p-2.5 px-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-700">
      <div class="flex items-center gap-2">
        <img v-if="previewType === 'image'" :src="previewUrl" class="h-10 w-10 object-cover rounded-lg shadow-xs" />
        <span v-else class="material-symbols-outlined text-slate-500 dark:text-slate-400">audio_file</span>
        <span class="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">{{ selectedFile?.name || 'Voice Note' }}</span>
      </div>
      <button @click="clearFile" class="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-1 rounded-full cursor-pointer"><span class="material-symbols-outlined text-[16px]">close</span></button>
    </div>

    <!-- Recording indicator -->
    <div v-if="isRecording" class="bg-rose-50 dark:bg-rose-950/60 p-3 px-4 flex items-center justify-between border-t border-rose-200 dark:border-rose-900/50 animate-pulse">
      <div class="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs sm:text-sm font-bold">
        <span class="material-symbols-outlined">mic</span> Recording Voice Note... {{ recordingTime }}s
      </div>
      <div class="flex gap-2">
        <button @click="stopRecording(false)" class="text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 cursor-pointer"><span class="material-symbols-outlined">delete</span></button>
        <button @click="stopRecording(true)" class="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"><span class="material-symbols-outlined text-[14px]">stop</span> Finish</button>
      </div>
    </div>

    <div class="p-3 sm:p-4 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-end gap-2 relative shrink-0">
      <input type="file" ref="fileInput" class="hidden" accept="image/*,audio/*" @change="handleFileSelect" />
      
      <button v-if="!isRecording" @click="$refs.fileInput.click()" class="p-2.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0 cursor-pointer" title="Attach file">
        <span class="material-symbols-outlined text-xl">attach_file</span>
      </button>

      <textarea 
        v-if="!isRecording"
        v-model="newMessage" 
        @keydown.enter.prevent="submitMessage"
        placeholder="Type your message..." 
        class="flex-1 w-full bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/30 resize-none outline-none font-medium transition-all"
        rows="1"
        style="min-height: 44px; max-height: 120px;"
      ></textarea>

      <div v-if="!isRecording" class="flex items-center gap-1 shrink-0">
        <button 
          v-if="!newMessage.trim() && !selectedFile && !editingMsg"
          @click="startRecording"
          class="p-2.5 text-slate-500 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
          title="Hold or click to record"
        >
          <span class="material-symbols-outlined text-xl">mic</span>
        </button>
        <button 
          v-else
          @click="submitMessage" 
          :disabled="(!newMessage.trim() && !selectedFile) || sending"
          class="bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white p-2.5 w-10 h-10 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center shadow-md shadow-indigo-500/20 cursor-pointer shrink-0"
        >
          <span class="material-symbols-outlined text-lg" v-if="!sending">send</span>
          <span class="material-symbols-outlined text-lg animate-spin" v-else>progress_activity</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useToast } from '../../composables/useToast.js';
const { showToast } = useToast();

import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { requestService } from '../../api/requestService.js'
import { adminService } from '../../api/adminService.js'
import { io } from 'socket.io-client'

const props = defineProps({
  requestId: { type: String, required: true },
  isAdmin: { type: Boolean, default: false }
})

const messages = ref([])
const newMessage = ref('')
const loading = ref(true)
const sending = ref(false)
const messagesContainer = ref(null)
let socket = null

// Dropdown & Expand State
const activeMenu = ref(null)
const expandedTranslation = ref(null)

// Media & Edit State
const fileInput = ref(null)
const selectedFile = ref(null)
const previewUrl = ref(null)
const previewType = ref(null)
const editingMsg = ref(null)

// Audio Recording State
const isRecording = ref(false)
let mediaRecorder = null
let audioChunks = []
const recordingTime = ref(0)
let recordTimer = null

const user = JSON.parse(localStorage.getItem('user') || '{}')
const currentUserId = user.id
const { locale } = useI18n()

// Outside click handler for menu
const closeMenu = (e) => {
  if (!e.target.closest('.group')) activeMenu.value = null
}

const toggleMenu = (id) => {
  activeMenu.value = activeMenu.value === id ? null : id
}

const formatTime = (dateStr) => {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

const getMediaUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const backendUrl = window.location.origin.replace('5173', '5000')
  return `${backendUrl}${path}`
}

const parseTranslations = (msg) => {
  let transObj = msg.translations;
  if (typeof transObj === 'string') {
    try { transObj = JSON.parse(transObj); } catch(e) { transObj = null; }
  }
  return transObj
}

const hasTranslation = (msg) => {
  const transObj = parseTranslations(msg)
  const currentLang = locale.value
  return transObj && transObj[currentLang] && transObj[currentLang] !== msg.content
}

const getTranslationText = (msg) => {
  const transObj = parseTranslations(msg)
  return transObj[locale.value] || msg.content
}

const toggleTranslation = (id) => {
  expandedTranslation.value = expandedTranslation.value === id ? null : id
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// File Handling
const handleFileSelect = (e) => {
  const file = e.target.files[0]
  if (!file) return
  selectedFile.value = file
  previewType.value = file.type.startsWith('image/') ? 'image' : 'audio'
  previewUrl.value = URL.createObjectURL(file)
}

const clearFile = () => {
  selectedFile.value = null
  previewUrl.value = null
  previewType.value = null
  if (fileInput.value) fileInput.value.value = ''
}

// Audio Recording
const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(stream)
    audioChunks = []
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.push(e.data)
    }
    
    mediaRecorder.start()
    isRecording.value = true
    recordingTime.value = 0
    recordTimer = setInterval(() => { recordingTime.value++ }, 1000)
    
  } catch (err) {
    showToast("Could not access microphone. Please allow permissions.")
    console.error(err)
  }
}

const stopRecording = (save = true) => {
  if (!mediaRecorder) return
  
  mediaRecorder.onstop = () => {
    if (save && audioChunks.length > 0) {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
      const file = new File([audioBlob], `voicenote_${Date.now()}.webm`, { type: 'audio/webm' })
      selectedFile.value = file
      previewType.value = 'audio'
      previewUrl.value = URL.createObjectURL(file)
    } else {
      clearFile()
    }
  }
  
  mediaRecorder.stop()
  mediaRecorder.stream.getTracks().forEach(t => t.stop())
  isRecording.value = false
  clearInterval(recordTimer)
}

// CRUD Actions
const startEdit = (msg) => {
  editingMsg.value = msg
  newMessage.value = msg.content
  activeMenu.value = null
}

const cancelEdit = () => {
  editingMsg.value = null
  newMessage.value = ''
}

const deleteMsg = async (msgId) => {
  if (!confirm("Are you sure you want to delete this message?")) return
  activeMenu.value = null
  try {
    const service = props.isAdmin ? adminService : requestService
    await service.deleteMessage(props.requestId, msgId)
    // Optimistic delete
    const idx = messages.value.findIndex(m => m.id === msgId)
    if (idx !== -1) {
      messages.value[idx].is_deleted = true
      messages.value[idx].content = ''
      messages.value[idx].media_url = null
    }
  } catch (err) {
    console.error(err)
    showToast("Failed to delete message")
  }
}

const submitMessage = async () => {
  if ((!newMessage.value.trim() && !selectedFile) || sending.value) return
  
  sending.value = true
  try {
    const service = props.isAdmin ? adminService : requestService
    
    if (editingMsg.value) {
      // Edit existing
      const updated = await service.editMessage(props.requestId, editingMsg.value.id, newMessage.value)
      const idx = messages.value.findIndex(m => m.id === editingMsg.value.id)
      if (idx !== -1) messages.value[idx] = updated
      cancelEdit()
    } else {
      // Send new
      let payload
      if (selectedFile.value) {
        payload = new FormData()
        if (newMessage.value.trim()) payload.append('content', newMessage.value)
        payload.append('media', selectedFile.value)
      } else {
        payload = newMessage.value
      }
      
      const sent = await service.sendMessage(props.requestId, payload)
      // Optimistic append
      if (!messages.value.find(m => m.id === sent.id)) {
        messages.value.push(sent)
        scrollToBottom()
      }
      
      newMessage.value = ''
      clearFile()
    }
  } catch (error) {
    console.error('Failed to send/edit message:', error)
  } finally {
    sending.value = false
  }
}

const fetchMessages = async () => {
  try {
    const service = props.isAdmin ? adminService : requestService
    const data = await service.getMessages(props.requestId)
    messages.value = data
    scrollToBottom()
  } catch (error) {
    console.error('Failed to fetch messages:', error)
  } finally {
    loading.value = false
  }
}

const setupSocket = () => {
  const token = localStorage.getItem('token')
  if (!token) return

  socket = io(window.location.origin.replace('5173', '5000'), {
    auth: { token }
  })

  socket.on('connect', () => {
    socket.emit('join-room', `request_${props.requestId}`)
  })

  socket.on('new-message', (msg) => {
    if (!messages.value.find(m => m.id === msg.id)) {
      messages.value.push(msg)
      scrollToBottom()
    }
  })

  socket.on('message-edited', (msg) => {
    const idx = messages.value.findIndex(m => m.id === msg.id)
    if (idx !== -1) messages.value[idx] = msg
  })

  socket.on('message-deleted', (payload) => {
    const idx = messages.value.findIndex(m => m.id === payload.id)
    if (idx !== -1) {
      messages.value[idx].is_deleted = true
      messages.value[idx].content = ''
      messages.value[idx].media_url = null
    }
  })
}

onMounted(() => {
  document.addEventListener('click', closeMenu)
  fetchMessages()
  setupSocket()
})

onUnmounted(() => {
  document.removeEventListener('click', closeMenu)
  if (socket) socket.disconnect()
})
</script>

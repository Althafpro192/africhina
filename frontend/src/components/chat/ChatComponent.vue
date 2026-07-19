<template>
  <div class="glass-panel deep-shadow rounded-xl flex flex-col h-[600px]">
    <!-- Header -->
    <div class="p-4 border-b border-white/50 bg-white/40 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-[#3525cd]/10 rounded-full flex items-center justify-center">
          <span class="material-symbols-outlined text-[#3525cd]">forum</span>
        </div>
        <div>
          <h3 class="font-bold text-gray-800">Negotiation Chat</h3>
          <p class="text-xs text-gray-500">Live communication with Admin</p>
        </div>
      </div>
    </div>
    
    <!-- Messages Area -->
    <div class="flex-1 p-4 overflow-y-auto space-y-4" ref="messagesContainer">
      <div v-if="loading" class="flex justify-center py-4">
        <span class="material-symbols-outlined animate-spin text-[#3525cd]">progress_activity</span>
      </div>
      <div v-else-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-gray-500">
        <span class="material-symbols-outlined text-4xl mb-2 opacity-50">chat_bubble</span>
        <p>No messages yet. Start the conversation!</p>
      </div>
      
      <div v-for="msg in messages" :key="msg.id" :class="['flex w-full', msg.sender_id === currentUserId ? 'justify-end' : 'justify-start']">
        <div :class="['max-w-[85%] rounded-2xl p-3 relative group', msg.sender_id === currentUserId ? 'bg-[#3525cd] text-white rounded-tr-sm' : 'bg-white shadow-sm text-gray-800 rounded-tl-sm border border-gray-100']">
          
          <!-- Dropdown Menu for Sender -->
          <div v-if="msg.sender_id === currentUserId && !msg.is_deleted" class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button @click="toggleMenu(msg.id)" class="text-white/80 hover:text-white bg-black/20 rounded-full w-6 h-6 flex items-center justify-center">
              <span class="material-symbols-outlined text-[14px]">more_vert</span>
            </button>
            <div v-if="activeMenu === msg.id" class="absolute right-0 mt-1 bg-white rounded-lg shadow-xl text-gray-800 overflow-hidden text-xs min-w-[100px] z-20">
              <button @click="startEdit(msg)" class="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2">
                <span class="material-symbols-outlined text-[14px]">edit</span> Edit
              </button>
              <button @click="deleteMsg(msg.id)" class="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2">
                <span class="material-symbols-outlined text-[14px]">delete</span> Delete
              </button>
            </div>
          </div>

          <p class="text-xs font-semibold mb-1 opacity-80 flex items-center gap-1">
            <span class="material-symbols-outlined text-[12px]" v-if="msg.sender_role === 'admin'">admin_panel_settings</span>
            {{ msg.sender_name }}
          </p>

          <!-- Deleted State -->
          <div v-if="msg.is_deleted" class="italic opacity-60 text-sm flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px]">block</span> This message was deleted
          </div>
          
          <!-- Active State -->
          <div v-else>
            <!-- Media Rendering -->
            <div v-if="msg.media_url" class="mb-2">
              <img v-if="msg.media_type === 'image'" :src="getMediaUrl(msg.media_url)" alt="Attachment" class="max-w-full rounded-lg max-h-48 object-cover cursor-pointer hover:opacity-90" @click="window.open(getMediaUrl(msg.media_url), '_blank')" />
              <audio v-else-if="msg.media_type === 'audio'" controls :src="getMediaUrl(msg.media_url)" class="max-w-full h-10"></audio>
              <a v-else :href="getMediaUrl(msg.media_url)" target="_blank" class="flex items-center gap-2 underline text-sm"><span class="material-symbols-outlined text-[14px]">attach_file</span> View Attachment</a>
            </div>

            <!-- Text Content -->
            <div v-if="msg.content" class="text-sm whitespace-pre-wrap">
              {{ expandedTranslation === msg.id ? getTranslationText(msg) : msg.content }}
            </div>

            <div class="flex items-center justify-between mt-1 pt-1 border-t border-current border-opacity-10">
              <div class="flex items-center gap-2">
                <!-- Translate Button -->
                <button 
                  v-if="msg.content && hasTranslation(msg)" 
                  @click="toggleTranslation(msg.id)" 
                  class="text-[10px] flex items-center gap-1 opacity-70 hover:opacity-100 bg-black/10 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                >
                  <span class="material-symbols-outlined text-[12px]">g_translate</span> 
                  {{ expandedTranslation === msg.id ? 'Show Original' : 'Translate' }}
                </button>
                <p v-if="msg.is_edited" class="text-[9px] opacity-60 italic">(edited)</p>
              </div>
              <p class="text-[10px] text-right opacity-70 ml-4">{{ formatTime(msg.created_at) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Input Area -->
    <div v-if="editingMsg" class="bg-indigo-50 p-2 text-xs flex justify-between items-center text-indigo-700 border-t border-indigo-100">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-[14px]">edit</span>
        <span>Editing message...</span>
      </div>
      <button @click="cancelEdit" class="hover:bg-indigo-100 p-1 rounded-full"><span class="material-symbols-outlined text-[14px]">close</span></button>
    </div>
    
    <div v-if="previewUrl && !isRecording" class="bg-gray-50 p-2 flex items-center justify-between border-t border-gray-200">
      <div class="flex items-center gap-2">
        <img v-if="previewType === 'image'" :src="previewUrl" class="h-10 w-10 object-cover rounded shadow" />
        <span v-else class="material-symbols-outlined">audio_file</span>
        <span class="text-xs truncate max-w-[150px]">{{ selectedFile?.name || 'Voice Note' }}</span>
      </div>
      <button @click="clearFile" class="text-red-500 p-1 hover:bg-red-50 rounded-full"><span class="material-symbols-outlined text-[14px]">close</span></button>
    </div>

    <!-- Recording indicator -->
    <div v-if="isRecording" class="bg-red-50 p-3 flex items-center justify-between border-t border-red-100 animate-pulse">
      <div class="flex items-center gap-2 text-red-600 text-sm font-semibold">
        <span class="material-symbols-outlined">mic</span> Recording Voice Note... {{ recordingTime }}s
      </div>
      <div class="flex gap-2">
        <button @click="stopRecording(false)" class="text-gray-500 hover:text-red-600"><span class="material-symbols-outlined">delete</span></button>
        <button @click="stopRecording(true)" class="bg-red-600 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">stop</span> Finish</button>
      </div>
    </div>

    <div class="p-4 border-t border-white/50 bg-white/40 flex items-end gap-2 relative">
      <input type="file" ref="fileInput" class="hidden" accept="image/*,audio/*" @change="handleFileSelect" />
      
      <button v-if="!isRecording" @click="$refs.fileInput.click()" class="p-2 text-gray-500 hover:text-[#3525cd] hover:bg-[#3525cd]/10 rounded-xl transition-colors shrink-0">
        <span class="material-symbols-outlined">attach_file</span>
      </button>

      <textarea 
        v-if="!isRecording"
        v-model="newMessage" 
        @keydown.enter.prevent="submitMessage"
        placeholder="Type your message..." 
        class="flex-1 w-full bg-white/60 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#3525cd]/50 resize-none outline-none"
        rows="1"
        style="min-height: 44px; max-height: 120px;"
      ></textarea>

      <div v-if="!isRecording" class="flex items-center gap-1 shrink-0">
        <button 
          v-if="!newMessage.trim() && !selectedFile && !editingMsg"
          @click="startRecording"
          class="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          title="Hold or click to record"
        >
          <span class="material-symbols-outlined">mic</span>
        </button>
        <button 
          v-else
          @click="submitMessage" 
          :disabled="(!newMessage.trim() && !selectedFile) || sending"
          class="bg-[#3525cd] hover:bg-blue-700 text-white p-2 w-10 h-10 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center shadow"
        >
          <span class="material-symbols-outlined" v-if="!sending">send</span>
          <span class="material-symbols-outlined animate-spin" v-else>progress_activity</span>
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

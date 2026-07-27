<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import { useChat } from '../../composables/useChat.js';

const props = defineProps({
  negotiationId: {
    type: String,
    required: true
  },
  currentUserId: {
    type: String,
    default: ''
  }
});

const {
  messages,
  isLoading,
  isTyping,
  typingUser,
  error,
  sendMessage,
  startTyping,
  stopTyping
} = useChat(props.negotiationId);

const messageText = ref('');
const selectedFile = ref(null);
const fileInputRef = ref(null);
const messagesContainer = ref(null);
const isSending = ref(false);

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

watch(messages, () => {
  scrollToBottom();
}, { deep: true });

const handleInput = () => {
  startTyping();
};

const triggerFileUpload = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click();
  }
};

const handleFileSelected = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
  }
};

const removeSelectedFile = () => {
  selectedFile.value = null;
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

const handleSend = async () => {
  if (!messageText.value.trim() && !selectedFile.value) return;
  
  isSending.value = true;
  try {
    await sendMessage(messageText.value, selectedFile.value);
    messageText.value = '';
    removeSelectedFile();
    await scrollToBottom();
  } catch (err) {
    console.error('Failed to send message:', err);
  } finally {
    isSending.value = false;
  }
};

onMounted(() => {
  scrollToBottom();
});
</script>

<template>
  <div class="chat-window flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
    <!-- Header -->
    <div class="chat-header p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
        <div>
          <h3 class="text-sm font-semibold text-slate-100">Live Negotiation Chat</h3>
          <p class="text-xs text-slate-400">ID: {{ negotiationId }}</p>
        </div>
      </div>
      <div v-if="isTyping" class="text-xs text-emerald-400 flex items-center gap-1">
        <span>Typing</span>
        <span class="animate-bounce">.</span>
        <span class="animate-bounce delay-100">.</span>
        <span class="animate-bounce delay-200">.</span>
      </div>
    </div>

    <!-- Messages Container -->
    <div ref="messagesContainer" class="messages-body flex-1 p-4 overflow-y-auto space-y-3 min-h-[350px]">
      <div v-if="isLoading" class="flex justify-center items-center h-full text-slate-500 text-sm">
        Loading chat history...
      </div>

      <div v-else-if="error" class="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-lg">
        {{ error }}
      </div>

      <div v-else-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-slate-500 text-xs py-10">
        <span class="material-symbols-outlined text-4xl mb-2 text-slate-600">chat_bubble_outline</span>
        No messages yet. Send a message to start negotiation!
      </div>

      <template v-else>
        <div 
          v-for="msg in messages" 
          :key="msg.id" 
          :class="[
            'message-row flex flex-col max-w-[80%]',
            msg.sender_id === currentUserId ? 'ml-auto items-end' : 'mr-auto items-start'
          ]"
        >
          <div class="text-[10px] text-slate-400 mb-1 px-1 flex items-center gap-1">
            <span class="font-medium text-slate-300">{{ msg.sender_name || 'User' }}</span>
            <span v-if="msg.sender_role" class="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-slate-300 uppercase">
              {{ msg.sender_role }}
            </span>
          </div>

          <div 
            :class="[
              'p-3 rounded-2xl text-xs leading-relaxed break-words shadow-sm',
              msg.sender_id === currentUserId 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-slate-800 text-slate-100 border border-slate-700/50 rounded-bl-none'
            ]"
          >
            <p v-if="msg.is_deleted" class="italic text-slate-400 text-[11px]">
              This message was deleted
            </p>
            <p v-else-if="msg.content">{{ msg.content }}</p>

            <!-- Attachment -->
            <div v-if="msg.media_url && !msg.is_deleted" class="mt-2">
              <img 
                v-if="msg.media_type === 'image'" 
                :src="msg.media_url" 
                alt="Attachment" 
                class="max-w-[200px] max-h-[150px] rounded-lg object-cover border border-slate-700 hover:scale-105 transition-transform"
              />
              <a 
                v-else 
                :href="msg.media_url" 
                target="_blank" 
                class="flex items-center gap-2 p-2 bg-slate-900/60 rounded-lg text-blue-400 hover:underline text-[11px]"
              >
                <span class="material-symbols-outlined text-sm">description</span>
                View Attachment
              </a>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Selected File Preview -->
    <div v-if="selectedFile" class="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
      <div class="flex items-center gap-2 truncate">
        <span class="material-symbols-outlined text-blue-400">attach_file</span>
        <span class="truncate">{{ selectedFile.name }}</span>
      </div>
      <button @click="removeSelectedFile" class="text-rose-400 hover:text-rose-300">
        <span class="material-symbols-outlined text-sm">close</span>
      </button>
    </div>

    <!-- Input Footer -->
    <div class="chat-footer p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
      <input 
        ref="fileInputRef" 
        type="file" 
        class="hidden" 
        @change="handleFileSelected" 
        accept="image/*,application/pdf"
      />
      
      <button 
        type="button" 
        @click="triggerFileUpload"
        class="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
        title="Attach file"
      >
        <span class="material-symbols-outlined">attach_file</span>
      </button>

      <input 
        v-model="messageText" 
        type="text" 
        placeholder="Type your message..." 
        @input="handleInput"
        @keyup.enter="handleSend"
        class="flex-1 bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors"
      />

      <button 
        @click="handleSend" 
        :disabled="isSending || (!messageText.trim() && !selectedFile)"
        class="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-colors flex items-center justify-center"
      >
        <span class="material-symbols-outlined text-sm">send</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.lazy-render-placeholder {
  min-height: 48px;
  background-color: rgba(30, 41, 59, 0.5);
  opacity: 0.6;
}
</style>

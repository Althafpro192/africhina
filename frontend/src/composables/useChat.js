// [FIX] Priority 13: Vue 3 useChat composable with Socket.io rooms, JWT handshake, and typing debounce
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { io } from 'socket.io-client';
import axios from 'axios';

let sharedSocket = null;

export function useChat(negotiationId) {
  const messages = ref([]);
  const isLoading = ref(false);
  const isTyping = ref(false);
  const typingUser = ref('');
  const error = ref(null);

  let typingTimeout = null;

  const getAuthToken = () => {
    return localStorage.getItem('token') || '';
  };

  const initSocket = () => {
    if (!sharedSocket || !sharedSocket.connected) {
      const token = getAuthToken();
      sharedSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });
    }
    return sharedSocket;
  };

  const fetchMessageHistory = async () => {
    if (!negotiationId) return;
    isLoading.value = true;
    error.value = null;
    try {
      const token = getAuthToken();
      const res = await axios.get(`/api/v1/requests/${negotiationId}/messages`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      messages.value = Array.isArray(res.data) ? res.data : (res.data.data || []);
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load messages';
    } finally {
      isLoading.value = false;
    }
  };

  const joinNegotiationRoom = (id) => {
    if (!id || !sharedSocket) return;
    const roomId = `room:nego-${id}`;
    sharedSocket.emit('join_room', roomId);
  };

  const leaveNegotiationRoom = (id) => {
    if (!id || !sharedSocket) return;
    const roomId = `room:nego-${id}`;
    sharedSocket.emit('leave_room', roomId);
  };

  const sendMessage = async (text, file = null) => {
    if (!text.trim() && !file) return;

    try {
      const formData = new FormData();
      if (text) formData.append('content', text);
      if (file) formData.append('media', file);

      const token = getAuthToken();
      const res = await axios.post(`/api/v1/requests/${negotiationId}/messages`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      
      // Local optimistic append if not received via socket
      const exists = messages.value.some(m => m.id === res.data.id);
      if (!exists) {
        messages.value.push(res.data);
      }
      stopTyping();
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to send message';
      throw err;
    }
  };

  const startTyping = () => {
    if (!sharedSocket || !negotiationId) return;
    sharedSocket.emit('typing_start', { roomId: `room:nego-${negotiationId}` });
    
    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      stopTyping();
    }, 1500);
  };

  const stopTyping = () => {
    if (!sharedSocket || !negotiationId) return;
    if (typingTimeout) clearTimeout(typingTimeout);
    sharedSocket.emit('typing_stop', { roomId: `room:nego-${negotiationId}` });
  };

  onMounted(() => {
    const socket = initSocket();

    if (negotiationId) {
      fetchMessageHistory();
      joinNegotiationRoom(negotiationId);
    }

    // Socket Event Handlers
    const handleNewMessage = (msg) => {
      if (!msg) return;
      if (msg.request_id === negotiationId || String(msg.request_id) === String(negotiationId)) {
        const index = messages.value.findIndex(m => m.id === msg.id);
        if (index !== -1) {
          messages.value[index] = msg;
        } else {
          messages.value.push(msg);
        }
      }
    };

    const handleMessageEdited = (msg) => {
      const index = messages.value.findIndex(m => m.id === msg.id);
      if (index !== -1) {
        messages.value[index] = msg;
      }
    };

    const handleMessageDeleted = (data) => {
      const index = messages.value.findIndex(m => m.id === data.id);
      if (index !== -1) {
        messages.value[index].is_deleted = true;
        messages.value[index].content = '';
      }
    };

    const handleUserTyping = (data) => {
      isTyping.value = data.isTyping;
      typingUser.value = data.isTyping ? (data.userId || 'Someone') : '';
    };

    socket.on('new-message', handleNewMessage);
    socket.on('message-edited', handleMessageEdited);
    socket.on('message-deleted', handleMessageDeleted);
    socket.on('user_typing', handleUserTyping);

    onUnmounted(() => {
      leaveNegotiationRoom(negotiationId);
      socket.off('new-message', handleNewMessage);
      socket.off('message-edited', handleMessageEdited);
      socket.off('message-deleted', handleMessageDeleted);
      socket.off('user_typing', handleUserTyping);
    });
  });

  watch(() => negotiationId, (newId, oldId) => {
    if (oldId) leaveNegotiationRoom(oldId);
    if (newId) {
      fetchMessageHistory();
      joinNegotiationRoom(newId);
    }
  });

  return {
    messages,
    isLoading,
    isTyping,
    typingUser,
    error,
    sendMessage,
    startTyping,
    stopTyping,
    fetchMessageHistory
  };
}

export default useChat;

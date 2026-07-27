import { ref } from 'vue';

const toastState = ref({
  show: false,
  message: '',
  type: 'success' // 'success' | 'error' | 'info' | 'warning'
});

let timeoutId = null;

export function useToast() {
  const showToast = (message, type = 'success') => {
    toastState.value = { show: true, message, type };
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      toastState.value.show = false;
    }, 3000);
  };

  const closeToast = () => {
    toastState.value.show = false;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };

  return {
    toastState,
    showToast,
    closeToast
  };
}

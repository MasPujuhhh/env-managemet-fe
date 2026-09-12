import { ref } from 'vue';
export type ToastType = 'success' | 'error' | 'info' | 'warning';
export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}
const toasts = ref<Toast[]>([]);
let nextId = 1;
export function useToast() {
  function push(message: string, type: ToastType = 'info') {
    const id = nextId++;
    toasts.value.push({ id, type, message });
    window.setTimeout(() => dismiss(id), 3500);
  }
  function dismiss(id: number) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id);
  }
  return { toasts, push, dismiss };
}

import { computed, ref } from 'vue';
import { authApi } from '../services/api/auth.api';
import { tokenStorage } from '../services/storage/token.storage';
import { useSidebarStore } from './sidebar.store';
import type { User } from '../types/api';
const user = ref<User | null>(null);
const loading = ref(false);
export function useAuthStore() {
  const isAuthenticated = computed(() => Boolean(tokenStorage.get() && user.value));
  async function login(email: string, password: string) {
    loading.value = true;
    try {
      const response = await authApi.login({ email, password });
      tokenStorage.set(response.data.data.accessToken);
      user.value = (await authApi.me()).data.data;
    } finally {
      loading.value = false;
    }
  }
  async function initialize() {
    if (!tokenStorage.get()) return;
    try {
      user.value = (await authApi.me()).data.data;
    } catch {
      tokenStorage.clear();
      user.value = null;
    }
  }
  async function logout() {
    try {
      await authApi.logout();
    } finally {
      tokenStorage.clear();
      user.value = null;
      useSidebarStore().invalidate();
    }
  }
  return { user, loading, isAuthenticated, login, initialize, logout };
}

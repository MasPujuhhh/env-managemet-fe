import { ref } from 'vue';

export type AppTheme = 'dark' | 'light';

const theme = ref<AppTheme>('dark');
const storageKey = 'env-vault-theme';

function getPreferredTheme(): AppTheme {
  const saved = localStorage.getItem(storageKey);
  if (saved === 'dark' || saved === 'light') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(nextTheme: AppTheme) {
  theme.value = nextTheme;
  document.documentElement.setAttribute('data-theme', nextTheme);
  // shadcn-vue tokens respond to the `.dark` class, so keep it in sync
  // with the app theme (single source of truth stays `data-theme`).
  document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  document.documentElement.style.colorScheme = nextTheme;
  window.localStorage.setItem(storageKey, nextTheme);
}

function initializeTheme() {
  applyTheme(getPreferredTheme());
}

function toggleTheme() {
  applyTheme(theme.value === 'dark' ? 'light' : 'dark');
}

export function useTheme() {
  return { theme, applyTheme, initializeTheme, toggleTheme };
}

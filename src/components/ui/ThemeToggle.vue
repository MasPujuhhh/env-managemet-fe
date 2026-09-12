<template>
  <Button
    variant="ghost"
    size="icon"
    type="button"
    :aria-label="`Switch to ${isDark ? 'light' : 'dark'} mode`"
    :title="`Switch to ${isDark ? 'light' : 'dark'} mode`"
    @click="toggleTheme"
  >
    <HugeiconsIcon :icon="isDark ? Sun03Icon : Moon02Icon" :size="16" />
  </Button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { HugeiconsIcon } from '@hugeicons/vue';
import { Moon02Icon, Sun03Icon } from '@hugeicons/core-free-icons';
import { Button } from './button';
import { useTheme } from '../../composables/useTheme';

const { theme, toggleTheme } = useTheme();
const isDark = computed(() => theme.value === 'dark');
</script>

<template>
  <div class="toast-stack">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      :class="['toast', `toast--${toast.type}`]"
      role="status"
    >
      <span>{{ toast.message }}</span
      ><button aria-label="Dismiss" @click="dismiss(toast.id)">×</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '../../composables/useToast';
const { toasts, dismiss } = useToast();
</script>

<template>
  <span :class="['badge', `badge--${variant}`]">
    <slot />
  </span>
</template>
<script setup lang="ts">
withDefaults(defineProps<{ variant?: 'success' | 'warning' | 'danger' | 'neutral' }>(), {
  variant: 'neutral',
});
</script>

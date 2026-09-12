<template>
  <button :class="['button', `button--${variant}`]" :disabled="disabled || loading" :type="type">
    <span v-if="loading" class="button__spinner" />
    <slot />
  </button>
</template>
<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    disabled?: boolean;
    loading?: boolean;
    type?: 'button' | 'submit';
  }>(),
  { variant: 'primary', type: 'button' },
);
</script>

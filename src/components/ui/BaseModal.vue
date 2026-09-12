<template>
  <Teleport to="body"
    ><div v-if="open" class="modal-backdrop" @click.self="$emit('close')">
      <section class="modal" role="dialog" aria-modal="true">
        <button class="modal__close" aria-label="Close" @click="$emit('close')">×</button><slot />
      </section></div
  ></Teleport>
</template>
<script setup lang="ts">
defineProps<{ open: boolean }>();
defineEmits<{ close: [] }>();
</script>

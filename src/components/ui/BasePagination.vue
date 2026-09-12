<template>
  <div v-if="totalPages > 1" class="pagination">
    <button
      class="button button--ghost"
      :disabled="page <= 1"
      @click="$emit('update:page', page - 1)"
    >
      ← Previous</button
    ><span>Page {{ page }} of {{ totalPages }}</span
    ><button
      class="button button--ghost"
      :disabled="page >= totalPages"
      @click="$emit('update:page', page + 1)"
    >
      Next →
    </button>
  </div>
</template>
<script setup lang="ts">
defineProps<{ page: number; totalPages: number }>();
defineEmits<{ 'update:page': [value: number] }>();
</script>

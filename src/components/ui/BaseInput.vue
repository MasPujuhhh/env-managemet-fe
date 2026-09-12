<template>
  <label class="field"
    ><span v-if="label">{{ label }}</span
    ><input
      v-bind="$attrs"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    /><small v-if="error" class="field__error">{{ error }}</small></label
  >
</template>
<script setup lang="ts">
defineOptions({ inheritAttrs: false });
defineProps<{ label?: string; modelValue?: string; error?: string }>();
defineEmits<{ 'update:modelValue': [value: string] }>();
</script>

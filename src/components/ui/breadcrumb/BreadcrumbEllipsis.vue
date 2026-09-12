<script lang="ts" setup>
import type { HTMLAttributes } from "vue"
import { HugeiconsIcon } from '@hugeicons/vue'
import { MoreHorizontalCircle01Icon } from '@hugeicons/core-free-icons'
import { cn } from "@/lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <span
    data-slot="breadcrumb-ellipsis"
    role="presentation"
    aria-hidden="true"
    :class="cn('flex size-9 items-center justify-center', props.class)"
  >
    <slot>
      <HugeiconsIcon :icon="MoreHorizontalCircle01Icon" class="size-4" />
    </slot>
    <span class="sr-only">More</span>
  </span>
</template>

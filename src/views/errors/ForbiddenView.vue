<template>
  <div class="grid min-h-svh place-items-center px-4">
    <Empty class="max-w-md border">
      <EmptyHeader>
        <EmptyMedia variant="icon"><HugeiconsIcon :icon="Shield01Icon" :size="22" /></EmptyMedia>
        <EmptyTitle class="text-4xl font-semibold">403</EmptyTitle>
        <EmptyTitle>Access denied</EmptyTitle>
        <EmptyDescription>You don't have permission to access this resource.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button as-child>
          <RouterLink to="/">
            <HugeiconsIcon :icon="ArrowLeft01Icon" :size="15" />
            <span>Back to dashboard</span>
          </RouterLink>
        </Button>
      </EmptyContent>
    </Empty>
  </div>
</template>

<script setup lang="ts">
import { HugeiconsIcon } from '@hugeicons/vue';
import { ArrowLeft01Icon, Shield01Icon } from '@hugeicons/core-free-icons';
import { Button } from '../../components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../components/ui/empty';
</script>

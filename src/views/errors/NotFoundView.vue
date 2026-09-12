<template>
  <div class="grid min-h-svh place-items-center px-4">
    <Empty class="max-w-md border">
      <EmptyHeader>
        <EmptyMedia variant="icon"><HugeiconsIcon :icon="FileNotFoundIcon" :size="22" /></EmptyMedia>
        <EmptyTitle class="text-4xl font-semibold">404</EmptyTitle>
        <EmptyTitle>Page not found</EmptyTitle>
        <EmptyDescription>The page you're looking for doesn't exist.</EmptyDescription>
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
import { ArrowLeft01Icon, FileNotFoundIcon } from '@hugeicons/core-free-icons';
import { Button } from '../../components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../components/ui/empty';
</script>

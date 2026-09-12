<template>
  <div class="grid gap-5">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div class="grid gap-1">
        <p class="text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">Overview</p>
        <h2 class="text-3xl font-semibold tracking-tight">Good morning</h2>
      </div>
      <Button as-child>
        <RouterLink to="/repositories">
          <span>Manage repositories</span>
          <HugeiconsIcon :icon="ArrowRight01Icon" :size="15" />
        </RouterLink>
      </Button>
    </header>
    <Card class="overflow-hidden">
      <CardContent class="flex items-center justify-between gap-6 p-8 md:p-14">
        <div class="grid gap-4">
          <Badge variant="secondary" class="w-fit">V1 · Secure by default</Badge>
          <h1 class="text-4xl font-semibold tracking-tight md:text-5xl">One place for<br />every environment.</h1>
          <p class="max-w-md text-sm text-muted-foreground">Manage repository secrets and provide secure, short-lived access to your delivery pipelines.</p>
        </div>
        <div class="hidden shrink-0 sm:block">
          <HugeiconsIcon :icon="SparklesIcon" :size="120" class="text-muted-foreground/40" />
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { HugeiconsIcon } from '@hugeicons/vue';
import { ArrowRight01Icon, SparklesIcon } from '@hugeicons/core-free-icons';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
</script>

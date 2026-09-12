<template>
  <div class="grid gap-5">
    <Card class="overflow-hidden">
      <CardContent class="grid items-center gap-4 p-6 md:grid-cols-[1.4fr_0.8fr] md:p-8">
        <div class="grid gap-3">
          <Badge variant="secondary" class="w-fit">
            <HugeiconsIcon :icon="Shield01Icon" :size="12" />
            <span>V1 · Secure by default</span>
          </Badge>
          <p class="text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">Welcome{{ displayName ? `, ${displayName}` : '' }}</p>
          <h2 class="text-3xl font-semibold tracking-tight md:text-4xl">One place for<br />every environment.</h2>
          <p class="max-w-md text-sm text-muted-foreground">Manage repository secrets and provide secure access to your delivery pipelines. Start from one of the sections below.</p>
        </div>
        <div class="grid min-h-[120px] place-items-center rounded-xl border bg-muted/50">
          <HugeiconsIcon :icon="SparklesIcon" :size="42" class="text-muted-foreground" />
        </div>
      </CardContent>
    </Card>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <Card v-for="link in links" :key="link.to">
        <CardContent class="grid gap-2.5 p-5">
          <div class="grid size-9 place-items-center rounded-lg border bg-muted/50">
            <HugeiconsIcon :icon="link.icon" :size="17" />
          </div>
          <strong class="text-sm font-semibold">{{ link.title }}</strong>
          <p class="text-xs text-muted-foreground">{{ link.description }}</p>
          <Button variant="link" size="sm" as-child class="w-fit px-0">
            <RouterLink :to="link.to">
              <span>{{ link.action }}</span>
              <HugeiconsIcon :icon="ArrowRight01Icon" :size="14" />
            </RouterLink>
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { HugeiconsIcon } from '@hugeicons/vue';
import {
  ArrowRight01Icon,
  Shield01Icon,
  SparklesIcon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons';
import { useAuthStore } from '../../stores/auth.store';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';

const auth = useAuthStore();
const displayName = computed(() => auth.user.value?.name || '');
const isSuperadmin = computed(() => auth.user.value?.systemRole === 'SUPERADMIN');

const links = computed(() => [
  ...(isSuperadmin.value
    ? [
        {
          title: 'Users',
          description: 'Manage accounts and global access.',
          action: 'View users',
          to: '/users',
          icon: UserGroupIcon,
        },
      ]
    : []),
]);
</script>

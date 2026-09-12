<template>
  <header class="mb-5 flex items-start justify-between gap-5 border-b pb-4">
    <div class="grid min-w-0 gap-1.5">
      <div class="flex items-center gap-2">
        <SidebarTrigger class="-ml-1" />
        <p class="text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">{{ eyebrow }}</p>
      </div>
      <h1 class="text-2xl font-semibold tracking-tight md:text-3xl">{{ title }}</h1>

      <Breadcrumb v-if="breadcrumbItems.length">
        <BreadcrumbList>
          <template v-for="(item, index) in breadcrumbItems" :key="item.path">
            <BreadcrumbItem>
              <BreadcrumbLink as-child v-if="index < breadcrumbItems.length - 1">
                <RouterLink :to="item.path">{{ item.label }}</RouterLink>
              </BreadcrumbLink>
              <BreadcrumbPage v-else>{{ item.label }}</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator v-if="index < breadcrumbItems.length - 1" />
          </template>
        </BreadcrumbList>
      </Breadcrumb>
    </div>

    <div class="flex flex-wrap items-center justify-end gap-2">
      <Button
        v-if="showCreate"
        type="button"
        @click="$emit('create')"
      >
        <HugeiconsIcon :icon="PlusSignIcon" :size="15" />
        <span>{{ createLabel }}</span>
      </Button>

      <Button
        v-if="showDuplicate"
        variant="secondary"
        type="button"
        @click="$emit('duplicate')"
      >
        <HugeiconsIcon :icon="Copy01Icon" :size="15" />
        <span>{{ duplicateLabel }}</span>
      </Button>

      <Button
        v-if="showDelete"
        variant="destructive"
        type="button"
        @click="$emit('delete')"
      >
        <HugeiconsIcon :icon="Delete02Icon" :size="15" />
        <span>{{ deleteLabel }}</span>
      </Button>

      <Button variant="outline" type="button" aria-label="Search">
        <HugeiconsIcon :icon="Search01Icon" :size="15" />
        <span class="hidden sm:inline">Search</span>
      </Button>
      <Button variant="ghost" size="icon" type="button" aria-label="Notifications" title="Notifications">
        <HugeiconsIcon :icon="Notification01Icon" :size="16" />
      </Button>
      <ThemeToggle />
      <div class="flex items-center gap-2.5 pl-1.5">
        <Avatar class="size-9">
          <AvatarFallback>{{ initials }}</AvatarFallback>
        </Avatar>
        <div class="grid gap-0.5">
          <strong class="text-xs font-semibold">{{ displayName }}</strong>
          <small class="text-[11px] text-muted-foreground">{{ userRole }}</small>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { HugeiconsIcon } from '@hugeicons/vue';
import { Copy01Icon, Delete02Icon, Notification01Icon, PlusSignIcon, Search01Icon } from '@hugeicons/core-free-icons';
import ThemeToggle from '../ui/ThemeToggle.vue';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../ui/breadcrumb';
import { Button } from '../ui/button';
import { SidebarTrigger } from '../ui/sidebar';
import { useAuthStore } from '../../stores/auth.store';

const props = withDefaults(
  defineProps<{
    title: string;
    eyebrow?: string;
    email?: string;
    showCreate?: boolean;
    showDuplicate?: boolean;
    showDelete?: boolean;
    createLabel?: string;
    duplicateLabel?: string;
    deleteLabel?: string;
  }>(),
  {
    showCreate: false,
    showDuplicate: false,
    showDelete: false,
    createLabel: 'Create',
    duplicateLabel: 'Duplicate',
    deleteLabel: 'Delete',
  },
);

defineEmits<{ create: []; duplicate: []; delete: [] }>();
const auth = useAuthStore();
const route = useRoute();

const displayName = computed(() => auth.user.value?.name || props.email || 'Administrator');
const initials = computed(() => (auth.user.value?.name || props.email || 'AD').slice(0, 2).toUpperCase());
const userRole = computed(() => auth.user.value?.systemRole || 'ADMIN');

const breadcrumbItems = computed(() => {
  const segments = route.path.split('/').filter(Boolean);
  if (!segments.length) {
    return [{ label: 'Dashboard', path: '/' }];
  }

  const items: Array<{ label: string; path: string }> = [{ label: 'Home', path: '/' }];
  let path = '';

  segments.forEach((segment) => {
    path += `/${segment}`;
    const label = segment
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
    items.push({ label, path });
  });

  return items;
});
</script>

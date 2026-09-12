<template>
  <SidebarProvider>
    <AppSidebar @logout="$emit('logout')" />
    <SidebarInset>
      <main class="flex min-h-svh flex-1 flex-col bg-background">
        <div class="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-6">
          <slot />
        </div>
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
<script setup lang="ts">
import AppSidebar from './AppSidebar.vue';
import { SidebarInset, SidebarProvider } from '../ui/sidebar';

defineEmits<{ logout: [] }>();
</script>

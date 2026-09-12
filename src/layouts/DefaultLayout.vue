<template>
  <AppLayout @logout="logout">
    <RouterView />
  </AppLayout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import AppLayout from '../components/layout/AppLayout.vue';
import { useAuthStore } from '../stores/auth.store';

const router = useRouter();
const auth = useAuthStore();

async function logout() {
  await auth.logout();
  router.push('/login');
}
</script>

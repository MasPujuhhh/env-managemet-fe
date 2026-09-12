<template>
  <div class="grid min-h-svh place-items-center bg-background px-4 py-10">
    <Card class="w-full max-w-md">
      <CardHeader class="grid gap-3">
        <div class="flex items-center gap-2.5">
          <Avatar class="size-9 rounded-lg">
            <AvatarFallback class="rounded-lg font-bold">W</AvatarFallback>
          </Avatar>
          <span class="text-sm font-semibold">WG <b>Vault</b></span>
        </div>
        <p class="text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">Environment control</p>
        <CardTitle class="text-2xl">Welcome back</CardTitle>
        <CardDescription>Sign in to manage your application configuration.</CardDescription>
      </CardHeader>
      <CardContent>
        <form class="grid gap-4" @submit.prevent="submit">
          <div class="grid gap-2">
            <Label for="login-email">Email</Label>
            <Input
              id="login-email"
              v-model="email"
              type="email"
              placeholder="you@company.com"
              required
            />
          </div>
          <div class="grid gap-2">
            <Label for="login-password">Password</Label>
            <Input
              id="login-password"
              v-model="password"
              type="password"
              placeholder="••••••••"
              minlength="8"
              required
            />
          </div>
          <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
          <Button type="submit" :disabled="!email || !password || auth.loading.value" class="w-full">
            <HugeiconsIcon v-if="auth.loading.value" :icon="Loading03Icon" :size="15" />
            <HugeiconsIcon v-else :icon="Login01Icon" :size="15" />
            <span>{{ auth.loading.value ? 'Signing in...' : 'Sign in' }}</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { HugeiconsIcon } from '@hugeicons/vue';
import { Loading03Icon, Login01Icon } from '@hugeicons/core-free-icons';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useAuthStore } from '../../stores/auth.store';
import { useApiError } from '../../composables/useApiError';
const email = ref(''),
  password = ref(''),
  error = ref(''),
  router = useRouter(),
  auth = useAuthStore(),
  apiError = useApiError();
async function submit() {
  error.value = '';
  try {
    await auth.login(email.value, password.value);
    router.push('/');
  } catch (e) {
    error.value = apiError.message(e, 'Unable to sign in. Check your credentials.', { expiredMessage: null });
  }
}
document.title = 'WG Vault — Sign in';
</script>

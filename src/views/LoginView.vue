<template>
  <section class="auth">
    <div class="card">
      <p class="eyebrow">ENVIRONMENT CONTROL</p>
      <h1>Welcome back</h1>
      <p class="muted">Sign in to manage your application configuration.</p>
      <form @submit.prevent="login">
        <label
          >Email<input
            v-model="email"
            type="email"
            required
            placeholder="admin@example.com" /></label
        ><label>Password<input v-model="password" type="password" required minlength="8" /></label>
        <p v-if="error" class="error">{{ error }}</p>
        <button class="primary">Sign in</button>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authApi } from '../services/api/auth.api';
import { tokenStorage } from '../services/storage/token.storage';

const email = ref(''),
  password = ref(''),
  error = ref('');
const router = useRouter();

async function login() {
  try {
    const response = await authApi.login({
      email: email.value,
      password: password.value,
    });
    tokenStorage.set(response.data.data.accessToken);
    router.push('/');
  } catch {
    error.value = 'Invalid email or password.';
  }
}
</script>

<template>
  <div>
    <header>
      <div>
        <RouterLink to="/repositories" class="back">← Repositories</RouterLink>
        <h2>{{ repo?.name || 'Repository' }}</h2>
        <p class="muted">{{ repo?.description || repo?.slug }}</p>
      </div>
      <button class="danger" @click="remove">Delete</button>
    </header>
    <section class="card">
      <div class="section-head">
        <h3>Secrets</h3>
        <button class="primary" @click="add">+ Add secret</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>KEY</th>
            <th>VALUE</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in secrets" :key="s.id">
            <td>
              <code>{{ s.key }}</code>
            </td>
            <td><span class="masked">••••••••••••</span></td>
            <td>
              <button class="icon-btn" @click="edit(s)">Edit</button
              ><button class="icon-btn danger-text" @click="del(s)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!secrets.length" class="empty">No secrets stored yet.</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { repositoryApi } from '../services/api/repository.api';
import { secretApi } from '../services/api/secret.api';
import { useSidebarStore } from '../stores/sidebar.store';
import type { Repository, Secret } from '../types/api';

const route = useRoute(),
  router = useRouter(),
  sidebar = useSidebarStore(),
  repo = ref<Repository | null>(null),
  secrets = ref<Secret[]>([]);

async function load() {
  repo.value = (await repositoryApi.get(String(route.params.id))).data.data;
  secrets.value = (await secretApi.list(String(route.params.id))).data.data;
}

async function add() {
  const key = window.prompt('Secret key');
  if (!key) return;
  const value = window.prompt('Secret value') ?? '';
  await secretApi.create(String(route.params.id), { key, value });
  load();
}

async function edit(s: Secret) {
  const value = window.prompt('New secret value');
  if (value !== null) {
    await secretApi.update(String(route.params.id), s.id, { key: s.key, value });
  }
  load();
}

async function del(s: Secret) {
  if (window.confirm(`Delete ${s.key}?`)) {
    await secretApi.remove(String(route.params.id), s.id);
    load();
  }
}

async function remove() {
  if (window.confirm('Delete this repository?')) {
    await repositoryApi.remove(String(route.params.id));
    await sidebar.refresh();
    router.push('/repositories');
  }
}

onMounted(load);

watch(
  () => route.params.id,
  async (next, prev) => {
    if (next && next !== prev) {
      repo.value = null;
      secrets.value = [];
      await load();
    }
  },
);
</script>

<template>
  <div>
    <header>
      <div>
        <p class="eyebrow">WORKSPACE</p>
        <h2>Repositories</h2>
      </div>
      <button class="primary" @click="create">+ New repository</button>
    </header>
    <div v-if="error" class="error">{{ error }}</div>
    <div class="grid">
      <RouterLink v-for="r in repos" :key="r.id" :to="'/repositories/' + r.id" class="repo card"
        ><span class="icon">⌘</span>
        <h3>{{ r.name }}</h3>
        <p class="muted">{{ r.description || 'No description' }}</p>
        <small>{{ r._count?.secrets || 0 }} secrets · {{ r.slug }}</small></RouterLink
      >
    </div>
    <p v-if="!repos.length" class="empty">No repositories yet. Create your first one.</p>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { organizationApi } from '../services/api/organization.api';
import { workspaceApi } from '../services/api/workspace.api';
import { repositoryGroupApi } from '../services/api/repository-group.api';
import { repositoryApi } from '../services/api/repository.api';
import type { Repository } from '../types/api';

const repos = ref<Repository[]>([]),
  error = ref('');

async function load() {
  try {
    const organizations = (await organizationApi.list()).data.data;
    const list: Repository[] = [];

    for (const organization of organizations) {
      const workspaces = (await workspaceApi.list(organization.id)).data.data;
      for (const workspace of workspaces) {
        const groups = (await repositoryGroupApi.list(workspace.id)).data.data;
        for (const group of groups) {
          const response = await repositoryApi.listByGroup(group.id);
          list.push(...response.data.data);
        }
      }
    }

    repos.value = list;
    error.value = '';
  } catch {
    error.value = 'Could not load repositories from the backend hierarchy.';
  }
}

async function create() {
  const name = window.prompt('Repository name');
  if (!name) return;
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  try {
    const organizations = (await organizationApi.list()).data.data;
    const org = organizations[0];
    if (!org) throw new Error('No organization available');

    const workspaces = (await workspaceApi.list(org.id)).data.data;
    const workspace = workspaces[0];
    if (!workspace) throw new Error('No workspace available');

    const groups = (await repositoryGroupApi.list(workspace.id)).data.data;
    const group = groups[0];
    if (!group) throw new Error('No repository group available');

    await repositoryApi.create(group.id, { name, slug });
    await load();
  } catch {
    error.value = 'Could not create repository in the current workspace group.';
  }
}

onMounted(load);
</script>

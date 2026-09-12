<template>
  <div class="grid gap-5">
    <Button variant="ghost" size="sm" as-child class="w-fit">
      <RouterLink to="/repositories">
        <HugeiconsIcon :icon="ArrowLeft01Icon" :size="14" />
        <span>Back to repositories</span>
      </RouterLink>
    </Button>
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="grid gap-1">
        <p class="text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">Repository</p>
        <h2 class="text-2xl font-semibold tracking-tight">{{ repo?.name || 'Repository' }}</h2>
        <p v-if="repo?.description" class="text-sm text-muted-foreground">{{ repo.description }}</p>
        <div v-if="repo?.slug" class="flex items-center gap-1.5">
          <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{{ repo.slug }}</code>
          <Button variant="ghost" size="icon-xs" type="button" aria-label="Copy slug" title="Copy slug" @click="copySlug">
            <HugeiconsIcon :icon="Copy01Icon" :size="13" />
          </Button>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <Button variant="secondary" @click="openEditRepo">
          <HugeiconsIcon :icon="PencilEdit01Icon" :size="15" />
          <span>Edit</span>
        </Button>
        <Button variant="destructive" @click="removeRepository">
          <HugeiconsIcon :icon="Delete02Icon" :size="15" />
        </Button>
      </div>
    </div>

    <Tabs v-model="activeTab">
      <TabsList>
        <TabsTrigger value="list">
          <HugeiconsIcon :icon="Database01Icon" :size="14" />
          <span>Secret list</span>
        </TabsTrigger>
        <TabsTrigger value="editor">
          <HugeiconsIcon :icon="File01Icon" :size="14" />
          <span>Environment text editor</span>
        </TabsTrigger>
        <TabsTrigger value="keys">
          <HugeiconsIcon :icon="Key01Icon" :size="14" />
          <span>API keys</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="list">
        <Card>
          <CardHeader>
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="grid gap-1">
                <p class="text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">Individual management</p>
                <CardTitle>Secrets</CardTitle>
              </div>
              <Button @click="openCreate">
                <HugeiconsIcon :icon="PlusSignIcon" :size="15" />
                <span>Add secret</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent class="grid gap-4">
            <div class="flex items-center gap-3 rounded-lg border bg-muted/50 px-3 py-2">
              <HugeiconsIcon :icon="Search01Icon" :size="15" class="shrink-0 text-muted-foreground" />
              <Input v-model="search" placeholder="Search secrets..." class="border-0 bg-transparent shadow-none focus-visible:ring-0" />
              <span class="shrink-0 text-xs text-muted-foreground">{{ filtered.length }} secrets</span>
            </div>
            <div v-if="loading" class="grid place-items-center py-8"><Spinner /></div>
            <Empty v-else-if="!filtered.length">
              <EmptyHeader>
                <EmptyTitle>No secrets found</EmptyTitle>
                <EmptyDescription>Add a secret individually or use the environment text editor.</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button @click="openCreate">
                  <HugeiconsIcon :icon="PlusSignIcon" :size="15" />
                  <span>Add secret</span>
                </Button>
              </EmptyContent>
            </Empty>
            <div v-else class="overflow-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead class="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="secret in filtered" :key="secret.id">
                    <TableCell><code class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{{ secret.key }}</code></TableCell>
                    <TableCell>
                      <span v-if="secret.value === null" class="tracking-[0.2em] text-muted-foreground">••••••••••••</span>
                      <span v-else class="font-mono text-xs">{{ displaySecretValue(secret.value) }}</span>
                    </TableCell>
                    <TableCell class="text-right">
                      <Button variant="ghost" size="sm" @click="openEdit(secret)">
                        <HugeiconsIcon :icon="PencilEdit01Icon" :size="14" />
                      </Button>
                      <Button variant="ghost" size="sm" class="text-destructive hover:text-destructive" @click="removeSecret(secret)">
                        <HugeiconsIcon :icon="Delete02Icon" :size="14" />
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="keys" v-if="repo">
        <Card>
          <CardHeader>
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="grid gap-1">
                <p class="text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">Credentials</p>
                <CardTitle>API keys</CardTitle>
              </div>
              <Button @click="openKeyCreate">
                <HugeiconsIcon :icon="PlusSignIcon" :size="15" />
                <span>Generate API key</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent class="grid gap-4">
            <div v-if="keyLoading" class="grid place-items-center py-8"><Spinner /></div>
            <Empty v-else-if="!apiKeys.length">
              <EmptyHeader>
                <EmptyTitle>No API keys yet</EmptyTitle>
                <EmptyDescription>Generate an API key for CI/CD or service-to-service access.</EmptyDescription>
              </EmptyHeader>
            </Empty>
            <div v-else class="overflow-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="key in apiKeys" :key="key.id">
                    <TableCell class="font-medium">{{ key.name }}</TableCell>
                    <TableCell>{{ formatDate(key.createdAt) }}</TableCell>
                    <TableCell>
                      <Badge :variant="key.revokedAt ? 'destructive' : 'default'">{{ key.revokedAt ? 'Revoked' : 'Active' }}</Badge>
                    </TableCell>
                    <TableCell class="text-right">
                      <Button v-if="!key.revokedAt" variant="ghost" size="sm" class="text-destructive hover:text-destructive" @click="revokeKey(key)">Revoke</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="editor" v-if="repo">
        <EnvironmentEditor :repository-id="repo.id" @synced="load" />
      </TabsContent>
    </Tabs>

    <Dialog :open="Boolean(rawKey)" @update:open="(v: boolean) => { if (!v) rawKey = '' }">
      <DialogContent>
        <DialogHeader>
          <DialogDescription>API key generated</DialogDescription>
          <DialogTitle>Copy this key now</DialogTitle>
        </DialogHeader>
        <p class="text-sm text-muted-foreground">This value is shown once and cannot be retrieved again.</p>
        <div class="flex items-center justify-between gap-2 rounded-xl border bg-muted/50 p-3 font-mono text-xs break-all">
          {{ rawKey }}
          <Button variant="ghost" size="sm" @click="copyKey">
            <HugeiconsIcon :icon="Copy01Icon" :size="14" />
            <span>Copy</span>
          </Button>
        </div>
        <DialogFooter>
          <Button @click="rawKey = ''">Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog :open="keyNameModal" @update:open="(v: boolean) => { keyNameModal = v }">
      <DialogContent>
        <DialogHeader>
          <DialogDescription>Credentials</DialogDescription>
          <DialogTitle>Generate API key</DialogTitle>
        </DialogHeader>
        <form class="grid gap-4" @submit.prevent="submitKeyName">
          <div class="grid gap-2">
            <Label for="api-key-name">Key name</Label>
            <Input id="api-key-name" v-model="keyName" placeholder="github-production" required />
          </div>
          <DialogFooter>
            <Button variant="ghost" type="button" @click="keyNameModal = false">Cancel</Button>
            <Button type="submit" :disabled="!keyName.trim()">Generate</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <Dialog :open="modal" @update:open="(v: boolean) => { modal = v }">
      <DialogContent>
        <DialogHeader>
          <DialogDescription>Individual secret</DialogDescription>
          <DialogTitle>{{ editing ? 'Edit secret' : 'Add secret' }}</DialogTitle>
        </DialogHeader>
        <form class="grid gap-4" @submit.prevent="saveSecret">
          <div class="grid gap-2">
            <Label for="secret-key">Key</Label>
            <Input id="secret-key" v-model="form.key" required />
          </div>
          <div class="grid gap-2">
            <Label for="secret-value">Value</Label>
            <Input id="secret-value" v-model="form.value" type="text" required autocomplete="off" />
          </div>
          <p class="text-xs text-muted-foreground">
            The current value is shown as stored; edit it directly or replace it with a new one.
          </p>
          <DialogFooter>
            <Button variant="ghost" type="button" @click="modal = false">Cancel</Button>
            <Button type="submit" :disabled="saving">{{ saving ? 'Saving...' : 'Save secret' }}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <Dialog :open="editRepoModal" @update:open="(v: boolean) => { editRepoModal = v }">
      <DialogContent>
        <DialogHeader>
          <DialogDescription>Repository</DialogDescription>
          <DialogTitle>Edit repository</DialogTitle>
        </DialogHeader>
        <form class="grid gap-4" @submit.prevent="saveRepo">
          <div class="grid gap-2">
            <Label for="repo-edit-name">Name</Label>
            <Input id="repo-edit-name" v-model="repoForm.name" required maxlength="100" />
          </div>
          <div class="grid gap-2">
            <Label for="repo-edit-desc">Description</Label>
            <Input id="repo-edit-desc" v-model="repoForm.description" />
          </div>
          <DialogFooter>
            <Button variant="ghost" type="button" @click="editRepoModal = false">Cancel</Button>
            <Button type="submit" :disabled="savingRepo">{{ savingRepo ? 'Saving...' : 'Save changes' }}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { HugeiconsIcon } from '@hugeicons/vue';
import {
  ArrowLeft01Icon,
  Copy01Icon,
  Database01Icon,
  Delete02Icon,
  File01Icon,
  Key01Icon,
  PencilEdit01Icon,
  PlusSignIcon,
  Search01Icon,
} from '@hugeicons/core-free-icons';
import { repositoryApi } from '../../services/api/repository.api';
import { secretApi } from '../../services/api/secret.api';
import { apiKeyApi } from '../../services/api/api-key.api';
import { useSidebarStore } from '../../stores/sidebar.store';
import type { ApiKey, Repository, Secret, SecretInput } from '../../types/api';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '../../components/ui/empty';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Spinner } from '../../components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import EnvironmentEditor from '../../components/secret/EnvironmentEditor.vue';
import { useApiError } from '../../composables/useApiError';
import { useConfirm } from '../../composables/useConfirm';
import { useToast } from '../../composables/useToast';
const route = useRoute(),
  router = useRouter(),
  toast = useToast(),
  apiError = useApiError(),
  confirm = useConfirm();
const sidebar = useSidebarStore();
const repo = ref<Repository>();
const secrets = ref<Secret[]>([]);
const apiKeys = ref<ApiKey[]>([]);
const activeTab = ref<string>('list');
const search = ref('');
const loading = ref(true);
const keyLoading = ref(true);
const saving = ref(false);
const modal = ref(false);
const rawKey = ref('');
const editing = ref<Secret | null>(null);
const form = ref<SecretInput>({ key: '', value: '' });
const editRepoModal = ref(false);
const savingRepo = ref(false);
const repoForm = ref({ name: '', description: '' });
const keyNameModal = ref(false);
const keyName = ref('');
const filtered = computed(() =>
  secrets.value.filter(
    (secret) =>
      secret.type === 'SECRET' &&
      `${secret.key ?? ''} ${secret.value ?? ''}`.toLowerCase().includes(search.value.toLowerCase()),
  ),
);

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Tampilan saja: kupas sepasang kutip pembungkus ("..." / '...') sisa import .env.
function displaySecretValue(value: string | null): string | null {
  if (value === null) return null;
  const trimmed = value.trim();
  if (trimmed.length >= 2) {
    const first = trimmed[0];
    const last = trimmed[trimmed.length - 1];
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      return trimmed.slice(1, -1);
    }
  }
  return trimmed;
}

async function load() {
  loading.value = true;
  try {
    repo.value = (await repositoryApi.get(String(route.params.id))).data.data;
    secrets.value = (await secretApi.list(String(route.params.id))).data.data;
    await loadApiKeys();
  } catch (error) {
    console.error('Failed to load repository details', error);
    toast.push(apiError.message(error, 'Unable to load repository details.'), 'error');
    router.push('/repositories');
  } finally {
    loading.value = false;
  }
}

async function loadApiKeys() {
  if (!repo.value) return;
  keyLoading.value = true;
  try {
    const response = await apiKeyApi.list(repo.value.id);
    apiKeys.value = response.data.data;
  } catch (e) {
    apiKeys.value = [];
    toast.push(apiError.message(e, 'Unable to load API keys.'), 'error');
  } finally {
    keyLoading.value = false;
  }
}
function openCreate() {
  editing.value = null;
  form.value = { key: '', value: '' };
  modal.value = true;
}
function openEdit(secret: Secret) {
  editing.value = secret;
  form.value = { key: secret.key, value: displaySecretValue(secret.value) ?? '' };
  modal.value = true;
}
async function saveSecret() {
  saving.value = true;
  try {
    if (editing.value) {
      await secretApi.update(String(route.params.id), editing.value.id, form.value);
    } else {
      await secretApi.create(String(route.params.id), form.value);
    }
    toast.push('Secret saved successfully.', 'success');
    modal.value = false;
    await load();
  } catch (e) {
    toast.push(apiError.message(e, 'Unable to save secret.'), 'error');
  } finally {
    saving.value = false;
  }
}
async function removeSecret(secret: Secret) {
  const ok = await confirm.ask({
    title: `Delete ${secret.key}?`,
    description: 'This secret will be permanently removed from the repository.',
  });
  if (!ok) return;
  try {
    await secretApi.remove(String(route.params.id), secret.id);
    toast.push('Secret deleted.', 'success');
    await load();
  } catch (e) {
    toast.push(apiError.message(e, 'Unable to delete secret.'), 'error');
  }
}
async function removeRepository() {
  if (!repo.value) return;
  const ok = await confirm.ask({
    title: `Delete ${repo.value.name}?`,
    description: 'The repository and all its secrets and API keys will be permanently removed.',
  });
  if (!ok || !repo.value) return;
  await repositoryApi.remove(repo.value.id);
  await sidebar.refresh();
  router.push('/repositories');
}

function openEditRepo() {
  if (!repo.value) return;
  repoForm.value = {
    name: repo.value.name,
    description: repo.value.description || '',
  };
  editRepoModal.value = true;
}

async function saveRepo() {
  if (!repo.value) return;
  const name = repoForm.value.name.trim();
  if (!name) {
    toast.push('Name is required.', 'error');
    return;
  }
  savingRepo.value = true;
  try {
    await repositoryApi.update(repo.value.id, {
      name,
      description: repoForm.value.description.trim() || undefined,
    });
    toast.push('Repository updated.', 'success');
    editRepoModal.value = false;
    await load();
    await sidebar.refresh();
  } catch (e) {
    toast.push(apiError.message(e, 'Unable to update repository.'), 'error');
  } finally {
    savingRepo.value = false;
  }
}

async function copySlug() {
  if (!repo.value?.slug) return;
  try {
    await navigator.clipboard.writeText(repo.value.slug);
    toast.push('Slug copied.', 'success');
  } catch {
    toast.push('Clipboard access denied.', 'error');
  }
}

function openKeyCreate() {
  if (!repo.value) return;
  keyName.value = '';
  keyNameModal.value = true;
}

function submitKeyName() {
  const name = keyName.value.trim();
  if (!name) return;
  keyNameModal.value = false;
  generateKey(name);
}

async function generateKey(name: string) {
  if (!repo.value) return;
  try {
    const response = await apiKeyApi.create(repo.value.id, { name });
    rawKey.value = response.data.data.key;
    await loadApiKeys();
  } catch (e) {
    toast.push(apiError.message(e, 'Unable to generate API key.'), 'error');
  }
}

async function revokeKey(key: ApiKey) {
  if (!repo.value) return;
  const ok = await confirm.ask({
    title: `Revoke ${key.name}?`,
    description: 'Systems using this key will immediately lose access.',
    confirmLabel: 'Revoke',
  });
  if (!ok || !repo.value) return;
  try {
    await apiKeyApi.revoke(repo.value.id, key.id);
    toast.push('API key revoked.', 'success');
    await loadApiKeys();
  } catch (e) {
    toast.push(apiError.message(e, 'Unable to revoke API key.'), 'error');
  }
}

async function copyKey() {
  try {
    await navigator.clipboard.writeText(rawKey.value);
    toast.push('API key copied.', 'success');
  } catch {
    toast.push('Clipboard access denied.', 'error');
  }
}

onMounted(load);

watch(
  () => route.params.id,
  async (next, prev) => {
    if (next && next !== prev) {
      repo.value = undefined;
      secrets.value = [];
      apiKeys.value = [];
      editing.value = null;
      modal.value = false;
      rawKey.value = '';
      await load();
    }
  },
);
</script>

<template>
  <div class="grid gap-5">
    <div class="flex flex-wrap items-end justify-between gap-4 pt-2">
      <p class="text-sm text-muted-foreground">Manage keys used by CI/CD systems.</p>
      <Button @click="open">
        <HugeiconsIcon :icon="PlusSignIcon" :size="15" />
        <span>Generate API key</span>
      </Button>
    </div>
    <Card>
      <CardContent class="grid gap-4 p-5">
        <Empty v-if="!repositories.length" class="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon"><HugeiconsIcon :icon="Key01Icon" :size="20" /></EmptyMedia>
            <EmptyTitle>No repository available</EmptyTitle>
            <EmptyDescription>Create a repository before generating an API key.</EmptyDescription>
          </EmptyHeader>
        </Empty>
        <div v-else class="flex flex-wrap items-end gap-3">
          <div class="grid min-w-52 flex-1 gap-2">
            <Label for="key-name">Key name</Label>
            <Input id="key-name" v-model="name" placeholder="github-production" />
          </div>
          <div class="grid min-w-52 flex-1 gap-2">
            <Label>Repository</Label>
            <Select v-model="repositoryId">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Select repository" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="r in repositories" :key="r.id" :value="r.id">{{ r.name }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button :disabled="saving || !repositoryId || !name" @click="generate">
            <HugeiconsIcon :icon="Key01Icon" :size="15" />
            <span>{{ saving ? 'Generating...' : 'Generate' }}</span>
          </Button>
        </div>
        <div v-if="keys.length" class="overflow-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Repository</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="key in keys" :key="key.id">
                <TableCell class="font-medium">{{ key.name }}</TableCell>
                <TableCell>{{ key.repositoryName }}</TableCell>
                <TableCell>{{ new Date(key.createdAt).toLocaleDateString() }}</TableCell>
                <TableCell>
                  <Badge :variant="key.revokedAt ? 'destructive' : 'default'">{{
                    key.revokedAt ? 'Revoked' : 'Active'
                  }}</Badge>
                </TableCell>
                <TableCell class="text-right">
                  <Button v-if="!key.revokedAt" variant="ghost" size="sm" class="text-destructive hover:text-destructive" @click="revoke(key)">
                    <HugeiconsIcon :icon="Delete02Icon" :size="14" />
                    <span>Revoke</span>
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <Empty v-else class="border border-dashed">
          <EmptyHeader>
            <EmptyTitle>No API keys yet</EmptyTitle>
            <EmptyDescription>Generate a key for a CI/CD integration.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </CardContent>
    </Card>
    <Dialog :open="Boolean(rawKey)" @update:open="(v: boolean) => { if (!v) rawKey = '' }">
      <DialogContent>
        <DialogHeader>
          <DialogDescription>API key generated</DialogDescription>
          <DialogTitle>Copy this key now</DialogTitle>
        </DialogHeader>
        <p class="text-sm text-muted-foreground">You will not be able to view it again.</p>
        <div class="flex items-center justify-between gap-2 rounded-xl border bg-muted/50 p-3 font-mono text-xs break-all">
          {{ rawKey }}
          <Button variant="ghost" size="sm" @click="copy">
            <HugeiconsIcon :icon="Copy01Icon" :size="14" />
            <span>Copy</span>
          </Button>
        </div>
        <DialogFooter>
          <Button @click="rawKey = ''">Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { HugeiconsIcon } from '@hugeicons/vue';
import { Copy01Icon, Delete02Icon, Key01Icon, PlusSignIcon } from '@hugeicons/core-free-icons';
import { organizationApi } from '../../services/api/organization.api';
import { workspaceApi } from '../../services/api/workspace.api';
import { repositoryGroupApi } from '../../services/api/repository-group.api';
import { repositoryApi } from '../../services/api/repository.api';
import { apiKeyApi } from '../../services/api/api-key.api';
import type { Repository, ApiKey } from '../../types/api';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../components/ui/empty';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { useApiError } from '../../composables/useApiError';
import { useConfirm } from '../../composables/useConfirm';
import { useToast } from '../../composables/useToast';

const toast = useToast(),
  apiError = useApiError(),
  confirm = useConfirm(),
  repositories = ref<Repository[]>([]),
  keys = ref<(ApiKey & { repositoryName: string })[]>([]),
  repositoryId = ref(''),
  name = ref(''),
  rawKey = ref(''),
  saving = ref(false);

async function loadRepositories() {
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

  repositories.value = list;
  return list;
}

async function open() {
  if (!repositoryId.value && repositories.value[0]) repositoryId.value = repositories.value[0].id;
}

async function load() {
  try {
    const list = await loadRepositories();
    const all = (
      await Promise.all(
        list.map(async (r) =>
          (await apiKeyApi.list(r.id)).data.data.map((k) => ({ ...k, repositoryName: r.name })),
        ),
      )
    ).flat();
    keys.value = all;
  } catch (e) {
    toast.push(apiError.message(e, 'Unable to load API keys.'), 'error');
  }
}

async function generate() {
  if (!repositoryId.value || !name.value) return;
  saving.value = true;
  try {
    rawKey.value = (await apiKeyApi.create(repositoryId.value, { name: name.value })).data.data.key;
    name.value = '';
    await load();
  } catch (e) {
    toast.push(apiError.message(e, 'Unable to generate API key.'), 'error');
  } finally {
    saving.value = false;
  }
}

async function revoke(k: ApiKey & { repositoryName: string }) {
  const r = repositories.value.find((x) => x.name === k.repositoryName);
  if (!r) return;
  const ok = await confirm.ask({
    title: `Revoke ${k.name}?`,
    description: 'Systems using this key will immediately lose access.',
    confirmLabel: 'Revoke',
  });
  if (!ok) return;
  try {
    await apiKeyApi.revoke(r.id, k.id);
    toast.push('API key revoked.', 'success');
    load();
  } catch (e) {
    toast.push(apiError.message(e, 'Unable to revoke API key.'), 'error');
  }
}

async function copy() {
  try {
    await navigator.clipboard.writeText(rawKey.value);
    toast.push('API key copied.', 'success');
  } catch {
    toast.push('Clipboard access denied.', 'error');
  }
}

onMounted(load);
</script>

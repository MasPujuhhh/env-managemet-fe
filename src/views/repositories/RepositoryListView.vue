<template>
  <div class="grid gap-5">
    <div class="flex flex-wrap items-end justify-between gap-4 pt-2">
      <p class="text-sm text-muted-foreground">Manage repositories and their environment secrets.</p>
      <Button @click="openCreate">
        <HugeiconsIcon :icon="PlusSignIcon" :size="15" />
        <span>New repository</span>
      </Button>
    </div>

    <div class="flex items-center gap-3 rounded-lg border bg-muted/50 px-3 py-2">
      <HugeiconsIcon :icon="Search01Icon" :size="15" class="shrink-0 text-muted-foreground" />
      <Input v-model="search" placeholder="Search repositories..." class="border-0 bg-transparent shadow-none focus-visible:ring-0" />
      <span class="shrink-0 text-xs text-muted-foreground">{{ metadata.total }} repositories</span>
    </div>

    <Card v-if="loading">
      <CardContent class="grid place-items-center py-10"><Spinner /></CardContent>
    </Card>
    <Empty v-else-if="!filtered.length" class="border">
      <EmptyHeader>
        <EmptyMedia variant="icon"><HugeiconsIcon :icon="Database01Icon" :size="20" /></EmptyMedia>
        <EmptyTitle>No repositories found</EmptyTitle>
        <EmptyDescription>Create your first repository to start managing environment secrets.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button @click="openCreate">
          <HugeiconsIcon :icon="PlusSignIcon" :size="15" />
          <span>New repository</span>
        </Button>
      </EmptyContent>
    </Empty>

    <Card v-else>
      <CardContent class="p-0">
        <div class="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Repository</TableHead>
                <TableHead>Secrets</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="repo in filtered" :key="repo.id">
                <TableCell>
                  <RouterLink class="flex items-center gap-3" :to="`/repositories/${repo.id}`">
                    <Avatar class="size-9 rounded-lg">
                      <AvatarFallback class="rounded-lg">
                        <HugeiconsIcon :icon="Database01Icon" :size="15" />
                      </AvatarFallback>
                    </Avatar>
                    <span class="grid gap-0.5">
                      <strong class="text-sm font-semibold">{{ repo.name }}</strong>
                      <small class="text-xs text-muted-foreground">{{ repo.slug }}</small>
                    </span>
                  </RouterLink>
                </TableCell>
                <TableCell>{{ repo._count?.secrets || 0 }}</TableCell>
                <TableCell>{{ formatDate(repo.updatedAt) }}</TableCell>
                <TableCell><Badge>Active</Badge></TableCell>
                <TableCell class="text-right">
                  <Button variant="ghost" size="sm" @click="edit(repo)">
                    <HugeiconsIcon :icon="PencilEdit01Icon" :size="14" />
                    <span>Edit</span>
                  </Button>
                  <Button variant="ghost" size="sm" class="text-destructive hover:text-destructive" @click="remove(repo)">
                    <HugeiconsIcon :icon="Delete02Icon" :size="14" />
                    <span>Delete</span>
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <div class="flex items-center justify-between border-t px-4 py-3">
          <span class="text-xs text-muted-foreground">Page {{ page }} of {{ metadata.totalPages }}</span>
          <div class="flex gap-2">
            <Button variant="outline" size="sm" :disabled="page <= 1" @click="page -= 1; load()">
              <HugeiconsIcon :icon="ArrowLeft01Icon" :size="14" />
              <span>Prev</span>
            </Button>
            <Button variant="outline" size="sm" :disabled="page >= metadata.totalPages" @click="page += 1; load()">
              <span>Next</span>
              <HugeiconsIcon :icon="ArrowRight01Icon" :size="14" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <Dialog :open="modal" @update:open="(v: boolean) => { modal = v }">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ editing ? 'Edit' : 'New' }} repository</DialogTitle>
        </DialogHeader>
        <form class="grid gap-4" @submit.prevent="save">
          <div class="grid gap-2">
            <Label for="repo-name">Name</Label>
            <Input id="repo-name" v-model="form.name" required maxlength="100" />
          </div>
          <div class="grid gap-2">
            <Label for="repo-desc">Description</Label>
            <Textarea id="repo-desc" v-model="form.description" rows="3" />
          </div>
          <DialogFooter>
            <Button variant="ghost" type="button" @click="modal = false">Cancel</Button>
            <Button type="submit" :disabled="saving">{{ saving ? 'Saving...' : 'Save repository' }}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { HugeiconsIcon } from '@hugeicons/vue';
import { ArrowLeft01Icon, ArrowRight01Icon, Database01Icon, Delete02Icon, PencilEdit01Icon, PlusSignIcon, Search01Icon } from '@hugeicons/core-free-icons';
import { organizationApi } from '../../services/api/organization.api';
import { workspaceApi } from '../../services/api/workspace.api';
import { repositoryGroupApi } from '../../services/api/repository-group.api';
import { repositoryApi } from '../../services/api/repository.api';
import { useSidebarStore } from '../../stores/sidebar.store';
import type { Repository, RepositoryInput, PageMetadata } from '../../types/api';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../components/ui/empty';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Spinner } from '../../components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Textarea } from '../../components/ui/textarea';
import { useApiError } from '../../composables/useApiError';
import { useConfirm } from '../../composables/useConfirm';
import { useToast } from '../../composables/useToast';

const route = useRoute();
const selectedGroupId = computed(() => String(route.query.groupId || ''));

const repos = ref<Repository[]>([]),
  search = ref(''),
  loading = ref(true),
  saving = ref(false),
  modal = ref(false),
  editing = ref<Repository | null>(null),
  page = ref(1),
  metadata = ref<PageMetadata>({ page: 1, limit: 20, total: 0, totalPages: 0 }),
  form = ref<RepositoryInput>({ name: '', slug: '', description: '' }),
  toast = useToast(),
  apiError = useApiError(),
  confirm = useConfirm();
const sidebar = useSidebarStore();

const filtered = computed(() =>
  repos.value.filter((r) =>
    `${r.name} ${r.slug}`.toLowerCase().includes(search.value.toLowerCase()),
  ),
);

function formatDate(v: string) {
  return new Date(v).toLocaleDateString();
}

function openCreate() {
  editing.value = null;
  form.value = { name: '', slug: '', description: '' };
  modal.value = true;
}

function edit(r: Repository) {
  editing.value = r;
  form.value = { name: r.name, slug: r.slug, description: r.description || '' };
  modal.value = true;
}

async function save() {
  saving.value = true;
  try {
    if (editing.value) {
      await repositoryApi.update(editing.value.id, {
        name: form.value.name,
        description: form.value.description || undefined,
      });
    } else {
      const groupId = selectedGroupId.value || (await resolveDefaultGroupId());
      await repositoryApi.create(groupId, { ...form.value, slug: undefined });
    }

    modal.value = false;
    toast.push(editing.value ? 'Repository updated.' : 'Repository created.', 'success');
    await load();
    await sidebar.refresh();
  } catch (e) {
    toast.push(apiError.message(e, 'Unable to save repository.'), 'error');
  } finally {
    saving.value = false;
  }
}

async function remove(r: Repository) {
  const ok = await confirm.ask({
    title: `Delete ${r.name}?`,
    description: 'The repository and all its secrets and API keys will be permanently removed.',
  });
  if (!ok) return;
  try {
    await repositoryApi.remove(r.id);
    toast.push('Repository deleted.', 'success');
    await load();
    await sidebar.refresh();
  } catch (e) {
    toast.push(apiError.message(e, 'Unable to delete repository.'), 'error');
  }
}

async function resolveDefaultGroupId() {
  const orgs = (await organizationApi.list()).data.data;
  const org = orgs[0];
  if (!org) throw new Error('No organization available');

  const workspaces = (await workspaceApi.list(org.id)).data.data;
  const workspace = workspaces[0];
  if (!workspace) throw new Error('No workspace available');

  const groups = (await repositoryGroupApi.list(workspace.id)).data.data;
  const group = groups[0];
  if (!group) throw new Error('No repository group available');

  return group.id;
}

async function load() {
  loading.value = true;
  try {
    if (selectedGroupId.value) {
      const response = await repositoryApi.listByGroup(selectedGroupId.value, page.value, 20);
      repos.value = response.data.data;
      metadata.value = {
        page: response.data.metadata?.page ?? page.value,
        limit: response.data.metadata?.limit ?? 20,
        total: response.data.metadata?.total ?? response.data.data.length,
        totalPages: response.data.metadata?.totalPages ?? 1,
      };
      return;
    }

    const orgs = (await organizationApi.list()).data.data;
    const collected: Repository[] = [];

    for (const org of orgs) {
      const workspaces = (await workspaceApi.list(org.id)).data.data;
      for (const workspace of workspaces) {
        const groups = (await repositoryGroupApi.list(workspace.id)).data.data;
        for (const group of groups) {
          const response = await repositoryApi.listByGroup(group.id, page.value, 20);
          collected.push(...response.data.data);
        }
      }
    }

    repos.value = collected;
    metadata.value = {
      page: page.value,
      limit: 20,
      total: collected.length,
      totalPages: Math.max(1, Math.ceil(collected.length / 20)),
    };
  } catch (e) {
    toast.push(apiError.message(e, 'Unable to load repositories.'), 'error');
  } finally {
    loading.value = false;
  }
}

watch(
  () => route.query.groupId,
  () => {
    load();
  },
);

onMounted(load);
</script>

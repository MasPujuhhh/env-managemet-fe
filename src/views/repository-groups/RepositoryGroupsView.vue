<template>
  <div class="grid gap-5">
    <div class="flex flex-wrap items-end justify-between gap-4 pt-2">
      <div class="grid gap-1">
        <p class="text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">Repository groups</p>
        <h2 class="text-3xl font-semibold tracking-tight">Repository groups</h2>
      </div>
      <Button @click="openCreate">
        <HugeiconsIcon :icon="PlusSignIcon" :size="15" />
        <span>Add group</span>
      </Button>
    </div>

    <Card>
      <CardContent class="grid gap-4 p-5">
        <div v-if="loading" class="grid place-items-center py-6"><Spinner /></div>
        <Empty v-else-if="!groups.length" class="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon"><HugeiconsIcon :icon="Folder01Icon" :size="20" /></EmptyMedia>
            <EmptyTitle>No repository groups yet</EmptyTitle>
            <EmptyDescription>Create a repository group to organize repositories in this workspace.</EmptyDescription>
          </EmptyHeader>
        </Empty>
        <div v-else class="overflow-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Description</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="group in groups" :key="group.id">
                <TableCell class="font-medium">{{ group.name }}</TableCell>
                <TableCell><code class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{{ group.slug }}</code></TableCell>
                <TableCell>{{ group.description || '—' }}</TableCell>
                <TableCell class="text-right">
                  <Button variant="ghost" size="sm" as-child>
                    <RouterLink :to="`/repositories?groupId=${group.id}`">
                      <span>Open</span>
                      <HugeiconsIcon :icon="ArrowRight01Icon" :size="14" />
                    </RouterLink>
                  </Button>
                  <Button variant="ghost" size="sm" class="text-destructive hover:text-destructive" @click="remove(group)">
                    <HugeiconsIcon :icon="Delete02Icon" :size="14" />
                    <span>Delete</span>
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <Dialog :open="modal" @update:open="(v: boolean) => { modal = v }">
      <DialogContent>
        <DialogHeader>
          <DialogDescription>New group</DialogDescription>
          <DialogTitle>Create repository group</DialogTitle>
        </DialogHeader>
        <form class="grid gap-4" @submit.prevent="save">
          <div class="grid gap-2">
            <Label for="group-name">Name</Label>
            <Input id="group-name" v-model="form.name" required />
          </div>
          <div class="grid gap-2">
            <Label for="group-desc">Description</Label>
            <Input id="group-desc" v-model="form.description" />
          </div>
          <DialogFooter>
            <Button variant="ghost" type="button" @click="modal = false">Cancel</Button>
            <Button type="submit" :disabled="saving">{{ saving ? 'Creating...' : 'Create' }}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { HugeiconsIcon } from '@hugeicons/vue';
import { ArrowRight01Icon, Delete02Icon, Folder01Icon, PlusSignIcon } from '@hugeicons/core-free-icons';
import { repositoryGroupApi } from '../../services/api/repository-group.api';
import { useSidebarStore } from '../../stores/sidebar.store';
import type { RepositoryGroup } from '../../types/api';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../components/ui/empty';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Spinner } from '../../components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { useApiError } from '../../composables/useApiError';
import { useConfirm } from '../../composables/useConfirm';
import { useToast } from '../../composables/useToast';

const route = useRoute();
const workspaceId = computed(() => String(route.params.workspaceId));
const toast = useToast();
const apiError = useApiError();
const confirm = useConfirm();
const sidebar = useSidebarStore();
const groups = ref<RepositoryGroup[]>([]);
const loading = ref(true);
const saving = ref(false);
const modal = ref(false);
const form = ref({ name: '', slug: '', description: '' });

async function load() {
  loading.value = true;
  try {
    const response = await repositoryGroupApi.list(workspaceId.value);
    groups.value = response.data.data;
  } catch (e) {
    toast.push(apiError.message(e, 'Unable to load repository groups.'), 'error');
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  form.value = { name: '', slug: '', description: '' };
  modal.value = true;
}

async function save() {
  if (!form.value.name) {
    toast.push('Name is required.', 'error');
    return;
  }

  saving.value = true;
  try {
    await repositoryGroupApi.create(workspaceId.value, {
      name: form.value.name,
      description: form.value.description || undefined,
    });
    toast.push('Repository group created.', 'success');
    modal.value = false;
    await load();
    await sidebar.refresh();
  } catch (e) {
    toast.push(apiError.message(e, 'Unable to create repository group.'), 'error');
  } finally {
    saving.value = false;
  }
}

async function remove(group: RepositoryGroup) {
  const ok = await confirm.ask({
    title: `Delete ${group.name}?`,
    description: 'The repository group and all its repositories will be permanently removed.',
  });
  if (!ok) return;
  try {
    await repositoryGroupApi.remove(group.id);
    toast.push('Repository group deleted.', 'success');
    await load();
    await sidebar.refresh();
  } catch (e) {
    toast.push(apiError.message(e, 'Unable to delete repository group.'), 'error');
  }
}

onMounted(load);

watch(
  () => workspaceId.value,
  async (next, prev) => {
    if (next && next !== prev) {
      groups.value = [];
      modal.value = false;
      await load();
    }
  },
);
</script>

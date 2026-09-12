<template>
  <div class="grid gap-5">
    <template v-if="workspaceId">
      <div class="flex flex-wrap items-start justify-between gap-4 pt-2">
        <div class="grid gap-1">
          <p class="text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">Workspace</p>
          <h2 class="text-3xl font-semibold tracking-tight">{{ currentWorkspace?.name || 'Workspace detail' }}</h2>
          <p class="text-sm text-muted-foreground">{{ currentWorkspace?.description || 'Workspace overview and member access' }}</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <Button v-if="canManageWorkspace" variant="secondary" @click="saveWorkspace">
            <HugeiconsIcon :icon="Tick01Icon" :size="15" />
            <span>Save changes</span>
          </Button>
        </div>
      </div>

      <div class="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <p class="text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">Detail</p>
            <CardTitle>Workspace overview</CardTitle>
          </CardHeader>
          <CardContent>
            <form class="grid gap-4" @submit.prevent="saveWorkspace">
              <div class="grid gap-2">
                <Label for="ws-name">Name</Label>
                <Input id="ws-name" v-model="workspaceForm.name" type="text" />
              </div>
              <div class="grid gap-2">
                <Label for="ws-desc">Description</Label>
                <Textarea id="ws-desc" v-model="workspaceForm.description" rows="4" />
              </div>
              <div v-if="canManageWorkspace" class="flex justify-end">
                <Button type="submit">
                  <HugeiconsIcon :icon="Tick01Icon" :size="15" />
                  <span>Update workspace</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <p class="text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">Summary</p>
            <CardTitle>Access overview</CardTitle>
          </CardHeader>
          <CardContent class="grid gap-1">
            <div class="flex items-center justify-between border-b py-2.5">
              <span class="text-sm text-muted-foreground">Members</span>
              <strong class="text-sm">{{ members.length }}</strong>
            </div>
            <div class="flex items-center justify-between border-b py-2.5">
              <span class="text-sm text-muted-foreground">Admins</span>
              <strong class="text-sm">{{ adminCount }}</strong>
            </div>
            <div class="flex items-center justify-between py-2.5">
              <span class="text-sm text-muted-foreground">Role</span>
              <strong class="text-sm">{{ currentUserRole }}</strong>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div class="flex flex-wrap items-end justify-between gap-3">
            <div class="grid gap-1">
              <p class="text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">Members</p>
              <CardTitle>Active members</CardTitle>
            </div>
            <Button v-if="canManageMembers" @click="toggleInvite">
              <HugeiconsIcon :icon="UserPlusIcon" :size="15" />
              <span>Add member</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent class="grid gap-4">
          <div v-if="inviteOpen && canManageMembers" class="grid gap-3.5 rounded-xl border bg-muted/50 p-3.5">
            <div class="grid grid-cols-2 gap-1 rounded-lg border bg-background p-1">
              <Button :variant="inviteMode === 'existing' ? 'secondary' : 'ghost'" size="sm" type="button" @click="inviteMode = 'existing'">Existing user</Button>
              <Button :variant="inviteMode === 'manual' ? 'secondary' : 'ghost'" size="sm" type="button" @click="inviteMode = 'manual'">Create new</Button>
            </div>
            <div v-if="inviteMode === 'existing'" class="grid gap-2">
              <Label>User from this organization</Label>
              <Select v-model="selectedUserId">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="user in availableUsers" :key="user.id" :value="user.id">
                    {{ user.name || user.email }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div v-else class="grid gap-3.5 sm:grid-cols-2">
              <div class="grid gap-2">
                <Label for="ws-manual-name">Name</Label>
                <Input id="ws-manual-name" v-model="manualForm.name" type="text" />
              </div>
              <div class="grid gap-2">
                <Label for="ws-manual-email">Email</Label>
                <Input id="ws-manual-email" v-model="manualForm.email" type="email" />
              </div>
              <div class="grid gap-2">
                <Label for="ws-manual-password">Password</Label>
                <Input id="ws-manual-password" v-model="manualForm.password" type="password" />
              </div>
              <div class="grid gap-2">
                <Label>Role</Label>
                <Select v-model="manualForm.role">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">USER</SelectItem>
                    <SelectItem v-if="canAssignManager" value="MANAGER">MANAGER</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div class="flex items-center justify-end gap-2">
              <Button variant="secondary" @click="inviteOpen = false">Cancel</Button>
              <Button @click="addMember" :disabled="!canSubmitMember">Add member</Button>
            </div>
          </div>

          <div v-if="loadingMembers" class="grid place-items-center py-6"><Spinner /></div>
          <Empty v-else-if="filteredMembers.length === 0" class="border border-dashed">
            <EmptyHeader><EmptyTitle>No members in this workspace yet.</EmptyTitle></EmptyHeader>
          </Empty>
          <div v-else class="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="member in filteredMembers" :key="member.id || member.user?.id || member.email">
                  <TableCell>
                    <div class="flex min-w-44 items-center gap-2.5">
                      <Avatar class="size-8">
                        <AvatarFallback>{{ initials(member.user?.name || member.name || member.email || 'U') }}</AvatarFallback>
                      </Avatar>
                      <span class="text-sm font-medium">{{ member.user?.name || member.name || '—' }}</span>
                    </div>
                  </TableCell>
                  <TableCell>{{ member.user?.email || member.email || '—' }}</TableCell>
                  <TableCell>{{ member.role || member.user?.systemRole || 'USER' }}</TableCell>
                  <TableCell><Badge>Active</Badge></TableCell>
                  <TableCell class="text-right">
                    <Button v-if="canManageMembers" variant="ghost" size="icon-sm" class="text-destructive hover:text-destructive" type="button" aria-label="Remove member" title="Remove member" @click="removeMember(member)">
                      <HugeiconsIcon :icon="Delete02Icon" :size="15" />
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card v-if="canDeleteWorkspace" class="border-destructive/30">
        <CardHeader>
          <p class="text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">Danger zone</p>
          <CardTitle>Workspace settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div class="grid gap-1">
              <strong class="text-sm">Delete workspace</strong>
              <p class="text-sm text-muted-foreground">This action is permanent and removes access for all members.</p>
            </div>
            <Button variant="destructive" @click="removeWorkspace">
              <HugeiconsIcon :icon="Delete02Icon" :size="15" />
              <span>Delete workspace</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </template>

    <template v-else>
      <div class="flex flex-wrap items-end justify-between gap-4 pt-2">
        <div class="grid gap-1">
          <p class="text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">Workspaces</p>
          <h2 class="text-3xl font-semibold tracking-tight">Workspaces</h2>
        </div>
        <Button v-if="canManageWorkspace" @click="openCreate">
          <HugeiconsIcon :icon="PlusSignIcon" :size="15" />
          <span>Add workspace</span>
        </Button>
      </div>

      <Card>
        <CardContent class="grid gap-4 p-5">
          <div v-if="loading" class="grid place-items-center py-6"><Spinner /></div>
          <Empty v-else-if="!workspaces.length" class="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon"><HugeiconsIcon :icon="Layers01Icon" :size="20" /></EmptyMedia>
              <EmptyTitle>No workspaces yet</EmptyTitle>
              <EmptyDescription>Create a workspace inside this organization.</EmptyDescription>
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
                <TableRow v-for="workspace in workspaces" :key="workspace.id">
                  <TableCell class="font-medium">{{ workspace.name }}</TableCell>
                  <TableCell><code class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{{ workspace.slug }}</code></TableCell>
                  <TableCell>{{ workspace.description || '—' }}</TableCell>
                  <TableCell class="text-right">
                    <Button variant="ghost" size="sm" as-child>
                      <RouterLink :to="`/organizations/${organizationId}/workspaces/${workspace.id}`">
                        <span>Open</span>
                        <HugeiconsIcon :icon="ArrowRight01Icon" :size="14" />
                      </RouterLink>
                    </Button>
                    <Button v-if="canDeleteWorkspace" variant="ghost" size="sm" class="text-destructive hover:text-destructive" @click="remove(workspace)">
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
            <DialogDescription>New workspace</DialogDescription>
            <DialogTitle>Create workspace</DialogTitle>
          </DialogHeader>
          <form class="grid gap-4" @submit.prevent="save">
            <div class="grid gap-2">
              <Label for="new-ws-name">Name</Label>
              <Input id="new-ws-name" v-model="form.name" required />
            </div>
            <div class="grid gap-2">
              <Label for="new-ws-desc">Description</Label>
              <Input id="new-ws-desc" v-model="form.description" />
            </div>
            <DialogFooter>
              <Button variant="ghost" type="button" @click="modal = false">Cancel</Button>
              <Button type="submit" :disabled="saving">{{ saving ? 'Creating...' : 'Create' }}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { HugeiconsIcon } from '@hugeicons/vue';
import { ArrowRight01Icon, Delete02Icon, Layers01Icon, PlusSignIcon, Tick01Icon, UserPlusIcon } from '@hugeicons/core-free-icons';
import { organizationApi } from '../../services/api/organization.api';
import { workspaceApi } from '../../services/api/workspace.api';
import { userApi } from '../../services/api/user.api';
import { useSidebarStore } from '../../stores/sidebar.store';
import { useAuthStore } from '../../stores/auth.store';
import type { Workspace } from '../../types/api';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../components/ui/empty';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Spinner } from '../../components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Textarea } from '../../components/ui/textarea';
import { useApiError } from '../../composables/useApiError';
import { useConfirm } from '../../composables/useConfirm';
import { useToast } from '../../composables/useToast';

const route = useRoute();
const auth = useAuthStore();
const sidebar = useSidebarStore();
const organizationId = computed(() => String(route.params.organizationId || ''));
const workspaceId = computed(() => String(route.params.workspaceId || ''));
const toast = useToast();
const apiError = useApiError();
const confirm = useConfirm();
const workspaces = ref<Workspace[]>([]);
const currentWorkspace = ref<Workspace | null>(null);
const workspaceForm = ref({ name: '', slug: '', description: '' });
const members = ref<any[]>([]);
const orgMembers = ref<any[]>([]);
const loading = ref(true);
const loadingMembers = ref(false);
const saving = ref(false);
const modal = ref(false);
const inviteOpen = ref(false);
const inviteMode = ref<'existing' | 'manual'>('existing');
const selectedUserId = ref('');
const manualForm = ref({ name: '', email: '', password: '', role: 'USER' as 'MANAGER' | 'USER' });
const memberSearch = ref('');
const form = ref({ name: '', slug: '', description: '' });

const canManageWorkspace = computed(() => ['SUPERADMIN', 'MANAGER'].includes(auth.user.value?.systemRole || ''));
const canDeleteWorkspace = computed(() => auth.user.value?.systemRole === 'SUPERADMIN');
const canManageMembers = computed(() => ['SUPERADMIN', 'MANAGER'].includes(auth.user.value?.systemRole || ''));
const canAssignManager = computed(() => auth.user.value?.systemRole === 'SUPERADMIN');
const currentUserRole = computed(() => auth.user.value?.systemRole || 'USER');
const adminCount = computed(() => members.value.filter((member) => (member.role || member.user?.systemRole || 'USER') === 'ADMIN' || (member.role || member.user?.systemRole || 'USER') === 'SUPERADMIN').length);
const availableUsers = computed(() => {
  const existingIds = new Set(members.value.map((member) => member.user?.id || member.userId));
  return orgMembers.value
    .map((member) => ({
      id: member.userId || member.user?.id,
      name: member.user?.name || member.name || '',
      email: member.user?.email || member.email || '',
    }))
    .filter((user) => user.id && !existingIds.has(user.id));
});
const canSubmitMember = computed(() => {
  if (inviteMode.value === 'existing') return !!selectedUserId.value;
  return !!(manualForm.value.name.trim() && manualForm.value.email.trim() && manualForm.value.password);
});
const filteredMembers = computed(() => {
  const term = memberSearch.value.trim().toLowerCase();
  if (!term) return members.value;

  return members.value.filter((member) => {
    const text = `${member.user?.name || member.name || ''} ${member.user?.email || member.email || ''} ${(member.role || member.user?.systemRole || 'USER')}`.toLowerCase();
    return text.includes(term);
  });
});

function initials(value: string) {
  return (value || 'U').slice(0, 2).toUpperCase();
}

async function loadList() {
  if (!organizationId.value) return;
  loading.value = true;
  try {
    const response = await workspaceApi.list(organizationId.value);
    workspaces.value = response.data.data;
  } catch (e) {
    toast.push(apiError.message(e, 'Unable to load workspaces.'), 'error');
  } finally {
    loading.value = false;
  }
}

async function loadWorkspaceDetail() {
  if (!organizationId.value || !workspaceId.value) return;
  loadingMembers.value = true;
  try {
    const [workspaceResponse, membersResponse, orgMembersResponse] = await Promise.all([
      workspaceApi.get(organizationId.value, workspaceId.value),
      workspaceApi.members(workspaceId.value),
      organizationApi.members(organizationId.value),
    ]);

    currentWorkspace.value = workspaceResponse.data.data;
    workspaceForm.value = {
      name: workspaceResponse.data.data.name,
      slug: workspaceResponse.data.data.slug,
      description: workspaceResponse.data.data.description || '',
    };
    members.value = membersResponse.data.data || [];
    orgMembers.value = orgMembersResponse.data.data || [];
  } catch (e) {
    toast.push(apiError.message(e, 'Unable to load workspace details.'), 'error');
  } finally {
    loadingMembers.value = false;
  }
}

async function saveWorkspace() {
  if (!organizationId.value || !workspaceId.value || !canManageWorkspace.value) return;

  saving.value = true;
  try {
    await workspaceApi.update(organizationId.value, workspaceId.value, {
      name: workspaceForm.value.name,
      slug: workspaceForm.value.slug,
      description: workspaceForm.value.description || undefined,
    });
    toast.push('Workspace updated.', 'success');
    await loadWorkspaceDetail();
    await sidebar.refresh();
  } catch (e) {
    toast.push(apiError.message(e, 'Unable to update workspace.'), 'error');
  } finally {
    saving.value = false;
  }
}

async function addMember() {
  if (!organizationId.value || !workspaceId.value || !canManageMembers.value) return;

  try {
    if (inviteMode.value === 'existing') {
      if (!selectedUserId.value) {
        toast.push('Select a user first.', 'error');
        return;
      }
      await workspaceApi.addMember(workspaceId.value, { userId: selectedUserId.value });
    } else {
      if (!manualForm.value.name.trim() || !manualForm.value.email.trim() || !manualForm.value.password) {
        toast.push('Name, email, and password are required.', 'error');
        return;
      }
      const created = await userApi.create({
        name: manualForm.value.name.trim(),
        email: manualForm.value.email.trim(),
        password: manualForm.value.password,
        organizationId: organizationId.value,
        role: manualForm.value.role,
      });
      await workspaceApi.addMember(workspaceId.value, { userId: created.data.data.id });
      manualForm.value = { name: '', email: '', password: '', role: 'USER' };
    }
    selectedUserId.value = '';
    inviteOpen.value = false;
    toast.push('Member added.', 'success');
    await loadWorkspaceDetail();
  } catch (e) {
    toast.push(apiError.message(e, 'Unable to add member.'), 'error');
  }
}

async function removeMember(member: any) {
  if (!workspaceId.value || !canManageMembers.value) return;
  const memberId = member.id || member.user?.id || member.userId;
  if (!memberId) return;

  const okMember = await confirm.ask({
    title: `Remove ${member.user?.name || member.name || 'this member'}?`,
    description: 'This member will lose access to the workspace.',
    confirmLabel: 'Remove',
  });
  if (!okMember) return;

  try {
    await workspaceApi.removeMember(workspaceId.value, memberId);
    toast.push('Member removed.', 'success');
    await loadWorkspaceDetail();
  } catch (e) {
    toast.push(apiError.message(e, 'Unable to remove member.'), 'error');
  }
}

function toggleInvite() {
  inviteOpen.value = !inviteOpen.value;
  if (inviteOpen.value) {
    if (!canAssignManager.value) manualForm.value.role = 'USER';
    selectedUserId.value = '';
  }
}

async function remove(workspace: Workspace) {
  if (!organizationId.value) return;
  const okWs = await confirm.ask({
    title: `Delete ${workspace.name}?`,
    description: 'The workspace and all its data will be permanently removed.',
  });
  if (!okWs) return;
  try {
    await workspaceApi.remove(organizationId.value, workspace.id);
    toast.push('Workspace deleted.', 'success');
    await loadList();
    await sidebar.refresh();
  } catch (e) {
    toast.push(apiError.message(e, 'Unable to delete workspace.'), 'error');
  }
}

async function removeWorkspace() {
  if (!currentWorkspace.value || !canDeleteWorkspace.value) return;
  const okDelWs = await confirm.ask({
    title: `Delete ${currentWorkspace.value.name}?`,
    description: 'This action is permanent and removes access for all members.',
  });
  if (!okDelWs || !currentWorkspace.value) return;
  try {
    await workspaceApi.remove(organizationId.value, currentWorkspace.value.id);
    toast.push('Workspace deleted.', 'success');
    await sidebar.refresh();
    window.history.back();
  } catch (e) {
    toast.push(apiError.message(e, 'Unable to delete workspace.'), 'error');
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
    await workspaceApi.create(organizationId.value, {
      name: form.value.name,
      description: form.value.description || undefined,
    });
    toast.push('Workspace created.', 'success');
    modal.value = false;
    await loadList();
    await sidebar.refresh();
  } catch (e) {
    toast.push(apiError.message(e, 'Unable to create workspace.'), 'error');
  } finally {
    saving.value = false;
  }
}

watch(
  () => route.params.workspaceId,
  async () => {
    if (route.params.workspaceId) {
      await loadWorkspaceDetail();
    } else {
      await loadList();
    }
  },
  { immediate: true },
);

onMounted(() => {
  if (!route.params.workspaceId) {
    loadList();
  }
});
</script>

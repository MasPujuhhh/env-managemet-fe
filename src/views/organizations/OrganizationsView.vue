<template>
  <div class="grid gap-5">
    <template v-if="organizationId">
      <div class="flex flex-wrap items-start justify-between gap-4 pt-2">
        <div class="grid gap-1">
          <p class="text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">Organization</p>
          <h2 class="text-3xl font-semibold tracking-tight">{{ currentOrganization?.name || 'Organization detail' }}</h2>
          <p class="text-sm text-muted-foreground">{{ currentOrganization?.description || 'Overview and member access for this organization.' }}</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <Button v-if="canEditOrganization" variant="secondary" @click="saveOrganization">
            <HugeiconsIcon :icon="Tick01Icon" :size="15" />
            <span>Save changes</span>
          </Button>
        </div>
      </div>

      <div class="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <p class="text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">Detail</p>
            <CardTitle>Organization overview</CardTitle>
          </CardHeader>
          <CardContent>
            <form class="grid gap-4" @submit.prevent="saveOrganization">
              <div class="grid gap-2">
                <Label for="org-name">Name</Label>
                <Input id="org-name" v-model="organizationForm.name" type="text" />
              </div>
              <div class="grid gap-2">
                <Label for="org-desc">Description</Label>
                <Textarea id="org-desc" v-model="organizationForm.description" rows="4" />
              </div>
              <div v-if="canEditOrganization" class="flex justify-end">
                <Button type="submit">
                  <HugeiconsIcon :icon="Tick01Icon" :size="15" />
                  <span>Update organization</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <p class="text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">Summary</p>
            <CardTitle>Access</CardTitle>
          </CardHeader>
          <CardContent class="grid gap-1">
            <div class="flex items-center justify-between border-b py-2.5">
              <span class="text-sm text-muted-foreground">Members</span>
              <strong class="text-sm">{{ members.length }}</strong>
            </div>
            <div class="flex items-center justify-between border-b py-2.5">
              <span class="text-sm text-muted-foreground">Workspaces</span>
              <strong class="text-sm">{{ workspaces.length }}</strong>
            </div>
            <div class="flex items-center justify-between py-2.5">
              <span class="text-sm text-muted-foreground">Your role</span>
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
              <CardTitle>Organization members</CardTitle>
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
            <div v-if="inviteMode === 'existing'" class="grid gap-3.5 sm:grid-cols-2">
              <div class="grid gap-2">
                <Label>User</Label>
                <Select v-model="selectedCandidateId">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="candidate in assignableCandidates" :key="candidate.id" :value="candidate.id">
                      {{ candidate.name }} · {{ candidate.email }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="grid gap-2">
                <Label>Role</Label>
                <Select v-model="memberForm.role">
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
            <div v-else class="grid gap-3.5 sm:grid-cols-2">
              <div class="grid gap-2">
                <Label for="member-name">Name</Label>
                <Input id="member-name" v-model="memberForm.name" type="text" />
              </div>
              <div class="grid gap-2">
                <Label for="member-email">Email</Label>
                <Input id="member-email" v-model="memberForm.email" type="email" />
              </div>
              <div class="grid gap-2">
                <Label for="member-password">Password</Label>
                <Input id="member-password" v-model="memberForm.password" type="password" />
              </div>
              <div class="grid gap-2">
                <Label>Role</Label>
                <Select v-model="memberForm.role">
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
            <EmptyHeader><EmptyTitle>No members in this organization yet.</EmptyTitle></EmptyHeader>
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
                        <AvatarFallback>{{ initials(member.user?.name || member.name || member.user?.email || member.email || 'U') }}</AvatarFallback>
                      </Avatar>
                      <span class="text-sm font-medium">{{ member.user?.name || member.name || '—' }}</span>
                    </div>
                  </TableCell>
                  <TableCell>{{ member.user?.email || member.email || '—' }}</TableCell>
                  <TableCell>{{ member.role || 'USER' }}</TableCell>
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

      <Card>
        <CardHeader>
          <div class="flex flex-wrap items-end justify-between gap-3">
            <div class="grid gap-1">
              <p class="text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">Workspaces</p>
              <CardTitle>Available workspaces</CardTitle>
            </div>
            <Button v-if="canManageMembers" @click="openWsCreate">
              <HugeiconsIcon :icon="PlusSignIcon" :size="15" />
              <span>Add workspace</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Empty v-if="workspaces.length === 0" class="border border-dashed">
            <EmptyHeader><EmptyTitle>No workspaces created in this organization yet.</EmptyTitle></EmptyHeader>
          </Empty>
          <div v-else class="grid gap-3">
            <div v-for="workspace in workspaces" :key="workspace.id" class="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
              <div class="grid gap-0.5">
                <strong class="text-sm font-semibold">{{ workspace.name }}</strong>
                <small class="font-mono text-xs text-muted-foreground">{{ workspace.slug }}</small>
              </div>
              <div class="flex items-center gap-1">
                <!-- <Button variant="ghost" size="sm" as-child>
                  <RouterLink :to="`/organizations/${organizationId}/workspaces/${workspace.id}`">
                    <span>Open</span>
                    <HugeiconsIcon :icon="ArrowRight01Icon" :size="14" />
                  </RouterLink>
                </Button> -->
                <Button v-if="canManageMembers" variant="ghost" size="sm" class="text-destructive hover:text-destructive" @click="removeWorkspace(workspace)">
                  <HugeiconsIcon :icon="Delete02Icon" :size="14" />
                  <span>Delete</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card v-if="canDeleteOrganization" class="border-destructive/30">
        <CardHeader>
          <p class="text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">Danger zone</p>
          <CardTitle>Organization settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div class="grid gap-1">
              <strong class="text-sm">Delete organization</strong>
              <p class="text-sm text-muted-foreground">This action is permanent and will remove the organization and all nested workspaces.</p>
            </div>
            <Button variant="destructive" @click="deleteOrganization">
              <HugeiconsIcon :icon="Delete02Icon" :size="15" />
              <span>Delete organization</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog :open="wsModal" @update:open="(v: boolean) => { wsModal = v }">
        <DialogContent>
          <DialogHeader>
            <DialogDescription>New workspace</DialogDescription>
            <DialogTitle>Create workspace</DialogTitle>
          </DialogHeader>
          <form class="grid gap-4" @submit.prevent="saveWorkspace">
            <div class="grid gap-2">
              <Label for="new-ws-name">Name</Label>
              <Input id="new-ws-name" v-model="wsForm.name" required />
            </div>
            <div class="grid gap-2">
              <Label for="new-ws-desc">Description</Label>
              <Input id="new-ws-desc" v-model="wsForm.description" />
            </div>
            <DialogFooter>
              <Button variant="ghost" type="button" @click="wsModal = false">Cancel</Button>
              <Button type="submit" :disabled="saving">{{ saving ? 'Creating...' : 'Create' }}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </template>

    <template v-else>
      <div class="flex flex-wrap items-end justify-between gap-4 pt-2">
        <div class="grid gap-1">
          <p class="text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">Organizations</p>
          <h2 class="text-3xl font-semibold tracking-tight">Organizations</h2>
        </div>
        <Button v-if="canCreateOrganization" @click="openCreate">
          <HugeiconsIcon :icon="PlusSignIcon" :size="15" />
          <span>Add organization</span>
        </Button>
      </div>

      <Card>
        <CardContent class="grid gap-4 p-5">
          <div v-if="loading" class="grid place-items-center py-6"><Spinner /></div>
          <Empty v-else-if="!organizations.length" class="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon"><HugeiconsIcon :icon="Building02Icon" :size="20" /></EmptyMedia>
              <EmptyTitle>No organizations yet</EmptyTitle>
              <EmptyDescription>Create the first organization to group workspaces and repositories.</EmptyDescription>
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
                <TableRow v-for="organization in organizations" :key="organization.id">
                  <TableCell class="font-medium">{{ organization.name }}</TableCell>
                  <TableCell><code class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{{ organization.slug || '—' }}</code></TableCell>
                  <TableCell>{{ organization.description || '—' }}</TableCell>
                  <TableCell class="text-right">
                    <Button variant="ghost" size="sm" as-child>
                      <RouterLink :to="`/organizations/${organization.id}`">
                        <span>Open</span>
                        <HugeiconsIcon :icon="ArrowRight01Icon" :size="14" />
                      </RouterLink>
                    </Button>
                    <Button variant="ghost" size="sm" class="text-destructive hover:text-destructive" @click="remove(organization)">
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
            <DialogDescription>New organization</DialogDescription>
            <DialogTitle>Create organization</DialogTitle>
          </DialogHeader>
          <form class="grid gap-4" @submit.prevent="save">
            <div class="grid gap-2">
              <Label for="new-org-name">Name</Label>
              <Input id="new-org-name" v-model="form.name" required />
            </div>
            <div class="grid gap-2">
              <Label for="new-org-desc">Description</Label>
              <Input id="new-org-desc" v-model="form.description" />
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
import { ArrowRight01Icon, Building02Icon, Delete02Icon, PlusSignIcon, Tick01Icon, UserPlusIcon } from '@hugeicons/core-free-icons';
import { organizationApi } from '../../services/api/organization.api';
import { workspaceApi } from '../../services/api/workspace.api';
import { useSidebarStore } from '../../stores/sidebar.store';
import { useAuthStore } from '../../stores/auth.store';
import type { Organization, Workspace } from '../../types/api';
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

const toast = useToast();
const apiError = useApiError();
const confirm = useConfirm();
const auth = useAuthStore();
const sidebar = useSidebarStore();
const route = useRoute();
const organizationId = computed(() => String(route.params.organizationId || ''));
const organizations = ref<Organization[]>([]);
const workspaces = ref<Workspace[]>([]);
const currentOrganization = ref<Organization | null>(null);
const organizationForm = ref({ name: '', slug: '', description: '' });
const members = ref<any[]>([]);
const loading = ref(true);
const loadingMembers = ref(false);
const saving = ref(false);
const modal = ref(false);
const wsModal = ref(false);
const inviteOpen = ref(false);
const inviteMode = ref<'existing' | 'manual'>('existing');
const candidates = ref<{ id: string; name: string; email: string }[]>([]);
const selectedCandidateId = ref('');
const memberSearch = ref('');
const memberForm = ref({ name: '', email: '', password: '', role: 'USER' });
const form = ref({ name: '', slug: '', description: '' });
const wsForm = ref({ name: '', description: '' });

const canEditOrganization = computed(() => ['SUPERADMIN', 'MANAGER'].includes(auth.user.value?.systemRole || ''));
const canDeleteOrganization = computed(() => auth.user.value?.systemRole === 'SUPERADMIN');
const canCreateOrganization = computed(() => auth.user.value?.systemRole === 'SUPERADMIN');
const canManageMembers = computed(() => ['SUPERADMIN', 'MANAGER'].includes(auth.user.value?.systemRole || ''));
const canAssignManager = computed(() => auth.user.value?.systemRole === 'SUPERADMIN');
const currentUserRole = computed(() => auth.user.value?.systemRole || 'USER');

const filteredMembers = computed(() => {
  const term = memberSearch.value.trim().toLowerCase();
  if (!term) return members.value;

  return members.value.filter((member) => {
    const text = `${member.user?.name || member.name || ''} ${member.user?.email || member.email || ''} ${member.role || ''}`.toLowerCase();
    return text.includes(term);
  });
});

function initials(value: string) {
  return (value || 'U').slice(0, 2).toUpperCase();
}

const assignableCandidates = computed(() => {
  const taken = new Set(
    members.value.map((member) => (member.user?.email || member.email || '').toLowerCase()),
  );
  return candidates.value.filter((candidate) => !taken.has(candidate.email.toLowerCase()));
});

const canSubmitMember = computed(() => {
  if (inviteMode.value === 'existing') return !!selectedCandidateId.value;
  return !!(memberForm.value.email.trim() && memberForm.value.name.trim() && memberForm.value.password);
});

async function loadOrganizations() {
  loading.value = true;
  try {
    const response = await organizationApi.list();
    organizations.value = response.data.data;
  } catch (e) {
    toast.push(apiError.message(e, 'Unable to load organizations.'), 'error');
  } finally {
    loading.value = false;
  }
}

async function loadOrganizationDetail() {
  if (!organizationId.value) return;
  loadingMembers.value = true;
  try {
    const [orgResponse, membersResponse, workspacesResponse] = await Promise.all([
      organizationApi.get(organizationId.value),
      organizationApi.members(organizationId.value),
      workspaceApi.list(organizationId.value),
    ]);

    currentOrganization.value = orgResponse.data.data;
    organizationForm.value = {
      name: orgResponse.data.data.name,
      slug: orgResponse.data.data.slug || '',
      description: orgResponse.data.data.description || '',
    };
    members.value = membersResponse.data.data || [];
    workspaces.value = workspacesResponse.data.data || [];
  } catch (e) {
    toast.push(apiError.message(e, 'Unable to load organization details.'), 'error');
  } finally {
    loadingMembers.value = false;
  }
}

async function saveOrganization() {
  if (!organizationId.value || !canEditOrganization.value) return;

  saving.value = true;
  try {
    await organizationApi.update(organizationId.value, {
      name: organizationForm.value.name,
      slug: organizationForm.value.slug,
      description: organizationForm.value.description || undefined,
    });
    toast.push('Organization updated.', 'success');
    await loadOrganizationDetail();
    await loadOrganizations();
    await sidebar.refresh();
  } catch (e) {
    toast.push(apiError.message(e, 'Unable to update organization.'), 'error');
  } finally {
    saving.value = false;
  }
}

async function loadCandidates() {
  if (!organizationId.value || !canManageMembers.value) return;
  try {
    const response = await organizationApi.assignableUsers(organizationId.value);
    candidates.value = response.data.data || [];
  } catch (e) {
    candidates.value = [];
    toast.push(apiError.message(e, 'Unable to load assignable users.'), 'error');
  }
}

function toggleInvite() {
  inviteOpen.value = !inviteOpen.value;
  if (inviteOpen.value) {
    if (!canAssignManager.value) memberForm.value.role = 'USER';
    selectedCandidateId.value = '';
    loadCandidates();
  }
}

async function addMember() {
  if (!organizationId.value || !canManageMembers.value) return;

  try {
    if (inviteMode.value === 'existing') {
      const candidate = candidates.value.find((item) => item.id === selectedCandidateId.value);
      if (!candidate) {
        toast.push('Select a user first.', 'error');
        return;
      }
      await organizationApi.addMember(organizationId.value, {
        email: candidate.email,
        name: candidate.name,
        role: memberForm.value.role as 'MANAGER' | 'USER',
      });
    } else {
      if (!memberForm.value.email.trim() || !memberForm.value.name.trim() || !memberForm.value.password) {
        toast.push('Name, email, and password are required.', 'error');
        return;
      }
      await organizationApi.addMember(organizationId.value, {
        email: memberForm.value.email.trim(),
        name: memberForm.value.name.trim(),
        password: memberForm.value.password,
        role: memberForm.value.role as 'MANAGER' | 'USER',
      });
    }
    memberForm.value = { name: '', email: '', password: '', role: 'USER' };
    selectedCandidateId.value = '';
    inviteOpen.value = false;
    toast.push('Member added.', 'success');
    await loadOrganizationDetail();
  } catch (e) {
    toast.push(apiError.message(e, 'Unable to add member.'), 'error');
  }
}

async function removeMember(member: any) {
  const memberId = member?.id;
  const memberEmail = member?.user?.email || member?.email || '';
  const memberName = member?.user?.name || member?.name || memberEmail;
  if (!canManageMembers.value || !member || !memberId) return;
  const okMember = await confirm.ask({
    title: `Remove ${memberName}?`,
    description: 'This member will lose access to the organization.',
    confirmLabel: 'Remove',
  });
  if (!okMember) return;

  try {
    await organizationApi.removeMember(organizationId.value, memberId);
    toast.push('Member removed.', 'success');
    await loadOrganizationDetail();
  } catch (e) {
    toast.push(apiError.message(e, 'Unable to remove member.'), 'error');
  }
}

async function deleteOrganization() {
  if (!organizationId.value || !canDeleteOrganization.value) return;
  const okOrg = await confirm.ask({
    title: `Delete ${currentOrganization.value?.name || 'this organization'}?`,
    description: 'The organization and all nested workspaces will be permanently removed.',
  });
  if (!okOrg) return;

  try {
    await organizationApi.remove(organizationId.value);
    toast.push('Organization deleted.', 'success');
    await loadOrganizations();
    await sidebar.refresh();
    window.history.back();
  } catch (e) {
    toast.push(apiError.message(e, 'Unable to delete organization.'), 'error');
  }
}

function openWsCreate() {
  if (!canManageMembers.value) return;
  wsForm.value = { name: '', description: '' };
  wsModal.value = true;
}

async function saveWorkspace() {
  if (!organizationId.value || !canManageMembers.value) return;
  if (!wsForm.value.name.trim()) {
    toast.push('Name is required.', 'error');
    return;
  }

  saving.value = true;
  try {
    await workspaceApi.create(organizationId.value, {
      name: wsForm.value.name.trim(),
      description: wsForm.value.description.trim() || undefined,
    });
    toast.push('Workspace created.', 'success');
    wsModal.value = false;
    await loadOrganizationDetail();
    await sidebar.refresh();
  } catch (e) {
    toast.push(apiError.message(e, 'Unable to create workspace.'), 'error');
  } finally {
    saving.value = false;
  }
}

async function removeWorkspace(workspace: Workspace) {  const okWs = await confirm.ask({
    title: `Delete ${workspace.name}?`,
    description: 'The workspace and all its data will be permanently removed.',
  });
  if (!okWs) return;
  try {
    await workspaceApi.remove(organizationId.value, workspace.id);
    toast.push('Workspace deleted.', 'success');
    await loadOrganizationDetail();
    await sidebar.refresh();
  } catch (e) {
    toast.push(apiError.message(e, 'Unable to delete workspace.'), 'error');
  }
}

async function remove(organization: Organization) {
  const okDel = await confirm.ask({
    title: `Delete ${organization.name}?`,
    description: 'The organization and all nested workspaces will be permanently removed.',
  });
  if (!okDel) return;
  try {
    await organizationApi.remove(organization.id);
    toast.push('Organization deleted.', 'success');
    await loadOrganizations();
    await sidebar.refresh();
  } catch (e) {
    toast.push(apiError.message(e, 'Unable to delete organization.'), 'error');
  }
}

function openCreate() {
  if (!canCreateOrganization.value) return;
  form.value = { name: '', slug: '', description: '' };
  modal.value = true;
}

async function save() {
  if (!canCreateOrganization.value) return;
  if (!form.value.name) {
    toast.push('Name is required.', 'error');
    return;
  }

  saving.value = true;
  try {
    await organizationApi.create({
      name: form.value.name,
      description: form.value.description || undefined,
    });
    toast.push('Organization created.', 'success');
    modal.value = false;
    await loadOrganizations();
    await sidebar.refresh();
  } catch (e) {
    toast.push(apiError.message(e, 'Unable to create organization.'), 'error');
  } finally {
    saving.value = false;
  }
}

watch(
  () => route.params.organizationId,
  () => {
    if (route.params.organizationId) {
      loadOrganizationDetail();
    } else {
      loadOrganizations();
    }
  },
  { immediate: true },
);

onMounted(() => {
  if (!route.params.organizationId) {
    loadOrganizations();
  }
});
</script>

<template>
  <div class="grid gap-5">
    <div class="flex flex-wrap items-end justify-between gap-4 pt-2">
      <div class="grid gap-1">
        <p class="text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">Access control</p>
        <h2 class="text-3xl font-semibold tracking-tight">Users</h2>
      </div>
      <Button @click="openCreate">
        <HugeiconsIcon :icon="UserPlusIcon" :size="15" />
        <span>Add user</span>
      </Button>
    </div>

    <Card>
      <CardHeader>
        <div class="flex flex-wrap items-end justify-between gap-3">
          <div class="grid gap-1">
            <p class="text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">Members</p>
            <CardTitle>Workspace access</CardTitle>
          </div>
          <div class="flex items-center gap-2">
            <div class="relative">
              <HugeiconsIcon :icon="Search01Icon" :size="14" class="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2" />
              <Input v-model="search" placeholder="Search users..." class="w-52 pl-8 md:w-64" />
            </div>
            <Button variant="secondary" @click="openCreate">
              <HugeiconsIcon :icon="UserPlusIcon" :size="15" />
              <span>Add user</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent class="grid gap-4">
        <div v-if="loading" class="grid place-items-center py-8"><Spinner /></div>
        <Empty v-else-if="!filteredUsers.length" class="border">
          <EmptyHeader>
            <EmptyMedia variant="icon"><HugeiconsIcon :icon="UserGroupIcon" :size="20" /></EmptyMedia>
            <EmptyTitle>No users yet</EmptyTitle>
            <EmptyDescription>Create the first organization user for access management.</EmptyDescription>
          </EmptyHeader>
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
              <TableRow v-for="user in filteredUsers" :key="user.id">
                <TableCell>
                  <div class="flex min-w-44 items-center gap-2.5">
                    <Avatar class="size-8">
                      <AvatarFallback>{{ initials(user) }}</AvatarFallback>
                    </Avatar>
                    <span class="text-sm font-medium">{{ user.name || '—' }}</span>
                  </div>
                </TableCell>
                <TableCell>{{ user.email }}</TableCell>
                <TableCell>{{ user.systemRole || 'USER' }}</TableCell>
                <TableCell><Badge>Active</Badge></TableCell>
                <TableCell class="text-right">
                  <Button variant="ghost" size="icon-sm" type="button" aria-label="Reset password" title="Reset password to default" @click="resetPassword(user)">
                    <HugeiconsIcon :icon="LockPasswordIcon" :size="15" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" class="text-destructive hover:text-destructive" type="button" aria-label="Remove user" title="Remove user" @click="remove(user)">
                    <HugeiconsIcon :icon="Delete02Icon" :size="15" />
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
          <DialogDescription>Add user</DialogDescription>
          <DialogTitle>Create organization member</DialogTitle>
        </DialogHeader>
        <form class="grid gap-4" @submit.prevent="save">
          <div class="grid gap-2">
            <Label for="user-name">Name</Label>
            <Input id="user-name" v-model="form.name" required />
          </div>
          <div class="grid gap-2">
            <Label for="user-email">Email</Label>
            <Input id="user-email" v-model="form.email" type="email" required />
          </div>
          <div class="grid gap-2">
            <Label for="user-password">Password</Label>
            <Input id="user-password" v-model="form.password" type="password" required />
          </div>
          <div class="grid gap-2">
            <Label>Organization</Label>
            <Select v-model="form.organizationId">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="org in organizations" :key="org.id" :value="org.id">{{ org.name }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="grid gap-2">
            <Label>Role</Label>
            <Select v-model="form.role">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">USER</SelectItem>
                <SelectItem value="MANAGER">MANAGER</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="ghost" type="button" @click="modal = false">Cancel</Button>
            <Button type="submit" :disabled="saving">{{ saving ? 'Creating...' : 'Create user' }}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { HugeiconsIcon } from '@hugeicons/vue';
import { Delete02Icon, LockPasswordIcon, Search01Icon, UserGroupIcon, UserPlusIcon } from '@hugeicons/core-free-icons';
import { organizationApi } from '../../services/api/organization.api';
import { userApi } from '../../services/api/user.api';
import type { Organization, User } from '../../types/api';
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
import { useApiError } from '../../composables/useApiError';
import { useConfirm } from '../../composables/useConfirm';
import { useToast } from '../../composables/useToast';

const toast = useToast();
const apiError = useApiError();
const confirm = useConfirm();
const users = ref<User[]>([]);
const organizations = ref<Organization[]>([]);
const loading = ref(true);
const saving = ref(false);
const modal = ref(false);
const search = ref('');
const form = ref({ name: '', email: '', password: '', organizationId: '', role: 'USER' as 'MANAGER' | 'USER' });

const filteredUsers = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (!term) return users.value;

  return users.value.filter((user) => {
    const content = `${user.name ?? ''} ${user.email ?? ''} ${user.systemRole ?? ''}`.toLowerCase();
    return content.includes(term);
  });
});

function initials(user: User) {
  const name = user.name || user.email || 'U';
  return name.slice(0, 2).toUpperCase();
}

async function load() {
  loading.value = true;
  try {
    const [orgs, allUsers] = await Promise.all([organizationApi.list(), userApi.list()]);
    organizations.value = orgs.data.data;
    users.value = allUsers.data.data;
  } catch (e) {
    toast.push(apiError.message(e, 'Unable to load users.'), 'error');
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  form.value = { name: '', email: '', password: '', organizationId: organizations.value[0]?.id ?? '', role: 'USER' };
  modal.value = true;
}

async function save() {
  if (!form.value.organizationId) {
    toast.push('Select an organization first.', 'error');
    return;
  }

  saving.value = true;
  try {
    await userApi.create(form.value);
    toast.push('User created.', 'success');
    modal.value = false;
    await load();
  } catch (e) {
    toast.push(apiError.message(e, 'Unable to create user.'), 'error');
  } finally {
    saving.value = false;
  }
}

async function remove(userItem: User) {
  const ok = await confirm.ask({
    title: `Remove ${userItem.email}?`,
    description: 'This user will lose access to the organization.',
    confirmLabel: 'Remove',
  });
  if (!ok) return;
  try {
    await userApi.remove(userItem.id);
    toast.push('User removed.', 'success');
    await load();
  } catch (e) {
    toast.push(apiError.message(e, 'Unable to remove user.'), 'error');
  }
}

async function resetPassword(userItem: User) {
  const ok = await confirm.ask({
    title: `Reset password for ${userItem.email}?`,
    description: 'The password will be reset to the system default.',
    confirmLabel: 'Reset',
  });
  if (!ok) return;
  try {
    await userApi.resetPassword(userItem.id);
    toast.push('Password reset to default.', 'success');
  } catch (e) {
    toast.push(apiError.message(e, 'Unable to reset password.'), 'error');
  }
}

onMounted(load);
</script>

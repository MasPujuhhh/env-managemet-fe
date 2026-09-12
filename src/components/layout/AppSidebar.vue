<template>
  <Sidebar collapsible="icon">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <SidebarMenuButton size="lg" :tooltip="activeOrganization?.name ?? 'Select organization'">
                <div class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <HugeiconsIcon :icon="Building02Icon" :size="16" />
                </div>
                <div class="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span class="truncate font-semibold">{{ activeOrganization?.name ?? 'No organization' }}</span>
                  <span class="truncate text-xs">WG Vault</span>
                </div>
                <HugeiconsIcon :icon="ChevronDownIcon" :size="14" class="ml-auto shrink-0 opacity-50 group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="bottom" class="w-60">
              <DropdownMenuLabel>Switch organization</DropdownMenuLabel>
              <DropdownMenuItem
                v-for="organization in organizations"
                :key="organization.id"
                @select="selectOrganization(organization.id)"
              >
                <HugeiconsIcon :icon="Building02Icon" :size="14" class="shrink-0" />
                <span class="min-w-0 flex-1 truncate">{{ organization.name }}</span>
                <HugeiconsIcon v-if="organization.id === activeOrganizationId" :icon="Tick02Icon" :size="14" class="shrink-0" />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem v-if="canCreateOrganization" @select="openCreateModal('organization')">
                <HugeiconsIcon :icon="PlusSignIcon" :size="14" /><span>Create organization</span>
              </DropdownMenuItem>
              <template v-if="activeOrganization">
                <DropdownMenuSeparator v-if="isSuperadmin" />
                <DropdownMenuItem @select="handleEdit('organization', activeOrganization.id)">
                  <HugeiconsIcon :icon="PencilEdit01Icon" :size="14" /><span>Edit organization</span>
                </DropdownMenuItem>
                <DropdownMenuItem v-if="isSuperadmin" @select="handleDuplicate('organization', activeOrganization.id)">
                  <HugeiconsIcon :icon="Copy01Icon" :size="14" /><span>Duplicate organization</span>
                </DropdownMenuItem>
                <DropdownMenuItem v-if="isSuperadmin" variant="destructive" @select="handleDelete('organization', activeOrganization.id)">
                  <HugeiconsIcon :icon="Delete02Icon" :size="14" /><span>Delete organization</span>
                </DropdownMenuItem>
              </template>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <div class="flex min-w-0 items-center gap-2 px-1 pt-1 group-data-[collapsible=icon]:hidden">
        <div class="relative min-w-0 flex-1">
          <HugeiconsIcon :icon="Search01Icon" :size="14" class="text-muted-foreground pointer-events-none absolute top-1/2 left-2 -translate-y-1/2" />
          <SidebarInput v-model="searchTerm" placeholder="Search..." class="pl-7" />
        </div>
      </div>
    </SidebarHeader>

    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel class="flex items-center justify-between">
          <span>Workspace</span>
          <SidebarGroupAction v-if="managerOnly" title="New workspace" @click="createWorkspace">
            <HugeiconsIcon :icon="PlusSignIcon" :size="14" />
            <span class="sr-only">New workspace</span>
          </SidebarGroupAction>
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu v-if="loading">
            <SidebarMenuItem v-for="i in [1, 2, 3]" :key="i">
              <SidebarMenuSkeleton show-icon />
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarMenu v-else-if="!activeOrganization">
            <SidebarMenuItem>
              <SidebarMenuButton disabled>
                <HugeiconsIcon :icon="Building02Icon" :size="16" />
                <span>No organizations yet</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarMenu v-else-if="!activeWorkspaces.length">
            <SidebarMenuItem>
              <SidebarMenuButton disabled>
                <HugeiconsIcon :icon="Layers01Icon" :size="16" />
                <span>No workspaces yet</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarMenu v-else>
            <SidebarMenuItem v-for="workspace in activeWorkspaces" :key="workspace.id">
              <Collapsible
                :open="!!expandedWorkspaces[workspace.id]"
                class="group/workspace w-full"
                @update:open="(v: boolean) => setWorkspaceOpen(workspace.id, v)"
              >
                <div class="menu-row relative">
                  <CollapsibleTrigger as-child>
                    <SidebarMenuButton
                      :is-active="isWorkspaceActive(activeOrganizationId, workspace.id)"
                      :tooltip="workspace.name"
                      @click="onWorkspaceClick(activeOrganizationId, workspace.id)"
                    >
                      <HugeiconsIcon :icon="ChevronRightIcon" :size="14" class="shrink-0 transition-transform group-data-[state=open]/workspace:rotate-90 group-data-[collapsible=icon]:hidden" />
                      <HugeiconsIcon :icon="Layers01Icon" :size="16" class="shrink-0" />
                      <span class="min-w-0 flex-1 truncate">{{ workspace.name }}</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <DropdownMenu v-if="canManage">
                    <DropdownMenuTrigger as-child>
                      <SidebarMenuAction aria-label="Workspace actions">
                        <HugeiconsIcon :icon="MoreHorizontalIcon" :size="14" />
                      </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start">
                      <DropdownMenuItem @select="handleCreate('group', activeOrganizationId, workspace.id)">
                        <HugeiconsIcon :icon="PlusSignIcon" :size="14" /><span>Create group</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem v-if="managerOnly" @select="handleDuplicate('workspace', activeOrganizationId, workspace.id)">
                        <HugeiconsIcon :icon="Copy01Icon" :size="14" /><span>Duplicate</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem v-if="managerOnly" @select="handleEdit('workspace', activeOrganizationId, workspace.id)">
                        <HugeiconsIcon :icon="PencilEdit01Icon" :size="14" /><span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator v-if="managerOnly" />
                      <DropdownMenuItem v-if="managerOnly" variant="destructive" @select="handleDelete('workspace', activeOrganizationId, workspace.id)">
                        <HugeiconsIcon :icon="Delete02Icon" :size="14" /><span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <CollapsibleContent>
                  <SidebarMenuSub class="ml-3.5 mr-0 pl-2.5 pr-0">
                    <div v-if="groupLoading[workspace.id]" class="px-2 py-1.5">
                      <SidebarMenuSkeleton />
                    </div>
                    <SidebarMenuSubItem v-for="group in filteredGroups(workspace.id)" :key="group.id">
                      <Collapsible
                        :open="!!expandedGroups[group.id]"
                        class="group/repogroup w-full"
                        @update:open="(v: boolean) => setGroupOpen(group.id, v)"
                      >
                        <div class="menu-row relative">
                          <CollapsibleTrigger as-child>
                            <SidebarMenuSubButton :is-active="isGroupActive(group.id)" class="h-8 pr-8 cursor-pointer">
                              <HugeiconsIcon :icon="ChevronRightIcon" :size="14" class="shrink-0 transition-transform group-data-[state=open]/repogroup:rotate-90 group-data-[collapsible=icon]:hidden" />
                              <HugeiconsIcon :icon="Folder01Icon" :size="16" class="shrink-0" />
                              <span class="min-w-0 flex-1 truncate">{{ group.name }}</span>
                            </SidebarMenuSubButton>
                          </CollapsibleTrigger>
                          <DropdownMenu v-if="canManage">
                            <DropdownMenuTrigger as-child>
                              <SidebarMenuAction aria-label="Group actions">
                                <HugeiconsIcon :icon="MoreHorizontalIcon" :size="12" />
                              </SidebarMenuAction>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="right" align="start">
                              <DropdownMenuItem @select="handleCreate('repo', activeOrganizationId, workspace.id, group.id)">
                                <HugeiconsIcon :icon="PlusSignIcon" :size="14" /><span>Create repository</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem @select="handleDuplicate('group', activeOrganizationId, workspace.id, group.id)">
                                <HugeiconsIcon :icon="Copy01Icon" :size="14" /><span>Duplicate</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem @select="handleEdit('group', activeOrganizationId, workspace.id, group.id)">
                                <HugeiconsIcon :icon="PencilEdit01Icon" :size="14" /><span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem variant="destructive" @select="handleDelete('group', activeOrganizationId, workspace.id, group.id)">
                                <HugeiconsIcon :icon="Delete02Icon" :size="14" /><span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <CollapsibleContent>
                          <SidebarMenuSub class="ml-3.5 mr-0 pl-2.5 pr-0">
                            <div v-if="repoLoading[group.id]" class="px-2 py-1.5">
                              <SidebarMenuSkeleton />
                            </div>
                            <SidebarMenuSubItem v-for="repo in filteredRepos(group.id)" :key="repo.id" class="menu-row relative">
                              <SidebarMenuSubButton as-child :is-active="isRepositoryActive(repo.id)" class="h-8 w-full pr-8">
                                <RouterLink :to="`/repositories/${repo.id}`">
                                  <HugeiconsIcon :icon="Database01Icon" :size="16" class="shrink-0" />
                                  <span class="min-w-0 flex-1 truncate">{{ repo.name }}</span>
                                </RouterLink>
                              </SidebarMenuSubButton>
                              <DropdownMenu v-if="canManage">
                                <DropdownMenuTrigger as-child>
                                  <SidebarMenuAction aria-label="Repository actions">
                                    <HugeiconsIcon :icon="MoreHorizontalIcon" :size="12" />
                                  </SidebarMenuAction>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent side="right" align="start">
                                  <DropdownMenuItem v-if="isSuperadmin" @select="handleDuplicate('repo', activeOrganizationId, workspace.id, group.id, repo.id)">
                                    <HugeiconsIcon :icon="Copy01Icon" :size="14" /><span>Duplicate</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem @select="handleEdit('repo', activeOrganizationId, workspace.id, group.id, repo.id)">
                                    <HugeiconsIcon :icon="PencilEdit01Icon" :size="14" /><span>Edit</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator v-if="isSuperadmin" />
                                  <DropdownMenuItem v-if="isSuperadmin" variant="destructive" @select="handleDelete('repo', activeOrganizationId, workspace.id, group.id, repo.id)">
                                    <HugeiconsIcon :icon="Delete02Icon" :size="14" /><span>Delete</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </SidebarMenuSubItem>
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </Collapsible>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <div class="flex items-center gap-2 rounded-lg border px-2.5 py-2">
            <HugeiconsIcon :icon="Shield01Icon" :size="14" class="shrink-0 text-emerald-500" />
            <div class="grid flex-1 text-left text-xs leading-tight group-data-[collapsible=icon]:hidden">
              <span class="font-semibold">Secure workspace</span>
              <span class="text-muted-foreground">Protected environment</span>
            </div>
          </div>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <SidebarMenuButton size="lg">
                <Avatar class="size-8 rounded-lg">
                  <AvatarFallback class="rounded-lg">{{ userInitials }}</AvatarFallback>
                </Avatar>
                <div class="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span class="truncate font-semibold">{{ userName }}</span>
                  <span class="truncate text-xs">{{ userRole }}</span>
                </div>
                <HugeiconsIcon :icon="ChevronDownIcon" :size="14" class="ml-auto group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" class="w-(--reka-popper-anchor-width)">
              <DropdownMenuItem @select="goToUsers" :disabled="!canManageUsers">
                <HugeiconsIcon :icon="UserGroupIcon" :size="14" /><span>Account</span>
              </DropdownMenuItem>
              <DropdownMenuItem @select="goToSettings">
                <HugeiconsIcon :icon="Settings01Icon" :size="14" /><span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" @select="$emit('logout')">
                <HugeiconsIcon :icon="Logout01Icon" :size="14" /><span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <div class="flex items-center gap-1.5 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center">
            <Button variant="ghost" size="icon-sm" type="button" aria-label="Settings" title="Settings" @click="goToSettings">
              <HugeiconsIcon :icon="Settings01Icon" :size="15" />
            </Button>
            <ThemeToggle />
            <div class="flex-1 group-data-[collapsible=icon]:hidden" />
            <SidebarTrigger class="size-8" />
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>

  <Dialog :open="createModalOpen" @update:open="(v: boolean) => { if (!v) closeCreateModal() }">
    <DialogContent>
      <DialogHeader>
        <DialogDescription>NEW {{ createContext.type.toUpperCase() }}</DialogDescription>
        <DialogTitle>Create {{ createContext.type }}</DialogTitle>
      </DialogHeader>
      <form class="grid gap-4" @submit.prevent="submitCreate">
        <div class="grid gap-2">
          <Label for="sidebar-create-name">Name</Label>
          <Input id="sidebar-create-name" v-model="createForm.name" required />
        </div>
        <div class="grid gap-2">
          <Label for="sidebar-create-desc">Description</Label>
          <Input id="sidebar-create-desc" v-model="createForm.description" />
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" @click="closeCreateModal">Cancel</Button>
          <Button type="submit">Create</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>

  <Dialog :open="editModalOpen" @update:open="(v: boolean) => { if (!v) closeEditModal() }">
    <DialogContent>
      <DialogHeader>
        <DialogDescription>EDIT {{ editContext.type.toUpperCase() }}</DialogDescription>
        <DialogTitle>Edit {{ editContext.type }}</DialogTitle>
      </DialogHeader>
      <form class="grid gap-4" @submit.prevent="submitEdit">
        <div class="grid gap-2">
          <Label for="sidebar-edit-name">Name</Label>
          <Input id="sidebar-edit-name" v-model="editForm.name" required />
        </div>
        <div class="grid gap-2">
          <Label for="sidebar-edit-desc">Description</Label>
          <Input id="sidebar-edit-desc" v-model="editForm.description" />
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" @click="closeEditModal">Cancel</Button>
          <Button type="submit" :disabled="editSaving">{{ editSaving ? 'Saving...' : 'Save' }}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { HugeiconsIcon } from '@hugeicons/vue';
import {
  Building02Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  Copy01Icon,
  Database01Icon,
  Delete02Icon,
  Folder01Icon,
  Layers01Icon,
  Logout01Icon,
  MoreHorizontalIcon,
  PencilEdit01Icon,
  PlusSignIcon,
  Search01Icon,
  Settings01Icon,
  Shield01Icon,
  Tick02Icon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons';
import { organizationApi } from '../../services/api/organization.api';
import { workspaceApi } from '../../services/api/workspace.api';
import { repositoryGroupApi } from '../../services/api/repository-group.api';
import { repositoryApi } from '../../services/api/repository.api';
import { useSidebarStore } from '../../stores/sidebar.store';
import { useAuthStore } from '../../stores/auth.store';
import { useApiError } from '../../composables/useApiError';
import { useConfirm } from '../../composables/useConfirm';
import { useToast } from '../../composables/useToast';
import ThemeToggle from '../ui/ThemeToggle.vue';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarTrigger,
} from '../ui/sidebar';
import type { Organization, Workspace, RepositoryGroup, Repository } from '../../types/api';

defineEmits<{ logout: [] }>();

const ACTIVE_ORG_KEY = 'wg-vault-active-org';

const router = useRouter();
const route = useRoute();

const auth = useAuthStore();
const canManageUsers = computed(() => auth.user.value?.systemRole === 'SUPERADMIN');
const isSuperadmin = computed(() => auth.user.value?.systemRole === 'SUPERADMIN');
const canManage = computed(() => ['SUPERADMIN', 'MANAGER', 'USER'].includes(auth.user.value?.systemRole || ''));
const managerOnly = computed(() => ['SUPERADMIN', 'MANAGER'].includes(auth.user.value?.systemRole || ''));
const canCreateOrganization = computed(() => auth.user.value?.systemRole === 'SUPERADMIN');
const userName = computed(() => auth.user.value?.name || auth.user.value?.email || 'Administrator');
const userRole = computed(() => auth.user.value?.systemRole || 'ADMIN');
const userInitials = computed(() => (userName.value || 'AD').slice(0, 2).toUpperCase());

const organizations = ref<Organization[]>([]);
const orgWorkspaces = ref<Record<string, Workspace[]>>({});
const workspaceGroups = ref<Record<string, RepositoryGroup[]>>({});
const groupRepositories = ref<Record<string, Repository[]>>({});
const loading = ref(true);
const workspaceLoading = ref<Record<string, boolean>>({});
const groupLoading = ref<Record<string, boolean>>({});
const repoLoading = ref<Record<string, boolean>>({});
const expandedWorkspaces = ref<Record<string, boolean>>({});
const expandedGroups = ref<Record<string, boolean>>({});
const activeOrganizationId = ref('');
const createModalOpen = ref(false);
const createContext = ref({
  type: 'organization' as 'organization' | 'workspace' | 'group' | 'repo',
  organizationId: '',
  workspaceId: '',
  groupId: '',
});
const createForm = ref({ name: '', description: '' });
const editModalOpen = ref(false);
const editSaving = ref(false);
const editContext = ref({
  type: 'group' as 'group' | 'repo',
  groupId: '',
  repoId: '',
});
const editForm = ref({ name: '', description: '' });
const searchTerm = ref('');
const toast = useToast();
const apiError = useApiError();
const confirm = useConfirm();
const sidebar = useSidebarStore();

const activeOrganization = computed(() => {
  return organizations.value.find((org) => org.id === activeOrganizationId.value) ?? null;
});

const activeWorkspaces = computed(() => {
  if (!activeOrganizationId.value) return [];
  return orgWorkspaces.value[activeOrganizationId.value] || [];
});

function filteredWorkspaces(organizationId: string) {
  return orgWorkspaces.value[organizationId] || [];
}

function filteredGroups(workspaceId: string) {
  return workspaceGroups.value[workspaceId] || [];
}

function filteredRepos(groupId: string) {
  return groupRepositories.value[groupId] || [];
}

function setActiveOrg(id: string) {
  activeOrganizationId.value = id;
  if (id) {
    localStorage.setItem(ACTIVE_ORG_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_ORG_KEY);
  }
}

function syncActiveOrganization() {
  const ids = organizations.value.map((org) => org.id);
  const routeOrgId = String(route.params.organizationId || '');
  if (routeOrgId && ids.includes(routeOrgId)) {
    setActiveOrg(routeOrgId);
    return;
  }
  if (activeOrganizationId.value && ids.includes(activeOrganizationId.value)) return;
  const saved = localStorage.getItem(ACTIVE_ORG_KEY);
  if (saved && ids.includes(saved)) {
    setActiveOrg(saved);
    return;
  }
  setActiveOrg(ids[0] ?? '');
}

function selectOrganization(id: string) {
  if (id === activeOrganizationId.value) return;
  setActiveOrg(id);
  const target = `/organizations/${id}`;
  if (router.currentRoute.value.path !== target) {
    router.push(target);
  }
}

function createWorkspace() {
  if (!activeOrganizationId.value) {
    toast.push('Create an organization first.', 'error');
    return;
  }
  openCreateModal('workspace', activeOrganizationId.value);
}

function setWorkspaceOpen(id: string, value: boolean) {
  expandedWorkspaces.value[id] = value;
}

function setGroupOpen(id: string, value: boolean) {
  expandedGroups.value[id] = value;
}

function goToUsers() {
  router.push('/users');
}

function goToSettings() {
  const orgId = activeOrganizationId.value || organizations.value[0]?.id;
  if (orgId) {
    router.push(`/organizations/${orgId}`);
  } else {
    router.push('/');
  }
}

function isWorkspaceActive(organizationId: string, workspaceId: string) {
  return router.currentRoute.value.path === `/organizations/${organizationId}/workspaces/${workspaceId}`;
}

function isGroupActive(groupId: string) {
  return router.currentRoute.value.path.includes(`/repository-groups/${groupId}`);
}

function isRepositoryActive(repositoryId: string) {
  return router.currentRoute.value.path === `/repositories/${repositoryId}`;
}

function syncFromStore() {
  organizations.value = [...sidebar.organizations.value];
  orgWorkspaces.value = { ...sidebar.orgWorkspaces.value };
  workspaceGroups.value = { ...sidebar.workspaceGroups.value };
  groupRepositories.value = { ...sidebar.groupRepositories.value };
  for (const workspaces of Object.values(orgWorkspaces.value)) {
    for (const workspace of workspaces) {
      if (!(workspace.id in expandedWorkspaces.value)) {
        expandedWorkspaces.value[workspace.id] = false;
      }
    }
  }
  for (const groups of Object.values(workspaceGroups.value)) {
    for (const group of groups) {
      if (!(group.id in expandedGroups.value)) {
        expandedGroups.value[group.id] = false;
      }
    }
  }
  syncActiveOrganization();
}

async function loadOrganizations(force = false) {
  loading.value = true;
  try {
    await sidebar.load(force);
    syncFromStore();
  } catch (e) {
    toast.push(apiError.message(e, 'Unable to load navigation.'), 'error');
  } finally {
    loading.value = false;
  }
}

async function refreshMenu() {
  loading.value = true;
  try {
    await sidebar.refresh();
    syncFromStore();
  } catch (e) {
    toast.push(apiError.message(e, 'Unable to refresh navigation.'), 'error');
  } finally {
    loading.value = false;
  }
}

function onWorkspaceClick(organizationId: string, id: string) {
  // Expand/collapse is handled by CollapsibleTrigger; here we only navigate.
  router.push(`/organizations/${organizationId}/workspaces/${id}`);
}

function closeCreateModal() {
  createModalOpen.value = false;
  createContext.value = {
    type: 'organization',
    organizationId: '',
    workspaceId: '',
    groupId: '',
  };
  createForm.value = { name: '', description: '' };
}

function openCreateModal(type: 'organization' | 'workspace' | 'group' | 'repo', organizationId = '', workspaceId = '', groupId = '') {
  createContext.value = { type, organizationId, workspaceId, groupId };
  createForm.value = { name: '', description: '' };
  createModalOpen.value = true;
}

async function submitCreate() {
  const name = createForm.value.name.trim();
  const description = createForm.value.description.trim();

  if (!name) {
    toast.push('Name is required.', 'error');
    return;
  }

  try {
    if (createContext.value.type === 'organization') {
      await organizationApi.create({ name, description: description || undefined });
    } else if (createContext.value.type === 'workspace') {
      await workspaceApi.create(createContext.value.organizationId, {
        name,
        description: description || undefined,
      });
    } else if (createContext.value.type === 'group') {
      await repositoryGroupApi.create(createContext.value.workspaceId, {
        name,
        description: description || undefined,
      });
    } else if (createContext.value.type === 'repo') {
      await repositoryApi.create(createContext.value.groupId, {
        name,
        description: description || undefined,
      });
    }

    toast.push(`${createContext.value.type.charAt(0).toUpperCase() + createContext.value.type.slice(1)} created.`, 'success');
    closeCreateModal();
    await refreshMenu();
  } catch (e) {
    toast.push(apiError.message(e, `Unable to create ${createContext.value.type}.`), 'error');
  }
}

function handleCreate(type: string, organizationId?: string, workspaceId?: string, groupId?: string, repoId?: string) {
  if (type === 'organization') {
    openCreateModal('organization');
  } else if (type === 'workspace' && organizationId) {
    openCreateModal('workspace', organizationId);
  } else if (type === 'group' && workspaceId) {
    openCreateModal('group', '', workspaceId);
  } else if (type === 'repo' && groupId) {
    openCreateModal('repo', '', '', groupId);
  }
}

async function handleDuplicate(type: string, organizationId?: string, workspaceId?: string, groupId?: string, repoId?: string) {
  try {
    if (type === 'organization' && organizationId) {
      await organizationApi.duplicate(organizationId);
    } else if (type === 'workspace' && organizationId && workspaceId) {
      await workspaceApi.duplicate(organizationId, workspaceId);
    } else if (type === 'group' && workspaceId && groupId) {
      await repositoryGroupApi.duplicate(workspaceId, groupId);
    } else if (type === 'repo' && repoId) {
      await repositoryApi.duplicate(repoId);
    }

    toast.push(`${type.charAt(0).toUpperCase() + type.slice(1)} duplicated.`, 'success');
    await refreshMenu();
  } catch (e) {
    toast.push(apiError.message(e, `Unable to duplicate ${type}.`), 'error');
  }
}

function handleEdit(type: string, organizationId?: string, workspaceId?: string, groupId?: string, repoId?: string) {
  if (type === 'organization' && organizationId) {
    router.push(`/organizations/${organizationId}`);
  } else if (type === 'workspace' && organizationId && workspaceId) {
    router.push(`/organizations/${organizationId}/workspaces/${workspaceId}`);
  } else if (type === 'group' && workspaceId && groupId) {
    openEditModal('group', workspaceId, groupId);
  } else if (type === 'repo' && repoId) {
    openEditModal('repo', groupId || '', repoId);
  }
}

function closeEditModal() {
  editModalOpen.value = false;
  editContext.value = { type: 'group', groupId: '', repoId: '' };
  editForm.value = { name: '', description: '' };
}

async function openEditModal(type: 'group' | 'repo', groupId: string, id: string) {
  // Prefill instan dari menu, lalu lengkapi description dari detail.
  if (type === 'group') {
    const group = (workspaceGroups.value[groupId] || []).find((g) => g.id === id);
    editContext.value = { type, groupId: id, repoId: '' };
    editForm.value = { name: group?.name || '', description: '' };
    editModalOpen.value = true;
    try {
      const detail = (await repositoryGroupApi.get(id)).data.data;
      if (editModalOpen.value && editContext.value.groupId === id) {
        editForm.value = { name: detail.name || '', description: detail.description || '' };
      }
    } catch {
      // Tetap pakai prefill dari menu.
    }
  } else {
    const repo = (groupRepositories.value[groupId] || []).find((r) => r.id === id);
    editContext.value = { type, groupId, repoId: id };
    editForm.value = { name: repo?.name || '', description: '' };
    editModalOpen.value = true;
    try {
      const detail = (await repositoryApi.get(id)).data.data;
      if (editModalOpen.value && editContext.value.repoId === id) {
        editForm.value = { name: detail.name || '', description: detail.description || '' };
      }
    } catch {
      // Tetap pakai prefill dari menu.
    }
  }
}

async function submitEdit() {
  const name = editForm.value.name.trim();
  const description = editForm.value.description.trim();
  if (!name) {
    toast.push('Name is required.', 'error');
    return;
  }

  editSaving.value = true;
  try {
    if (editContext.value.type === 'group' && editContext.value.groupId) {
      await repositoryGroupApi.update(editContext.value.groupId, {
        name,
        description: description || undefined,
      });
    } else if (editContext.value.type === 'repo' && editContext.value.repoId) {
      await repositoryApi.update(editContext.value.repoId, {
        name,
        description: description || undefined,
      });
    } else {
      return;
    }
    toast.push(`${editContext.value.type === 'group' ? 'Group' : 'Repository'} updated.`, 'success');
    closeEditModal();
    await refreshMenu();
  } catch (e) {
    toast.push(apiError.message(e, `Unable to update ${editContext.value.type}.`), 'error');
  } finally {
    editSaving.value = false;
  }
}

async function handleDelete(type: string, organizationId?: string, workspaceId?: string, groupId?: string, repoId?: string) {
  const ok = await confirm.ask({
    title: `Delete ${type}?`,
    description: `This ${type} and all data inside it will be permanently removed.`,
    confirmLabel: 'Delete',
  });
  if (!ok) return;

  try {
    if (type === 'organization' && organizationId) {
      await organizationApi.remove(organizationId);
    } else if (type === 'workspace' && organizationId && workspaceId) {
      await workspaceApi.remove(organizationId, workspaceId);
    } else if (type === 'group' && workspaceId && groupId) {
      await repositoryGroupApi.remove(groupId);
    } else if (type === 'repo' && repoId) {
      await repositoryApi.remove(repoId);
    }

    toast.push(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted.`, 'success');
    await refreshMenu();

    if (type === 'organization' && router.currentRoute.value.path !== '/') {
      router.push('/');
    }
  } catch (e) {
    toast.push(apiError.message(e, `Unable to delete ${type}.`), 'error');
  }
}

watch(
  () => route.params.organizationId,
  () => {
    syncActiveOrganization();
  },
);

// Refresh dari view lain (update org/workspace/group/repo) langsungPropagate ke sidebar.
watch(
  () => sidebar.menu.value,
  () => {
    syncFromStore();
  },
  { deep: true },
);

onMounted(() => {
  loadOrganizations();
});
</script>

<style>
/* Tombol titik 3 hanya muncul di row spesifik yang sedang di-hover. */
@media (hover: hover) and (pointer: fine) {
  .menu-row > [data-sidebar="menu-action"] {
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.15s ease, visibility 0.15s ease;
  }
  .menu-row:hover > [data-sidebar="menu-action"],
  .menu-row:focus-within > [data-sidebar="menu-action"],
  .menu-row > [data-sidebar="menu-action"][data-state="open"] {
    opacity: 1;
    visibility: visible;
  }
  /* Row induk ikut :hover saat row anak di-hover, sembunyikan lagi
     supaya cuma row terdalam yang menampilkan tombolnya. */
  .menu-row:has(.menu-row:hover) > [data-sidebar="menu-action"] {
    opacity: 0;
    visibility: hidden;
  }
  .menu-row:has(.menu-row:hover) > [data-sidebar="menu-action"][data-state="open"],
  .menu-row:has(.menu-row:hover):focus-within > [data-sidebar="menu-action"] {
    opacity: 1;
    visibility: visible;
  }
}
</style>

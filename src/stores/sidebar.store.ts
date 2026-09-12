import { computed, ref } from 'vue';
import { sidebarApi } from '../services/api/sidebar.api';
import type {
  Organization,
  Repository,
  RepositoryGroup,
  SidebarOrganization,
  Workspace,
} from '../types/api';

const menu = ref<SidebarOrganization[]>([]);
const loading = ref(false);
const loaded = ref(false);
let inflight: Promise<void> | null = null;

/**
 * Single-hit sidebar store.
 * Dipakai di router middleware (preload sekali) + AppSidebar.
 * Dedupe in-flight request + cache di memori, invalidate manual
 * setelah create/duplicate/delete.
 */
export function useSidebarStore() {
  const organizations = computed<Organization[]>(() =>
    menu.value.map((o) => ({ id: o.id, name: o.name, slug: o.slug })),
  );

  const orgWorkspaces = computed<Record<string, Workspace[]>>(() => {
    const map: Record<string, Workspace[]> = {};
    for (const o of menu.value) {
      map[o.id] = o.workspaces.map((w) => ({
        id: w.id,
        name: w.name,
        slug: w.slug,
        organizationId: o.id,
      }));
    }
    return map;
  });

  const workspaceGroups = computed<Record<string, RepositoryGroup[]>>(() => {
    const map: Record<string, RepositoryGroup[]> = {};
    for (const o of menu.value) {
      for (const w of o.workspaces) {
        map[w.id] = w.groups.map((g) => ({
          id: g.id,
          name: g.name,
          slug: g.slug,
          workspaceId: w.id,
        }));
      }
    }
    return map;
  });

  const groupRepositories = computed<Record<string, Repository[]>>(() => {
    const map: Record<string, Repository[]> = {};
    for (const o of menu.value) {
      for (const w of o.workspaces) {
        for (const g of w.groups) {
          map[g.id] = g.repositories.map((r) => ({
            id: r.id,
            name: r.name,
            slug: r.slug,
            description: null,
            repositoryGroupId: g.id,
            createdAt: '',
            updatedAt: '',
          }));
        }
      }
    }
    return map;
  });

  async function load(force = false, organizationId?: string, fresh = false) {
    if (loading.value && inflight) {
      await inflight;
      return;
    }
    if (loaded.value && !force) return;
    loading.value = true;
    inflight = (async () => {
      const response = await sidebarApi.menu(organizationId, fresh);
      menu.value = response.data.data ?? [];
      loaded.value = true;
    })().finally(() => {
      loading.value = false;
      inflight = null;
    });
    await inflight;
  }

  function invalidate() {
    loaded.value = false;
  }

  async function refresh() {
    invalidate();
    await load(true, undefined, true);
  }

  return { menu, loading, loaded, organizations, orgWorkspaces, workspaceGroups, groupRepositories, load, invalidate, refresh };
}

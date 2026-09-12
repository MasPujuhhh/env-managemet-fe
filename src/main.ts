import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import DefaultLayout from './layouts/DefaultLayout.vue';
import AuthLayout from './layouts/AuthLayout.vue';
import LoginView from './views/auth/LoginView.vue';
import DashboardView from './views/dashboard/DashboardView.vue';
import OrganizationsView from './views/organizations/OrganizationsView.vue';
import WorkspacesView from './views/workspaces/WorkspacesView.vue';
import RepositoryGroupsView from './views/repository-groups/RepositoryGroupsView.vue';
import RepositoryListView from './views/repositories/RepositoryListView.vue';
import RepositoryDetailView from './views/repositories/RepositoryDetailView.vue';
import UsersView from './views/users/UsersView.vue';
import NotFoundView from './views/errors/NotFoundView.vue';
import './style.css';
import { useAuthStore } from './stores/auth.store';
import { useSidebarStore } from './stores/sidebar.store';
import { tokenStorage } from './services/storage/token.storage';
import { useTheme } from './composables/useTheme';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: AuthLayout, children: [{ path: '', component: LoginView }] },
    {
      path: '/',
      component: DefaultLayout,
      meta: { auth: true },
      children: [
        { path: '', component: DashboardView, meta: { title: 'Dashboard' } },
        { path: 'organizations', component: OrganizationsView, meta: { title: 'Organizations' } },
        { path: 'organizations/:organizationId', component: OrganizationsView, meta: { title: 'Organization detail' } },
        { path: 'organizations/:organizationId/workspaces', component: WorkspacesView, meta: { title: 'Workspaces' } },
        { path: 'organizations/:organizationId/workspaces/:workspaceId', component: WorkspacesView, meta: { title: 'Workspace detail' } },
        { path: 'workspaces/:workspaceId/repository-groups', component: RepositoryGroupsView, meta: { title: 'Repository groups' } },
        { path: 'repositories', component: RepositoryListView, meta: { title: 'Repositories' } },
        { path: 'repositories/:id', component: RepositoryDetailView, meta: { title: 'Repository details' } },
        { path: 'users', component: UsersView, meta: { title: 'Users' } },
      ],
    },
    { path: '/:pathMatch(.*)*', component: NotFoundView },
  ],
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  if (auth.user.value === null && tokenStorage.get()) await auth.initialize();
  if (to.meta.auth && !auth.isAuthenticated.value) return '/login';
  if (to.path === '/login' && auth.isAuthenticated.value) return '/';
  // Middleware: single-hit sidebar menu, preload sekali setelah auth.
  if (auth.isAuthenticated.value && to.meta.auth) {
    try {
      await useSidebarStore().load();
    } catch {
      // Jangan blok navigasi kalau menu gagal; AppSidebar akan retry.
    }
  }
});

const { initializeTheme } = useTheme();
initializeTheme();

createApp(App).use(router).mount('#app');

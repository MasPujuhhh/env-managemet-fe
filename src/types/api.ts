export interface ApiResponse<T> {
  success: boolean;
  message: string;
  errors: unknown;
  metadata: Record<string, unknown>;
  data: T;
}

export interface PageMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Pagination {
  page?: number;
  limit?: number;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  systemRole?: 'SUPERADMIN' | 'MANAGER' | 'USER';
  role?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  organizationId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RepositoryGroup {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  workspaceId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Repository {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  repositoryGroupId?: string;
  ownerId?: string;
  createdAt: string;
  updatedAt: string;
  _count?: { secrets: number; apiKeys: number };
}

export interface SidebarRepository {
  id: string;
  name: string;
  slug: string;
  repositoryGroupId: string;
}

export interface SidebarGroup {
  id: string;
  name: string;
  slug: string;
  workspaceId: string;
  repositories: SidebarRepository[];
}

export interface SidebarWorkspace {
  id: string;
  name: string;
  slug: string;
  organizationId: string;
  groups: SidebarGroup[];
}

export interface SidebarOrganization {
  id: string;
  name: string;
  slug: string;
  workspaces: SidebarWorkspace[];
}

export type SecretType = 'SECRET' | 'COMMENT' | 'EMPTY';

export interface Secret {
  id: string;
  key: string;
  value: string | null;
  type?: SecretType;
  createdAt: string;
  updatedAt: string;
}

export interface SyncSecretSummary {
  total: number;
  created: number;
  updated: number;
  deleted: number;
  unchanged: number;
}

export interface ApiKey {
  id: string;
  name: string;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
}

export interface RepositoryInput {
  name: string;
  slug?: string;
  description?: string;
  repositoryGroupId?: string;
}

export interface SecretInput {
  key: string;
  value: string;
}

export interface ApiKeyInput {
  name: string;
}

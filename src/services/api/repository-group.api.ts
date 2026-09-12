import { client } from './client';
import type { ApiResponse, RepositoryGroup } from '../../types/api';

export const repositoryGroupApi = {
  list: (workspaceId: string) =>
    client.get<ApiResponse<RepositoryGroup[]>>(`/workspaces/${workspaceId}/repository-groups`),
  get: (id: string) => client.get<ApiResponse<RepositoryGroup>>(`/repository-groups/${id}`),
  create: (workspaceId: string, payload: Partial<RepositoryGroup>) =>
    client.post<ApiResponse<RepositoryGroup>>(`/workspaces/${workspaceId}/repository-groups`, payload),
  duplicate: (workspaceId: string, groupId: string) =>
    client.post<ApiResponse<RepositoryGroup>>(
      `/workspaces/${workspaceId}/repository-groups/${groupId}/duplicate`,
      {},
    ),
  update: (id: string, payload: Partial<RepositoryGroup>) =>
    client.patch<ApiResponse<RepositoryGroup>>(`/repository-groups/${id}`, payload),
  remove: (id: string) => client.delete<ApiResponse<{ success: boolean }>>(`/repository-groups/${id}`),
};

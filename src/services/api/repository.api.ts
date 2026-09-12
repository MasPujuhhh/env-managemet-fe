import { client } from './client';
import type { ApiResponse, PageMetadata, Repository, RepositoryInput } from '../../types/api';

export const repositoryApi = {
  listByGroup: (groupId: string, page = 1, limit = 20) =>
    client.get<ApiResponse<Repository[]> & { data: Repository[]; metadata: PageMetadata }>(
      `/repository-groups/${groupId}/repositories`,
      { params: { page, limit } },
    ),
  create: (groupId: string, payload: RepositoryInput) =>
    client.post<ApiResponse<Repository>>(`/repository-groups/${groupId}/repositories`, payload),
  duplicate: (id: string) => client.post<ApiResponse<Repository>>(`/repositories/${id}/duplicate`, {}),
  get: (id: string) => client.get<ApiResponse<Repository>>(`/repositories/${id}`),
  update: (id: string, payload: RepositoryInput) =>
    client.patch<ApiResponse<Repository>>(`/repositories/${id}`, payload),
  remove: (id: string) => client.delete<ApiResponse<{ success: boolean }>>(`/repositories/${id}`),
  list: (_page = 1, _limit = 20, groupId?: string) => {
    if (groupId) return repositoryApi.listByGroup(groupId, _page, _limit);

    return Promise.reject(
      new Error(
        'Repository list requires a repository group context. Use organization → workspace → repository-group → repository flow.',
      ),
    );
  },
};

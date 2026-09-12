import { client } from './client';
import type { ApiResponse, Secret, SecretInput, SecretType, SyncSecretSummary } from '../../types/api';

export const secretApi = {
  list: (repositoryId: string, types?: SecretType[]) =>
    client.get<ApiResponse<Secret[]>>(`/repositories/${repositoryId}/secrets`, {
      params: types ? { types: types.join(',') } : undefined,
    }),
  sync: (repositoryId: string, content: string) =>
    client.put<ApiResponse<SyncSecretSummary>>(`/repositories/${repositoryId}/secrets/sync`, { content }),
  create: (repositoryId: string, payload: SecretInput) =>
    client.post<ApiResponse<Secret>>(`/repositories/${repositoryId}/secrets`, payload),
  update: (repositoryId: string, secretId: string, payload: SecretInput) =>
    client.patch<ApiResponse<Secret>>(`/repositories/${repositoryId}/secrets/${secretId}`, payload),
  remove: (repositoryId: string, secretId: string) =>
    client.delete<ApiResponse<{ success: boolean }>>(
      `/repositories/${repositoryId}/secrets/${secretId}`,
    ),
};

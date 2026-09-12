import { client } from './client';
import type { ApiKey, ApiKeyInput, ApiResponse } from '../../types/api';
export const apiKeyApi = {
  list: (repositoryId: string) =>
    client.get<ApiResponse<ApiKey[]>>(`/repositories/${repositoryId}/api-keys`),
  create: (repositoryId: string, payload: ApiKeyInput) =>
    client.post<ApiResponse<{ name: string; key: string }>>(
      `/repositories/${repositoryId}/api-keys`,
      payload,
    ),
  revoke: (repositoryId: string, id: string) =>
    client.delete<ApiResponse<{ success: boolean }>>(
      `/repositories/${repositoryId}/api-keys/${id}`,
    ),
};

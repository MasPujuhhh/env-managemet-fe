import { client } from './client';
import type { ApiResponse, Workspace } from '../../types/api';

export const workspaceApi = {
  list: (organizationId: string) =>
    client.get<ApiResponse<Workspace[]>>(`/organizations/${organizationId}/workspaces`),
  get: (organizationId: string, workspaceId: string) =>
    client.get<ApiResponse<Workspace>>(`/organizations/${organizationId}/workspaces/${workspaceId}`),
  create: (organizationId: string, payload: Partial<Workspace>) =>
    client.post<ApiResponse<Workspace>>(`/organizations/${organizationId}/workspaces`, payload),
  duplicate: (organizationId: string, workspaceId: string) =>
    client.post<ApiResponse<Workspace>>(
      `/organizations/${organizationId}/workspaces/${workspaceId}/duplicate`,
      {},
    ),
  update: (organizationId: string, workspaceId: string, payload: Partial<Workspace>) =>
    client.patch<ApiResponse<Workspace>>(
      `/organizations/${organizationId}/workspaces/${workspaceId}`,
      payload,
    ),
  remove: (organizationId: string, workspaceId: string) =>
    client.delete<ApiResponse<{ success: boolean }>>(
      `/organizations/${organizationId}/workspaces/${workspaceId}`,
    ),
  members: (workspaceId: string) => client.get<ApiResponse<any[]>>(`/workspaces/${workspaceId}/members`),
  addMember: (workspaceId: string, payload: { userId: string }) =>
    client.post<ApiResponse<any>>(`/workspaces/${workspaceId}/members`, payload),
  removeMember: (workspaceId: string, memberId: string) =>
    client.delete<ApiResponse<{ success: boolean }>>(`/workspaces/${workspaceId}/members/${memberId}`),
};

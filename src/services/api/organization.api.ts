import { client } from './client';
import type { ApiResponse, Organization } from '../../types/api';

export const organizationApi = {
  list: () => client.get<ApiResponse<Organization[]>>('/organizations'),
  get: (id: string) => client.get<ApiResponse<Organization>>(`/organizations/${id}`),
  create: (payload: Partial<Organization>) =>
    client.post<ApiResponse<Organization>>('/organizations', payload),
  duplicate: (id: string) => client.post<ApiResponse<Organization>>(`/organizations/${id}/duplicate`, {}),
  update: (id: string, payload: Partial<Organization>) =>
    client.patch<ApiResponse<Organization>>(`/organizations/${id}`, payload),
  remove: (id: string) => client.delete<ApiResponse<{ success: boolean }>>(`/organizations/${id}`),
  members: (id: string) => client.get<ApiResponse<any[]>>(`/organizations/${id}/members`),
  assignableUsers: (id: string) =>
    client.get<ApiResponse<{ id: string; name: string; email: string }[]>>(
      `/organizations/${id}/assignable-users`,
    ),
  addMember: (
    id: string,
    payload: { email: string; name: string; password?: string; role: 'MANAGER' | 'USER' },
  ) => client.post<ApiResponse<any>>(`/organizations/${id}/members`, payload),
  removeMember: (id: string, memberId: string) =>
    client.delete<ApiResponse<{ success: boolean }>>(`/organizations/${id}/members/${memberId}`),
};

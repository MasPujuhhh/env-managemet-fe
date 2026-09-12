import { client } from './client';
import type { ApiResponse, User } from '../../types/api';

export type AccessNode = {
  id: string;
  name: string;
  description?: string | null;
  role?: string | null;
  workspaces?: AccessNode[];
  groups?: AccessNode[];
  repositories?: AccessNode[];
};

export const userApi = {
  list: () => client.get<ApiResponse<User[]>>('/users'),
  access: () => client.get<ApiResponse<AccessNode[]>>('/users/access'),
  create: (payload: { name: string; email: string; password: string; organizationId: string; role: 'MANAGER' | 'USER' }) =>
    client.post<ApiResponse<any>>('/users', payload),
  get: (id: string) => client.get<ApiResponse<User>>(`/users/${id}`),
  update: (id: string, payload: Partial<{ name: string; email: string; password: string; role: 'MANAGER' | 'USER' }>) =>
    client.patch<ApiResponse<User>>(`/users/${id}`, payload),
  remove: (id: string) => client.delete<ApiResponse<{ success: boolean }>>(`/users/${id}`),
  resetPassword: (id: string) =>
    client.post<ApiResponse<{ success: boolean }>>(`/users/${id}/reset-password`, {}),
};

import { client } from './client';
import type { ApiResponse, User } from '../../types/api';
export const authApi = {
  login: (payload: { email: string; password: string }) =>
    client.post<ApiResponse<{ accessToken: string }>>('/auth/login', payload),
  me: () => client.get<ApiResponse<User>>('/auth/me'),
  logout: () => client.post<ApiResponse<{ success: boolean }>>('/auth/logout'),
};

import { client } from './client';
import type { ApiResponse, SidebarOrganization } from '../../types/api';

export const sidebarApi = {
  menu: (organizationId?: string, fresh = false) =>
    client.get<ApiResponse<SidebarOrganization[]>>('/sidebar/menu', {
      params: {
        ...(organizationId ? { organizationId } : {}),
        // URL beda tiap refresh -> browser/proxy tidak boleh sajikan cache lama.
        ...(fresh ? { _t: Date.now().toString() } : {}),
      },
    }),
};

import apiClient from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
import type { DashboardResponse } from "../domain/contracts/dashboard.contracts";

export const dashboardService = {
  getDashboard: async (): Promise<DashboardResponse> => {
    const response = await apiClient.get<DashboardResponse>(
      API_ENDPOINTS.DASHBOARD.BASE,
    );

    return response.data;
  },
};

import apiClient from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
import type {
  CreateUserSettingsRequest,
  CreateUserSettingsResponse,
  GetUserSettingsResponse,
  UpdateUserSettingsRequest,
  UpdateUserSettingsResponse,
} from "../domain/contracts/user-settings.contracts";

export const settingsService = {
  getSettings: async (): Promise<GetUserSettingsResponse> => {
    const response = await apiClient.get<GetUserSettingsResponse>(
      API_ENDPOINTS.USER.SETTINGS,
    );

    return response.data;
  },

  createSettings: async (
    payload: CreateUserSettingsRequest,
  ): Promise<CreateUserSettingsResponse> => {
    const response = await apiClient.post<CreateUserSettingsResponse>(
      API_ENDPOINTS.USER.SETTINGS,
      payload,
    );

    return response.data;
  },

  updateSettings: async (
    payload: UpdateUserSettingsRequest,
  ): Promise<UpdateUserSettingsResponse> => {
    const response = await apiClient.patch<UpdateUserSettingsResponse>(
      API_ENDPOINTS.USER.SETTINGS,
      payload,
    );

    return response.data;
  },
};

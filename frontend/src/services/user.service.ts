import apiClient from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
import type { ApiSuccessResponse } from "../domain/api/api-response";
import type {
  ChangePasswordRequest,
  UpdateProfileRequest,
  UserResponse,
} from "../domain/contracts/user.contracts";

export const userService = {
  getProfile: async (): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>(API_ENDPOINTS.USER.ME);

    return response.data;
  },

  updateProfile: async (
    payload: UpdateProfileRequest,
  ): Promise<UserResponse> => {
    const response = await apiClient.patch<UserResponse>(
      API_ENDPOINTS.USER.ME,
      payload,
    );

    return response.data;
  },

  uploadProfilePicture: async (file: File): Promise<UserResponse> => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await apiClient.post<UserResponse>(
      API_ENDPOINTS.USER.PROFILE_PICTURE,
      formData,
    );

    return response.data;
  },

  changePassword: async (
    payload: ChangePasswordRequest,
  ): Promise<ApiSuccessResponse<null>> => {
    const response = await apiClient.patch<ApiSuccessResponse<null>>(
      API_ENDPOINTS.USER.PASSWORD,
      payload,
    );

    return response.data;
  },
};

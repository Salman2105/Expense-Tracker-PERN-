import apiClient from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
import type { ApiSuccessResponse } from "../domain/api/api-response";
import type {
  AuthenticatedSessionResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "../domain/auth/auth.contracts";

export const authService = {
  register: async (payload: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      payload,
    );

    return response.data;
  },

  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      payload,
    );

    return response.data;
  },

  getCurrentUser: async (): Promise<AuthenticatedSessionResponse> => {
    const response = await apiClient.get<AuthenticatedSessionResponse>(
      API_ENDPOINTS.AUTH.ME,
    );

    return response.data;
  },

  logout: async (): Promise<ApiSuccessResponse<null>> => {
    const response = await apiClient.post<ApiSuccessResponse<null>>(
      API_ENDPOINTS.AUTH.LOGOUT,
    );

    return response.data;
  },
};

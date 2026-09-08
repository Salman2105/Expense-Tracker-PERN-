import apiClient from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
import type { ApiSuccessResponse } from "../domain/api/api-response";
import type {
  AuthenticatedSessionResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ForgotPasswordRequest,
  PasswordResetResponse,
  ResetPasswordRequest,
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

  forgotPassword: async (
    payload: ForgotPasswordRequest,
  ): Promise<PasswordResetResponse> => {
    const response = await apiClient.post<PasswordResetResponse>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      payload,
    );
    return response.data;
  },

  resetPassword: async (
    payload: ResetPasswordRequest,
  ): Promise<PasswordResetResponse> => {
    const response = await apiClient.post<PasswordResetResponse>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      payload,
    );
    return response.data;
  },
};

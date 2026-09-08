import type { AuthenticatedUser } from "../models/user";
import type { UserStatus } from "../enums/user-status";
import type { ApiSuccessResponse } from "../api/api-response";

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisteredUser {
  userId: string;
  username: string;
  email: string;
  status: UserStatus;
  deletedAt: string | null;
  createdAt: string;
}

export type RegisterResponse = ApiSuccessResponse<RegisteredUser>;

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginUser {
  userId: string;
  username: string;
  email: string;
  status: UserStatus;
}

export interface LoginResponseData {
  token: string;
  user: LoginUser;
}

export type LoginResponse = ApiSuccessResponse<LoginResponseData>;

export type AuthenticatedSessionResponse = ApiSuccessResponse<AuthenticatedUser>;

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export type PasswordResetResponse = ApiSuccessResponse<null>;

import type { User } from "../models/user";
import type { ApiSuccessResponse } from "../api/api-response";

export type UserResponse = ApiSuccessResponse<User>;

export interface UpdateProfileRequest {
  username?: string;
  profilePicture?: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

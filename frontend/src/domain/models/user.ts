import type { UserStatus } from "../enums/user-status";

export interface User {
  userId: string;
  username: string;
  email: string;
  status: UserStatus;
  profilePicture: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Response data returned by GET /api/auth/me. */
export interface AuthenticatedUser extends User {
  deletedAt: string | null;
}

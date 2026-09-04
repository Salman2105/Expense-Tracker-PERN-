import type { AuthenticatedUser } from "../models/user";

export type AuthStatus =
  | "INITIALIZING"
  | "AUTHENTICATED"
  | "UNAUTHENTICATED";

export interface AuthState {
  user: AuthenticatedUser | null;
  status: AuthStatus;
}

export interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  clearSession: () => void;
  refreshUser: () => Promise<void>;
}

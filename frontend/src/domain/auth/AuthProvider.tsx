import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { setUnauthorizedHandler } from "../../api/client";
import { authService } from "../../services/auth.service";
import { AuthContext } from "./auth.context";
import type { AuthState } from "./auth.types";
import { useToast } from "../../components/layout/ui/toast-context";

const ACCESS_TOKEN_KEY = "accessToken";

export function AuthProvider({ children }: PropsWithChildren) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [state, setState] = useState<AuthState>({
    user: null,
    status: "INITIALIZING",
  });
  const hasRestoredSession = useRef(false);
  const hasShownSessionExpiry = useRef(false);

  const clearSession = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    queryClient.clear();
    setState({ user: null, status: "UNAUTHENTICATED" });
  }, [queryClient]);

  const establishAuthenticatedUser = useCallback(async () => {
    const response = await authService.getCurrentUser();

    setState({ user: response.data, status: "AUTHENTICATED" });
  }, []);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);

    if (!token) {
      clearSession();
      return;
    }

    try {
      await establishAuthenticatedUser();
    } catch {
      clearSession();
    }
  }, [clearSession, establishAuthenticatedUser]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
      if (!hasShownSessionExpiry.current) {
        hasShownSessionExpiry.current = true;
        showToast("Your session has expired. Please log in again.", "warning");
      }
    });

    return () => {
      setUnauthorizedHandler(null);
    };
  }, [clearSession, showToast]);

  useEffect(() => {
    if (hasRestoredSession.current) {
      return;
    }

    hasRestoredSession.current = true;
    void refreshUser();
  }, [refreshUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      hasShownSessionExpiry.current = false;
      const loginResponse = await authService.login({ email, password });

      localStorage.setItem(ACCESS_TOKEN_KEY, loginResponse.data.token);

      try {
        await establishAuthenticatedUser();
      } catch (error) {
        clearSession();
        throw error;
      }
    },
    [clearSession, establishAuthenticatedUser],
  );

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      await authService.register({ username, email, password });
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        clearSession,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

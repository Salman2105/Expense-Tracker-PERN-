import axios from "axios";
import { API_ENDPOINTS } from "./endpoints";

type UnauthorizedHandler = (error: unknown) => void;

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000";

let unauthorizedHandler: UnauthorizedHandler | null = null;

const isPublicAuthRequest = (url: string | undefined) =>
  url === API_ENDPOINTS.AUTH.LOGIN || url === API_ENDPOINTS.AUTH.REGISTER;

/**
 * Lets the future auth/session layer decide how to react to unauthorized
 * responses. The Axios request still rejects so callers, including login,
 * can handle their own errors.
 */
export const setUnauthorizedHandler = (
  handler: UnauthorizedHandler | null,
) => {
  unauthorizedHandler = handler;
};

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    if (isPublicAuthRequest(config.url)) {
      return config;
    }

    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !isPublicAuthRequest(error.config?.url)
    ) {
      unauthorizedHandler?.(error);
    }

    return Promise.reject(error);
  },
);

export default apiClient;

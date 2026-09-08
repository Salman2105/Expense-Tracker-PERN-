const API_BASE_PATH = "/api";

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_BASE_PATH}/auth/register`,
    LOGIN: `${API_BASE_PATH}/auth/login`,
    LOGOUT: `${API_BASE_PATH}/auth/logout`,
    ME: `${API_BASE_PATH}/auth/me`,
    FORGOT_PASSWORD: `${API_BASE_PATH}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_PATH}/auth/reset-password`,
  },

  USER: {
    ME: `${API_BASE_PATH}/users/me`,
    PROFILE_PICTURE: `${API_BASE_PATH}/users/me/profile-picture`,
    PASSWORD: `${API_BASE_PATH}/users/me/password`,
    SETTINGS: `${API_BASE_PATH}/users/me/settings`,
  },

  ACCOUNT: {
    STATUS: `${API_BASE_PATH}/account/status`,
    DELETE: `${API_BASE_PATH}/account/delete`,
  },

  CATEGORIES: {
    BASE: `${API_BASE_PATH}/categories`,
    byId: (categoryId: string) =>
      `${API_BASE_PATH}/categories/${categoryId}`,
  },

  TRANSACTIONS: {
    BASE: `${API_BASE_PATH}/transactions`,
    byId: (transactionId: string) =>
      `${API_BASE_PATH}/transactions/${transactionId}`,
  },

  DASHBOARD: {
    BASE: `${API_BASE_PATH}/dashboard`,
  },
} as const;

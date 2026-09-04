import apiClient from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
import type { AccountStatusResponse, DeleteAccountResponse } from "../domain/contracts/account.contracts";

export const accountService = {
  getAccountStatus: async (): Promise<AccountStatusResponse> => {
    const response = await apiClient.get<AccountStatusResponse>(API_ENDPOINTS.ACCOUNT.STATUS);
    return response.data;
  },
  deleteAccount: async (): Promise<DeleteAccountResponse> => {
    const response = await apiClient.delete<DeleteAccountResponse>(API_ENDPOINTS.ACCOUNT.DELETE);
    return response.data;
  },
};
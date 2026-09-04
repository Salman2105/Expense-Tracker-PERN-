import apiClient from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
import type {
  ApiSuccessResponse,
  DeleteResponseData,
} from "../domain/api/api-response";
import type {
  CreateTransactionRequest,
  TransactionListQuery,
  TransactionListResponse,
  TransactionResponse,
  UpdateTransactionRequest,
} from "../domain/contracts/transaction.contracts";

export const transactionService = {
  getTransactions: async (
    params?: TransactionListQuery,
  ): Promise<TransactionListResponse> => {
    const response = await apiClient.get<TransactionListResponse>(
      API_ENDPOINTS.TRANSACTIONS.BASE,
      { params },
    );

    return response.data;
  },

  getTransactionById: async (
    transactionId: string,
  ): Promise<TransactionResponse> => {
    const response = await apiClient.get<TransactionResponse>(
      API_ENDPOINTS.TRANSACTIONS.byId(transactionId),
    );

    return response.data;
  },

  createTransaction: async (
    payload: CreateTransactionRequest,
  ): Promise<TransactionResponse> => {
    const response = await apiClient.post<TransactionResponse>(
      API_ENDPOINTS.TRANSACTIONS.BASE,
      payload,
    );

    return response.data;
  },

  updateTransaction: async (
    transactionId: string,
    payload: UpdateTransactionRequest,
  ): Promise<TransactionResponse> => {
    const response = await apiClient.patch<TransactionResponse>(
      API_ENDPOINTS.TRANSACTIONS.byId(transactionId),
      payload,
    );

    return response.data;
  },

  deleteTransaction: async (
    transactionId: string,
  ): Promise<ApiSuccessResponse<DeleteResponseData>> => {
    const response = await apiClient.delete<ApiSuccessResponse<DeleteResponseData>>(
      API_ENDPOINTS.TRANSACTIONS.byId(transactionId),
    );

    return response.data;
  },
};

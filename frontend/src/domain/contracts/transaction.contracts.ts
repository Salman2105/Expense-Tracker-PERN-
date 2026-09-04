import type { Pagination } from "../api/pagination";
import type { ApiSuccessResponse } from "../api/api-response";
import type { TransactionType } from "../enums/transaction-type";
import type { Transaction } from "../models/transaction";

export type TransactionResponse = ApiSuccessResponse<Transaction>;

export interface CreateTransactionRequest {
  categoryId: string;
  type: TransactionType;
  amount: number | string;
  title: string;
  note?: string | null;
  transactionDate?: string;
}

export interface UpdateTransactionRequest {
  categoryId?: string;
  type?: TransactionType;
  amount?: number | string;
  title?: string;
  note?: string | null;
  transactionDate?: string;
}

export interface TransactionListQuery {
  page?: number;
  limit?: number;
  type?: TransactionType;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
}

export interface TransactionListData {
  transactions: Transaction[];
  pagination: Pagination;
}

export type TransactionListResponse = ApiSuccessResponse<TransactionListData>;

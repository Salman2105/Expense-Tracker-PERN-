import type { TransactionType } from "../enums/transaction-type";

export interface Transaction {
  transactionId: string;
  userId: string;
  categoryId: string;
  type: TransactionType;
  amount: string;
  title: string;
  note: string | null;
  transactionDate: string;
  createdAt: string;
  updatedAt: string;
}

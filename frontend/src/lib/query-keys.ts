import type { TransactionListQuery } from "../domain/contracts/transaction.contracts";

export const queryKeys = {
  dashboard: ["dashboard"] as const,
  categories: ["categories"] as const,
  transactions: (query: TransactionListQuery) => ["transactions", query] as const,
  transaction: (transactionId: string) => ["transactions", transactionId] as const,
  profile: ["profile"] as const,
  settings: ["settings"] as const,
  accountStatus: ["account", "status"] as const,
};
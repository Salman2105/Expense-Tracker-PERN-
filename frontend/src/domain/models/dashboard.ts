export interface CategorySpending {
  categoryId: string;
  amount: number;
}

export interface TransactionStats {
  totalTransactions: number;
  incomeTransactions: number;
  expenseTransactions: number;
}

export interface Dashboard {
  totalIncome: number;
  totalExpenses: number;
  currentBalance: number;
  monthlySpending: number;
  categorySpending: CategorySpending[];
  transactionStats: TransactionStats;
}

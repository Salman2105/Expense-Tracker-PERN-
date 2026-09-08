export interface CategorySpending {
  categoryId: string;
  amount: number;
}

export interface TransactionStats {
  totalTransactions: number;
  incomeTransactions: number;
  expenseTransactions: number;
  transactionsThisMonth: number;
}

export interface BudgetStatus {
  budgetId: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  limit: number;
  percentage: number;
  threshold: 80 | 100 | null;
}

export interface Dashboard {
  totalIncome: number;
  totalExpenses: number;
  currentBalance: number;
  monthlySpending: number;
  categorySpending: CategorySpending[];
  transactionStats: TransactionStats;
  budgetStatuses: BudgetStatus[];
}

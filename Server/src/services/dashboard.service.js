const { validate: isValidUuid } = require("uuid");
const AppError = require("../utils/AppError");
const transactionRepository = require("../repositories/transaction.repository");

const getDashboard = async (userId) => {
  // Validate authenticated user ID
  if (!userId || !isValidUuid(userId)) {
    throw new AppError("Invalid user ID", 400);
  }

  // Current month date range
  const now = new Date();

  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  );

  const startOfNextMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1
  );

  // These five queries are all independent reads for the same user, so
  // they run concurrently instead of as five sequential round trips.
  const [
    totalIncome,
    totalExpenses,
    monthlySpending,
    categorySpending,
    transactionStats,
  ] = await Promise.all([
    transactionRepository.sumAmountByType(userId, "INCOME"),
    transactionRepository.sumAmountByType(userId, "EXPENSE"),
    transactionRepository.sumAmountByTypeInRange(userId, "EXPENSE", {
      gte: startOfMonth,
      lt: startOfNextMonth,
    }),
    transactionRepository.sumAmountGroupedByCategory(userId, "EXPENSE"),
    transactionRepository.countGroupedByType(userId),
  ]);

  const income = Number(totalIncome._sum.amount || 0);
  const expenses = Number(totalExpenses._sum.amount || 0);

  // Current balance
  const currentBalance = income - expenses;

  const monthlySpendingAmount = Number(
    monthlySpending._sum.amount || 0
  );

  const categorySpendingData = categorySpending.map((item) => ({
    categoryId: item.categoryId,
    amount: Number(item._sum.amount || 0),
  }));

  const transactionStatistics = {
    totalTransactions: 0,
    incomeTransactions: 0,
    expenseTransactions: 0,
  };

  transactionStats.forEach((item) => {
    if (item.type === "INCOME") {
      transactionStatistics.incomeTransactions =
        item._count.transactionId;
    }

    if (item.type === "EXPENSE") {
      transactionStatistics.expenseTransactions =
        item._count.transactionId;
    }
  });

  transactionStatistics.totalTransactions =
    transactionStatistics.incomeTransactions +
    transactionStatistics.expenseTransactions;

  return {
    totalIncome: income,
    totalExpenses: expenses,
    currentBalance,
    monthlySpending: monthlySpendingAmount,
    categorySpending: categorySpendingData,
    transactionStats: transactionStatistics,
  };
};

module.exports = {
  getDashboard,
};

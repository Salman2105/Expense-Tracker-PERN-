const prisma = require("../../config/prisma");
const { validate: isValidUuid } = require("uuid");

const getDashboard = async (userId) => {
  // Validate authenticated user ID
  if (!userId || !isValidUuid(userId)) {
    const error = new Error("Invalid user ID");
    error.statusCode = 400;
    throw error;
  }

  // Total income
  const totalIncome = await prisma.transaction.aggregate({
    where: {
      userId,
      type: "INCOME",
    },
    _sum: {
      amount: true,
    },
  });

  // Total expenses
  const totalExpenses = await prisma.transaction.aggregate({
    where: {
      userId,
      type: "EXPENSE",
    },
    _sum: {
      amount: true,
    },
  });

  const income = Number(totalIncome._sum.amount || 0);
  const expenses = Number(totalExpenses._sum.amount || 0);

  // Current balance
  const currentBalance = income - expenses;

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

  // Monthly spending
  const monthlySpending = await prisma.transaction.aggregate({
    where: {
      userId,
      type: "EXPENSE",
      transactionDate: {
        gte: startOfMonth,
        lt: startOfNextMonth,
      },
    },
    _sum: {
      amount: true,
    },
  });

  const monthlySpendingAmount = Number(
    monthlySpending._sum.amount || 0
  );

  // Category-wise spending
  const categorySpending = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      userId,
      type: "EXPENSE",
    },
    _sum: {
      amount: true,
    },
  });

  const categorySpendingData = categorySpending.map((item) => ({
    categoryId: item.categoryId,
    amount: Number(item._sum.amount || 0),
  }));

  // Transaction statistics
  const transactionStats = await prisma.transaction.groupBy({
    by: ["type"],
    where: {
      userId,
    },
    _count: {
      transactionId: true,
    },
  });

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
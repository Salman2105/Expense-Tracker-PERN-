const prisma = require("../../config/prisma");

const create = (data, client = prisma) =>
  client.budget.create({
    data,
    include: { category: true },
  });

const findManyForUser = (userId, client = prisma) =>
  client.budget.findMany({
    where: { userId },
    include: { category: true },
    orderBy: { startDate: "desc" },
  });

const findActiveForUser = (userId, startDate, endDate, client = prisma) =>
  client.budget.findMany({
    where: {
      userId,
      startDate: { lt: endDate },
      endDate: { gt: startDate },
    },
    include: { category: true },
    orderBy: { startDate: "desc" },
  });

const findOwnedById = (budgetId, userId, client = prisma) =>
  client.budget.findFirst({
    where: { budgetId, userId },
    include: { category: true },
  });

const findActiveForTransaction = (transaction, client = prisma) =>
  client.budget.findMany({
    where: {
      userId: transaction.userId,
      categoryId: transaction.categoryId,
      startDate: { lte: transaction.transactionDate },
      endDate: { gt: transaction.transactionDate },
    },
    include: { category: true },
  });

const update = (budgetId, userId, data, client = prisma) =>
  client.budget.updateMany({
    where: { budgetId, userId },
    data,
  });

const deleteById = (budgetId, userId, client = prisma) =>
  client.budget.deleteMany({
    where: { budgetId, userId },
  });

const sumExpenseForBudget = (budget, client = prisma) =>
  client.transaction.aggregate({
    where: {
      userId: budget.userId,
      categoryId: budget.categoryId,
      type: "EXPENSE",
      transactionDate: {
        gte: budget.startDate,
        lt: budget.endDate,
      },
    },
    _sum: { amount: true },
  });

const claimAlert = (data, client = prisma) =>
  client.budgetAlert.create({ data });

const releaseAlert = (budgetId, threshold, periodStart, client = prisma) =>
  client.budgetAlert.deleteMany({
    where: { budgetId, threshold, periodStart },
  });

const markAlertSent = (alertId, client = prisma) =>
  client.budgetAlert.update({
    where: { alertId },
    data: { sentAt: new Date() },
  });

module.exports = {
  create,
  findManyForUser,
  findActiveForUser,
  findOwnedById,
  findActiveForTransaction,
  update,
  deleteById,
  sumExpenseForBudget,
  claimAlert,
  releaseAlert,
  markAlertSent,
};

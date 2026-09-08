const prisma = require("../../config/prisma");

/**
 * Transaction repository — every Prisma call against the `Transaction`
 * model lives here, including the read-aggregation queries the dashboard
 * is built from (there's no separate "Dashboard" table — it's a computed
 * view over transactions). See user.repository.js for the `client`
 * parameter convention.
 */

/**
 * Create a transaction.
 */
const create = (data, client = prisma) =>
  client.transaction.create({
    data,
  });

/**
 * A page of transactions plus the total matching count, fetched together
 * for pagination.
 */
const findManyWithCount = (where, { skip, take, orderBy }, client = prisma) =>
  client.$transaction([
    client.transaction.findMany({
      where,
      skip,
      take,
      orderBy,
    }),

    client.transaction.count({
      where,
    }),
  ]);

/**
 * A single transaction, scoped to its owner — used by get/update/delete,
 * which all need the identical "does this transaction belong to this
 * user" check.
 */
const findOwnedById = (transactionId, userId, client = prisma) =>
  client.transaction.findFirst({
    where: {
      transactionId,
      userId,
    },
  });

/**
 * Apply an update to a transaction.
 */
const update = (transactionId, data, client = prisma) =>
  client.transaction.update({
    where: { transactionId },
    data,
  });

/**
 * Delete a transaction.
 */
const deleteById = (transactionId, client = prisma) =>
  client.transaction.delete({
    where: { transactionId },
  });

/**
 * Reassign every transaction under one category to another — used when a
 * category is deleted and its transactions fall back to "Uncategorized".
 */
const updateManyCategoryId = (
  fromCategoryId,
  toCategoryId,
  client = prisma
) =>
  client.transaction.updateMany({
    where: { categoryId: fromCategoryId },
    data: { categoryId: toCategoryId },
  });

/**
 * Sum of amount for a user's transactions of one type (dashboard totals).
 */
const sumAmountByType = (userId, type, client = prisma) =>
  client.transaction.aggregate({
    where: { userId, type },
    _sum: { amount: true },
  });

/**
 * Sum of amount for a user's transactions of one type within a date
 * range (dashboard "this month" spending).
 */
const sumAmountByTypeInRange = (
  userId,
  type,
  { gte, lt },
  client = prisma
) =>
  client.transaction.aggregate({
    where: {
      userId,
      type,
      transactionDate: { gte, lt },
    },
    _sum: { amount: true },
  });

/**
 * Sum of amount per category for a user's transactions of one type
 * (dashboard category breakdown).
 */
const sumAmountGroupedByCategory = (userId, type, client = prisma) =>
  client.transaction.groupBy({
    by: ["categoryId"],
    where: { userId, type },
    _sum: { amount: true },
  });

/**
 * Count of a user's transactions grouped by type (dashboard stats).
 */
const countGroupedByType = (userId, client = prisma) =>
  client.transaction.groupBy({
    by: ["type"],
    where: { userId },
    _count: { transactionId: true },
  });

/**
 * Count a user's transactions within a date range (dashboard monthly stats).
 */
const countInRange = (userId, { gte, lt }, client = prisma) =>
  client.transaction.count({
    where: {
      userId,
      transactionDate: { gte, lt },
    },
  });

module.exports = {
  create,
  findManyWithCount,
  findOwnedById,
  update,
  deleteById,
  updateManyCategoryId,
  sumAmountByType,
  sumAmountByTypeInRange,
  sumAmountGroupedByCategory,
  countGroupedByType,
  countInRange,
};

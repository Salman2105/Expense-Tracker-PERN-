const prisma = require("../../config/prisma");

/**
 * Category repository — every Prisma call against the `Category` model
 * lives here. See user.repository.js for the `client` parameter
 * convention (defaults to the shared Prisma singleton; pass a
 * `$transaction` client to compose with other writes atomically).
 */

/**
 * Find a user's own custom category by name (case-insensitive) — used to
 * reject duplicate category names.
 */
const findByNameForUser = (userId, name, client = prisma) =>
  client.category.findFirst({
    where: {
      userId,
      name: {
        equals: name,
        mode: "insensitive",
      },
      isDefault: false,
    },
  });

/**
 * Same duplicate-name check, excluding a specific category — used when
 * renaming a category (it shouldn't collide with itself).
 */
const findByNameForUserExcluding = (
  userId,
  name,
  excludeCategoryId,
  client = prisma
) =>
  client.category.findFirst({
    where: {
      userId,
      isDefault: false,
      categoryId: {
        not: excludeCategoryId,
      },
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
  });

/**
 * Create a custom category for a user.
 */
const create = (data, client = prisma) =>
  client.category.create({
    data,
  });

/**
 * All categories visible to a user: global defaults plus their own.
 */
const findAllForUser = (userId, client = prisma) =>
  client.category.findMany({
    where: {
      OR: [
        { isDefault: true, userId: null },
        { isDefault: false, userId },
      ],
    },
    orderBy: {
      name: "asc",
    },
  });

/**
 * A user's own, non-default category — the minimal fields needed to
 * validate and apply an update.
 */
const findOwnedEditableById = (categoryId, userId, client = prisma) =>
  client.category.findFirst({
    where: {
      categoryId,
      userId,
      isDefault: false,
    },
    select: {
      categoryId: true,
      type: true,
    },
  });

/**
 * Apply an update to a category.
 */
const update = (categoryId, data, client = prisma) =>
  client.category.update({
    where: { categoryId },
    data,
  });

/**
 * A user's own, non-default category — full record, used before deletion.
 */
const findOwnedDeletableById = (categoryId, userId, client = prisma) =>
  client.category.findFirst({
    where: {
      categoryId,
      userId,
      isDefault: false,
    },
  });

/**
 * The shared "Uncategorized" fallback category that deleted transactions
 * get reassigned to.
 */
const findDefaultUncategorized = (client = prisma) =>
  client.category.findFirst({
    where: {
      name: "Uncategorized",
      isDefault: true,
      userId: null,
    },
  });

/**
 * Create the shared "Uncategorized" fallback category, matching the type
 * of whatever category is being deleted.
 */
const createDefaultUncategorized = (type, client = prisma) =>
  client.category.create({
    data: {
      name: "Uncategorized",
      icon: "Uncategorized",
      type,
      isDefault: true,
      userId: null,
    },
  });

/**
 * Delete a category.
 */
const deleteById = (categoryId, client = prisma) =>
  client.category.delete({
    where: { categoryId },
  });

/**
 * A category by ID, no ownership filter — the caller (transaction
 * creation/update) is responsible for authorizing access itself.
 */
const findById = (categoryId, client = prisma) =>
  client.category.findUnique({
    where: { categoryId },
  });

/**
 * A category by ID, restricted to ones the given user may use it (their
 * own custom category, or any global default) — used to validate a
 * `categoryId` filter on the transaction listing endpoint.
 */
const findAccessibleById = (categoryId, userId, client = prisma) =>
  client.category.findFirst({
    where: {
      categoryId,
      OR: [{ userId }, { isDefault: true, userId: null }],
    },
  });

module.exports = {
  findByNameForUser,
  findByNameForUserExcluding,
  create,
  findAllForUser,
  findOwnedEditableById,
  update,
  findOwnedDeletableById,
  findDefaultUncategorized,
  createDefaultUncategorized,
  deleteById,
  findById,
  findAccessibleById,
};

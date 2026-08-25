const prisma = require("../../config/prisma");
const { validate: isValidUuid } = require("uuid");
const { TRANSACTION_TYPES } = require("../constants");
const AppError = require("../utils/AppError");
const categoryRepository = require("../repositories/category.repository");
const transactionRepository = require("../repositories/transaction.repository");

// Category type shares the same INCOME/EXPENSE enum as transaction type.
const VALID_CATEGORY_TYPES = TRANSACTION_TYPES;

/**
 * Create Category
 */
const createCategory = async ({ userId, name, icon, type }) => {
  // Validate user UUID
  if (!isValidUuid(userId)) {
    throw new AppError("Invalid user ID", 400);
  }

  // Validate name
  if (typeof name !== "string" || !name.trim()) {
    throw new AppError("Category name is required", 400);
  }

  // Validate icon
  if (typeof icon !== "string" || !icon.trim()) {
    throw new AppError("Category icon is required", 400);
  }

  // Validate category type
  if (!VALID_CATEGORY_TYPES.includes(type)) {
    throw new AppError(
      "Invalid category type. Type must be INCOME or EXPENSE",
      400
    );
  }

  const trimmedName = name.trim();
  const trimmedIcon = icon.trim();

  // Check duplicate custom category
  const existingCategory = await categoryRepository.findByNameForUser(
    userId,
    trimmedName
  );

  if (existingCategory) {
    throw new AppError(
      "You already have a category with this name",
      409
    );
  }

  const category = await categoryRepository.create({
    userId,
    name: trimmedName,
    icon: trimmedIcon,
    type,
    isDefault: false,
  });

  return category;
};

/**
 * Get Categories
 * Returns:
 * - Global default categories
 * - Current user's custom categories
 */
const getCategories = async (userId) => {
  // Validate user UUID
  if (!isValidUuid(userId)) {
    throw new AppError("Invalid user ID", 400);
  }

  return categoryRepository.findAllForUser(userId);
};

/**
 * Update Category
 */
const updateCategory = async ({
  categoryId,
  userId,
  name,
  icon,
  type,
}) => {
  // Validate category UUID
  if (!isValidUuid(categoryId)) {
    throw new AppError("Invalid category ID", 400);
  }

  // Validate user UUID
  if (!isValidUuid(userId)) {
    throw new AppError("Invalid user ID", 400);
  }

  // Ensure at least one field is provided
  if (
    name === undefined &&
    icon === undefined &&
    type === undefined
  ) {
    throw new AppError(
      "At least one field is required to update the category",
      400
    );
  }

  // Validate name if provided
  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      throw new AppError("Category name cannot be empty", 400);
    }
  }

  // Validate icon if provided
  if (icon !== undefined) {
    if (typeof icon !== "string" || !icon.trim()) {
      throw new AppError("Category icon cannot be empty", 400);
    }
  }

  // Validate type if provided
  if (
    type !== undefined &&
    !VALID_CATEGORY_TYPES.includes(type)
  ) {
    throw new AppError(
      "Invalid category type. Type must be INCOME or EXPENSE",
      400
    );
  }

  // Find category and verify ownership
  const category = await categoryRepository.findOwnedEditableById(
    categoryId,
    userId
  );

  if (!category) {
    throw new AppError(
      "Category not found or cannot be modified",
      404
    );
  }

  const trimmedName =
    name !== undefined ? name.trim() : undefined;

  const trimmedIcon =
    icon !== undefined ? icon.trim() : undefined;

  // Check duplicate name when name is being changed
  if (trimmedName !== undefined) {
    const existingCategory =
      await categoryRepository.findByNameForUserExcluding(
        userId,
        trimmedName,
        categoryId
      );

    if (existingCategory) {
      throw new AppError(
        "You already have a category with this name",
        409
      );
    }
  }

  const updatedCategory = await categoryRepository.update(categoryId, {
    ...(trimmedName !== undefined && {
      name: trimmedName,
    }),

    ...(trimmedIcon !== undefined && {
      icon: trimmedIcon,
    }),

    ...(type !== undefined && {
      type,
    }),
  });

  return updatedCategory;
};

/**
 * Delete Category
 */
const deleteCategory = async ({ categoryId, userId }) => {
  // Validate category UUID
  if (!isValidUuid(categoryId)) {
    throw new AppError("Invalid category ID", 400);
  }

  // Validate user UUID
  if (!isValidUuid(userId)) {
    throw new AppError("Invalid user ID", 400);
  }

  // Verify ownership and prevent deleting default categories
  const category = await categoryRepository.findOwnedDeletableById(
    categoryId,
    userId
  );

  if (!category) {
    throw new AppError(
      "Category not found or cannot be deleted",
      404
    );
  }

  // Reassign transactions and delete category atomically
  await prisma.$transaction(async (tx) => {
    let uncategorizedCategory =
      await categoryRepository.findDefaultUncategorized(tx);

    if (!uncategorizedCategory) {
      uncategorizedCategory =
        await categoryRepository.createDefaultUncategorized(
          category.type,
          tx
        );
    }

    await transactionRepository.updateManyCategoryId(
      categoryId,
      uncategorizedCategory.categoryId,
      tx
    );

    await categoryRepository.deleteById(categoryId, tx);
  });

  return {
    message: "Category deleted successfully",
  };
};

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
};

const prisma = require("../../config/prisma");
const { validate: isValidUuid } = require("uuid");
const { TRANSACTION_TYPES } = require("../constants");
const AppError = require("../utils/AppError");

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
  const existingCategory = await prisma.category.findFirst({
    where: {
      userId,
      name: {
        equals: trimmedName,
        mode: "insensitive",
      },
      isDefault: false,
    },
  });

  if (existingCategory) {
    throw new AppError(
      "You already have a category with this name",
      409
    );
  }

  const category = await prisma.category.create({
    data: {
      userId,
      name: trimmedName,
      icon: trimmedIcon,
      type,
      isDefault: false,
    },
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

  const categories = await prisma.category.findMany({
    where: {
      OR: [
        {
          isDefault: true,
          userId: null,
        },
        {
          isDefault: false,
          userId,
        },
      ],
    },
    orderBy: {
      name: "asc",
    },
  });

  return categories;
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
  const category = await prisma.category.findFirst({
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
    const existingCategory = await prisma.category.findFirst({
      where: {
        userId,
        isDefault: false,
        categoryId: {
          not: categoryId,
        },
        name: {
          equals: trimmedName,
          mode: "insensitive",
        },
      },
    });

    if (existingCategory) {
      throw new AppError(
        "You already have a category with this name",
        409
      );
    }
  }

  const updatedCategory = await prisma.category.update({
    where: {
      categoryId,
    },
    data: {
      ...(trimmedName !== undefined && {
        name: trimmedName,
      }),

      ...(trimmedIcon !== undefined && {
        icon: trimmedIcon,
      }),

      ...(type !== undefined && {
        type,
      }),
    },
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
  const category = await prisma.category.findFirst({
    where: {
      categoryId,
      userId,
      isDefault: false,
    },
  });

  if (!category) {
    throw new AppError(
      "Category not found or cannot be deleted",
      404
    );
  }

  // Reassign transactions and delete category atomically
  await prisma.$transaction(async (tx) => {
    let uncategorizedCategory = await tx.category.findFirst({
      where: {
        name: "Uncategorized",
        isDefault: true,
        userId: null,
      },
    });

    if (!uncategorizedCategory) {
      uncategorizedCategory = await tx.category.create({
        data: {
          name: "Uncategorized",
          icon: "Uncategorized",
          type: category.type,
          isDefault: true,
          userId: null,
        },
      });
    }

    await tx.transaction.updateMany({
      where: {
        categoryId,
      },
      data: {
        categoryId: uncategorizedCategory.categoryId,
      },
    });

    await tx.category.delete({
      where: {
        categoryId,
      },
    });
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

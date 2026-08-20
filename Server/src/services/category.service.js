const prisma = require("../../config/prisma");
const { validate: isValidUuid } = require("uuid");

// Allowed category types
const VALID_CATEGORY_TYPES = ["INCOME", "EXPENSE"];

/**
 * Create Category
 */
const createCategory = async ({ userId, name, icon, type }) => {
  // Validate user UUID
  if (!isValidUuid(userId)) {
    const error = new Error("Invalid user ID");
    error.statusCode = 400;
    throw error;
  }

  // Validate name
  if (typeof name !== "string" || !name.trim()) {
    const error = new Error("Category name is required");
    error.statusCode = 400;
    throw error;
  }

  // Validate icon
  if (typeof icon !== "string" || !icon.trim()) {
    const error = new Error("Category icon is required");
    error.statusCode = 400;
    throw error;
  }

  // Validate category type
  if (!VALID_CATEGORY_TYPES.includes(type)) {
    const error = new Error(
      "Invalid category type. Type must be INCOME or EXPENSE"
    );
    error.statusCode = 400;
    throw error;
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
    const error = new Error(
      "You already have a category with this name"
    );
    error.statusCode = 409;
    throw error;
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
    const error = new Error("Invalid user ID");
    error.statusCode = 400;
    throw error;
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
    const error = new Error("Invalid category ID");
    error.statusCode = 400;
    throw error;
  }

  // Validate user UUID
  if (!isValidUuid(userId)) {
    const error = new Error("Invalid user ID");
    error.statusCode = 400;
    throw error;
  }

  // Ensure at least one field is provided
  if (
    name === undefined &&
    icon === undefined &&
    type === undefined
  ) {
    const error = new Error(
      "At least one field is required to update the category"
    );
    error.statusCode = 400;
    throw error;
  }

  // Validate name if provided
  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      const error = new Error("Category name cannot be empty");
      error.statusCode = 400;
      throw error;
    }
  }

  // Validate icon if provided
  if (icon !== undefined) {
    if (typeof icon !== "string" || !icon.trim()) {
      const error = new Error("Category icon cannot be empty");
      error.statusCode = 400;
      throw error;
    }
  }

  // Validate type if provided
  if (
    type !== undefined &&
    !VALID_CATEGORY_TYPES.includes(type)
  ) {
    const error = new Error(
      "Invalid category type. Type must be INCOME or EXPENSE"
    );
    error.statusCode = 400;
    throw error;
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
    const error = new Error(
      "Category not found or cannot be modified"
    );
    error.statusCode = 404;
    throw error;
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
      const error = new Error(
        "You already have a category with this name"
      );
      error.statusCode = 409;
      throw error;
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
    const error = new Error("Invalid category ID");
    error.statusCode = 400;
    throw error;
  }

  // Validate user UUID
  if (!isValidUuid(userId)) {
    const error = new Error("Invalid user ID");
    error.statusCode = 400;
    throw error;
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
    const error = new Error(
      "Category not found or cannot be deleted"
    );
    error.statusCode = 404;
    throw error;
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
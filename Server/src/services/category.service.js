const prisma = require("../../config/prisma");

const createCategory = async ({ userId, name, icon, type }) => {
  const existingCategory = await prisma.category.findFirst({
    where: {
      userId,
      name: {
        equals: name.trim(),
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
      name: name.trim(),
      icon: icon.trim(),
      type,
      isDefault: false,
    },
  });

  return category;
};

const getCategories = async (userId) => {
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

const updateCategory = async ({
  categoryId,
  userId,
  name,
  icon,
  type,
}) => {
  const category = await prisma.category.findFirst({
    where: {
      categoryId,
      userId,
      isDefault: false,
    },
  });

  if (!category) {
    const error = new Error("Category not found or cannot be modified");
    error.statusCode = 404;
    throw error;
  }

  const updatedCategory = await prisma.category.update({
    where: {
      categoryId,
    },
    data: {
      ...(name !== undefined && { name }),
      ...(icon !== undefined && { icon }),
      ...(type !== undefined && { type }),
    },
  });

  return updatedCategory;
};

const deleteCategory = async ({ categoryId, userId }) => {
  const category = await prisma.category.findFirst({
    where: {
      categoryId,
      userId,
      isDefault: false,
    },
  });

  if (!category) {
    const error = new Error("Category not found or cannot be deleted");
    error.statusCode = 404;
    throw error;
  }

  const uncategorizedCategory = await prisma.category.findFirst({
    where: {
      name: "Uncategorized",
      isDefault: true,
      userId: null,
    },
  });

  if (!uncategorizedCategory) {
    const error = new Error("Uncategorized category not found");
    error.statusCode = 500;
    throw error;
  }

  await prisma.$transaction(async (tx) => {
    await tx.transaction.updateMany({
      where: {
        categoryId: categoryId,
      },
      data: {
        categoryId: uncategorizedCategory.categoryId,
      },
    });

    await tx.category.delete({
      where: {
        categoryId: categoryId,
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
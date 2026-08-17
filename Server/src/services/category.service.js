const prisma = require("../../config/prisma");

const createCategory = async ({ userId, name, icon, type }) => {
  const category = await prisma.category.create({
    data: {
      userId,
      name,
      icon,
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

  await prisma.category.delete({
    where: {
      categoryId,
    },
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
const categoryService = require("../services/category.service");

const createCategory = async (req, res, next) => {
  try {
    const { name, icon, type } = req.body;

    const category = await categoryService.createCategory({
      userId: req.user.id,
      name,
      icon,
      type,
    });

    return res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getCategories(
      req.user.id
    );

    return res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const { name, icon, type } = req.body;

    const category = await categoryService.updateCategory({
      categoryId,
      userId: req.user.id,
      name,
      icon,
      type,
    });

    return res.status(200).json(category);
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;

    const result = await categoryService.deleteCategory({
      categoryId,
      userId: req.user.id,
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
};
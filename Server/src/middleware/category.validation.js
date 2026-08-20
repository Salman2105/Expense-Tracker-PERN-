const { validate: isValidUuid } = require("uuid");

const VALID_CATEGORY_TYPES = ["INCOME", "EXPENSE"];

const validateCreateCategory = (req, res, next) => {
  const { name, icon, type } = req.body;

  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({
      message: "Category name is required",
    });
  }

  if (typeof icon !== "string" || !icon.trim()) {
    return res.status(400).json({
      message: "Category icon is required",
    });
  }

  if (!VALID_CATEGORY_TYPES.includes(type)) {
    return res.status(400).json({
      message: "Category type must be INCOME or EXPENSE",
    });
  }

  next();
};

const validateUpdateCategory = (req, res, next) => {
  const { name, icon, type } = req.body;

  if (
    name === undefined &&
    icon === undefined &&
    type === undefined
  ) {
    return res.status(400).json({
      message: "At least one field is required for update",
    });
  }

  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        message: "Category name must be a valid string",
      });
    }
  }

  if (icon !== undefined) {
    if (typeof icon !== "string" || !icon.trim()) {
      return res.status(400).json({
        message: "Category icon must be a valid string",
      });
    }
  }

  if (
    type !== undefined &&
    !VALID_CATEGORY_TYPES.includes(type)
  ) {
    return res.status(400).json({
      message: "Category type must be INCOME or EXPENSE",
    });
  }

  next();
};

const validateCategoryId = (req, res, next) => {
  const { categoryId } = req.params;

  if (!isValidUuid(categoryId)) {
    return res.status(400).json({
      message: "Invalid category ID",
    });
  }

  next();
};

module.exports = {
  validateCreateCategory,
  validateUpdateCategory,
  validateCategoryId,
};
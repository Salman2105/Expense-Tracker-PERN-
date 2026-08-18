const validateCreateCategory = (req, res, next) => {
  const { name, icon, type } = req.body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({
      message: "Category name is required",
    });
  }

  if (!icon || typeof icon !== "string" || !icon.trim()) {
    return res.status(400).json({
      message: "Category icon is required",
    });
  }

  if (!type || !["INCOME", "EXPENSE"].includes(type)) {
    return res.status(400).json({
      message: "Category type must be INCOME or EXPENSE",
    });
  }

  next();
};

const validateUpdateCategory = (req, res, next) => {
  const { name, icon, type } = req.body;

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

  if (type !== undefined) {
    if (!["INCOME", "EXPENSE"].includes(type)) {
      return res.status(400).json({
        message: "Category type must be INCOME or EXPENSE",
      });
    }
  }

  if (
    name === undefined &&
    icon === undefined &&
    type === undefined
  ) {
    return res.status(400).json({
      message: "At least one field is required for update",
    });
  }

  next();
};
const validateCategoryId = (req, res, next) => {
  const { categoryId } = req.params;

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(categoryId)) {
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
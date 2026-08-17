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

module.exports = {
  validateCreateCategory,
  validateUpdateCategory,
};
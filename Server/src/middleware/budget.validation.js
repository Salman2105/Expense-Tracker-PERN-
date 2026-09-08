const { validate: isValidUuid } = require("uuid");

const validateCreateBudget = (req, res, next) => {
  const { categoryId, amount, startDate } = req.body || {};
  if (!categoryId || !isValidUuid(categoryId)) {
    return res.status(400).json({ success: false, message: "A valid category ID is required" });
  }

  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ success: false, message: "Budget amount must be greater than 0" });
  }

  if (startDate !== undefined && Number.isNaN(new Date(startDate).getTime())) {
    return res.status(400).json({ success: false, message: "Invalid budget start date" });
  }

  next();
};

const validateBudgetAmountUpdate = (req, res, next) => {
  const fields = Object.keys(req.body || {});
  if (fields.length !== 1 || req.body.amount === undefined) {
    return res.status(400).json({ success: false, message: "Only the budget amount can be updated" });
  }

  const parsedAmount = Number(req.body.amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ success: false, message: "Budget amount must be greater than 0" });
  }

  next();
};

module.exports = {
  validateCreateBudget,
  validateBudgetAmountUpdate,
};

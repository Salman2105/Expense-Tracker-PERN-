const { validate: isValidUuid } = require("uuid");
const AppError = require("../utils/AppError");
const categoryRepository = require("../repositories/category.repository");
const budgetRepository = require("../repositories/budget.repository");

const validateUserId = (userId) => {
  if (!userId || !isValidUuid(userId)) {
    throw new AppError("Invalid user ID", 400);
  }
};

const getMonthBounds = (value = new Date()) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new AppError("Invalid budget start date", 400);
  }

  const startDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  const endDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));
  return { startDate, endDate };
};

const validateAmount = (amount) => {
  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    throw new AppError("Budget amount must be greater than 0", 400);
  }
  return parsedAmount;
};

const validateExpenseCategory = async (userId, categoryId) => {
  if (!isValidUuid(categoryId)) {
    throw new AppError("Invalid category ID", 400);
  }

  const category = await categoryRepository.findAccessibleById(categoryId, userId);
  if (!category || category.type !== "EXPENSE") {
    throw new AppError("Budget category must be an accessible expense category", 400);
  }
  return category;
};

const createBudget = async (userId, data = {}) => {
  validateUserId(userId);
  const category = await validateExpenseCategory(userId, data.categoryId);
  const amount = validateAmount(data.amount);
  const { startDate, endDate } = getMonthBounds(data.startDate);

  try {
    return await budgetRepository.create({
      userId,
      categoryId: category.categoryId,
      amount,
      period: "MONTHLY",
      startDate,
      endDate,
    });
  } catch (error) {
    if (error?.code === "P2002") {
      throw new AppError("A budget already exists for this category and month", 409);
    }
    throw error;
  }
};

const getBudgets = async (userId) => {
  validateUserId(userId);
  return budgetRepository.findManyForUser(userId);
};

const updateBudget = async (userId, budgetId, data = {}) => {
  validateUserId(userId);
  if (!isValidUuid(budgetId)) throw new AppError("Invalid budget ID", 400);
  if (Object.keys(data).length !== 1 || data.amount === undefined) {
    throw new AppError("Only the budget amount can be updated", 400);
  }

  const budget = await budgetRepository.findOwnedById(budgetId, userId);
  if (!budget) throw new AppError("Budget not found", 404);

  await budgetRepository.update(budgetId, userId, { amount: validateAmount(data.amount) });
  return budgetRepository.findOwnedById(budgetId, userId);
};

const deleteBudget = async (userId, budgetId) => {
  validateUserId(userId);
  if (!isValidUuid(budgetId)) throw new AppError("Invalid budget ID", 400);
  const result = await budgetRepository.deleteById(budgetId, userId);
  if (result.count === 0) throw new AppError("Budget not found", 404);
  return { message: "Budget deleted successfully" };
};

module.exports = {
  createBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
};

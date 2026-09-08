const budgetService = require("../services/budget.service");
const { successResponse, errorResponse } = require("../utils/response.util");

const getUserId = (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    errorResponse(res, 401, "Authentication required", "AUTHENTICATION_REQUIRED");
    return null;
  }
  return userId;
};

const getBudgets = async (req, res, next) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;
    return successResponse(res, 200, "Budgets retrieved successfully", await budgetService.getBudgets(userId));
  } catch (error) {
    next(error);
  }
};

const createBudget = async (req, res, next) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;
    return successResponse(res, 201, "Budget created successfully", await budgetService.createBudget(userId, req.body));
  } catch (error) {
    next(error);
  }
};

const updateBudget = async (req, res, next) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;
    return successResponse(res, 200, "Budget updated successfully", await budgetService.updateBudget(userId, req.params.budgetId, req.body));
  } catch (error) {
    next(error);
  }
};

const deleteBudget = async (req, res, next) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;
    return successResponse(res, 200, "Budget deleted successfully", await budgetService.deleteBudget(userId, req.params.budgetId));
  } catch (error) {
    next(error);
  }
};

module.exports = { getBudgets, createBudget, updateBudget, deleteBudget };

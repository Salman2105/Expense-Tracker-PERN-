const userSettingsRepository = require("../repositories/userSettings.repository");
const userRepository = require("../repositories/user.repository");
const budgetRepository = require("../repositories/budget.repository");
const emailService = require("./email.service");
const logger = require("../utils/logger");

const ALERT_THRESHOLDS = [80, 100];

const evaluateAfterTransaction = async (transaction) => {
  if (!transaction || transaction.type !== "EXPENSE") return;

  try {
    const settings = await userSettingsRepository.findByUserId(transaction.userId);
    if (!settings?.budgetAlerts) return;

    const user = await userRepository.findAuthContextById(transaction.userId);
    if (!user?.email) return;

    const budgets = await budgetRepository.findActiveForTransaction(transaction);
    await Promise.all(budgets.map((budget) => evaluateBudget(budget, user.email)));
  } catch (error) {
    logger.error("Budget alert evaluation failed", {
      userId: transaction.userId,
      transactionId: transaction.transactionId,
      error: error.message,
    });
  }
};

const evaluateBudget = async (budget, email) => {
  const aggregate = await budgetRepository.sumExpenseForBudget(budget);
  const spent = Number(aggregate._sum.amount || 0);
  const limit = Number(budget.amount);

  for (const threshold of ALERT_THRESHOLDS) {
    if (spent < limit * (threshold / 100)) continue;

    let alert;
    try {
      alert = await budgetRepository.claimAlert({
        budgetId: budget.budgetId,
        threshold,
        periodStart: budget.startDate,
      });
    } catch (error) {
      if (error?.code === "P2002") continue;
      throw error;
    }

    try {
      await emailService.sendBudgetAlert({
        to: email,
        categoryName: budget.category.name,
        threshold,
        spent: spent.toFixed(2),
        limit: limit.toFixed(2),
      });
      await budgetRepository.markAlertSent(alert.alertId);
    } catch (error) {
      await budgetRepository.releaseAlert(
        budget.budgetId,
        threshold,
        budget.startDate
      );
      throw error;
    }
  }
};

module.exports = {
  evaluateAfterTransaction,
};

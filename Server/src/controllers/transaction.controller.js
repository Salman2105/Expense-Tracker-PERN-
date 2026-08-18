const transactionService = require("../services/transaction.service");

const createTransaction = async (req, res, next) => {
    try {
        const userId = req.user?.userId ?? req.user?.id;

        const transaction = await transactionService.createTransaction(
            userId,
            req.body
        );

        return res.status(201).json({
            message: "Transaction created successfully",
            transaction,
        });
    } catch (error) {
        next(error);
    }
};
const getUserTransactions = async (req, res) => {
  try {
    const result = await transactionService.getUserTransactions(
      req.user.userId,
      req.query
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get transactions error:", error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to fetch transactions",
    });
  }
};
const getTransactionById = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { transactionId } = req.params;

        const transaction =
            await transactionService.getTransactionById(
                userId,
                transactionId
            );

        return res.status(200).json({
            transaction,
        });
    } catch (error) {
        next(error);
    }
};
const updateTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await transactionService.updateTransaction(
      req.user.userId,
      transactionId,
      req.body
    );

    return res.status(200).json({
      message: "Transaction updated successfully",
      transaction,
    });
  } catch (error) {
    console.error("Update transaction error:", error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to update transaction",
    });
  }
};
const deleteTransaction = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { transactionId } = req.params;

        await transactionService.deleteTransaction(
            userId,
            transactionId
        );

        return res.status(200).json({
            message: "Transaction deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createTransaction,
    getUserTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
};
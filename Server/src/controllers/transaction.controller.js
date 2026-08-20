const transactionService = require("../services/transaction.service");

const {
    successResponse,
} = require("../utils/response.util");

/**
 * Get authenticated user ID
 */
const getUserId = (req) => {
    return req.user?.id ?? req.user?.userId;
};

/**
 * Create Transaction
 */
const createTransaction = async (req, res, next) => {
    try {
        const userId = getUserId(req);

        const transaction =
            await transactionService.createTransaction(
                userId,
                req.body
            );

        return successResponse(
            res,
            201,
            "Transaction created successfully",
            transaction
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Get User Transactions
 */
const getUserTransactions = async (req, res, next) => {
    try {
        const userId = getUserId(req);

        const result =
            await transactionService.getUserTransactions(
                userId,
                req.query
            );

        return successResponse(
            res,
            200,
            "Transactions retrieved successfully",
            result
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Get Transaction By ID
 */
const getTransactionById = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const { transactionId } = req.params;

        const transaction =
            await transactionService.getTransactionById(
                userId,
                transactionId
            );

        return successResponse(
            res,
            200,
            "Transaction retrieved successfully",
            transaction
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Update Transaction
 */
const updateTransaction = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const { transactionId } = req.params;

        const transaction =
            await transactionService.updateTransaction(
                userId,
                transactionId,
                req.body
            );

        return successResponse(
            res,
            200,
            "Transaction updated successfully",
            transaction
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Delete Transaction
 */
const deleteTransaction = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const { transactionId } = req.params;

        const result =
            await transactionService.deleteTransaction(
                userId,
                transactionId
            );

        return successResponse(
            res,
            200,
            "Transaction deleted successfully",
            result
        );
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
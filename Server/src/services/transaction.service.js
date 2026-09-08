const { validate: isValidUuid } = require("uuid");
const { TRANSACTION_TYPES, MAX_PAGE_SIZE } = require("../constants");
const AppError = require("../utils/AppError");
const categoryRepository = require("../repositories/category.repository");
const transactionRepository = require("../repositories/transaction.repository");
const budgetAlertService = require("./budgetAlert.service");

const VALID_TRANSACTION_TYPES = TRANSACTION_TYPES;

/**
 * Validate authenticated user ID
 */
const validateUserId = (userId) => {
  if (!isValidUuid(userId)) {
    throw new AppError("Invalid user ID", 400);
  }
};

/**
 * Fetch a category by ID and confirm the given user is allowed to use it
 * (global/default categories are usable by anyone; custom categories only
 * by their owner). Used by both createTransaction and updateTransaction,
 * which each need to resolve the category a transaction will end up in.
 */
const resolveAndAuthorizeCategory = async (categoryId, userId) => {
  const category = await categoryRepository.findById(categoryId);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  // Global/default categories are available to all users
  const isGlobalCategory =
    category.isDefault === true &&
    category.userId === null;

  // Custom category must belong to current user
  if (
    !isGlobalCategory &&
    category.userId !== userId
  ) {
    throw new AppError("You do not have access to this category", 403);
  }

  return category;
};

/**
 * Create Transaction
 */
const createTransaction = async (userId, data = {}) => {
  validateUserId(userId);

  const {
    categoryId,
    type,
    amount,
    title,
    note,
    transactionDate,
  } = data;

  // Validate category UUID
  if (!isValidUuid(categoryId)) {
    throw new AppError("Invalid category ID", 400);
  }

  // Validate transaction type
  if (!VALID_TRANSACTION_TYPES.includes(type)) {
    throw new AppError(
      "Invalid transaction type. Type must be INCOME or EXPENSE",
      400
    );
  }

  // Validate amount
  const parsedAmount = Number(amount);

  if (
    amount === undefined ||
    amount === null ||
    !Number.isFinite(parsedAmount) ||
    parsedAmount <= 0
  ) {
    throw new AppError("Amount must be greater than 0", 400);
  }

  // Validate title
  if (
    typeof title !== "string" ||
    !title.trim()
  ) {
    throw new AppError("Transaction title is required", 400);
  }

  // Validate note
  if (
    note !== undefined &&
    note !== null &&
    typeof note !== "string"
  ) {
    throw new AppError("Note must be a string", 400);
  }

  // Validate transaction date
  let parsedTransactionDate;

  if (transactionDate !== undefined) {
    parsedTransactionDate = new Date(transactionDate);

    if (Number.isNaN(parsedTransactionDate.getTime())) {
      throw new AppError("Invalid transaction date", 400);
    }
  }

  const category = await resolveAndAuthorizeCategory(categoryId, userId);

  // Transaction type must match category type
  if (category.type !== type) {
    throw new AppError("Transaction type must match category type", 400);
  }

  // Create transaction
  const transaction = await transactionRepository.create({
    userId,
    categoryId,
    type,
    amount: parsedAmount,
    title: title.trim(),
    note: note?.trim() || null,

    ...(parsedTransactionDate !== undefined && {
      transactionDate: parsedTransactionDate,
    }),
  });

  void budgetAlertService.evaluateAfterTransaction(transaction);

  return transaction;
};

/**
 * Get User Transactions
 */
const getUserTransactions = async (
  userId,
  filters = {}
) => {
  validateUserId(userId);

  const {
    page = 1,
    limit = 10,
    type,
    categoryId,
    startDate,
    endDate,
  } = filters;

  // Validate pagination
  const parsedPage = Number(page);
  const parsedLimit = Number(limit);

  if (
    !Number.isInteger(parsedPage) ||
    parsedPage < 1
  ) {
    throw new AppError("Page must be a positive integer", 400);
  }

  if (
    !Number.isInteger(parsedLimit) ||
    parsedLimit < 1
  ) {
    throw new AppError("Limit must be a positive integer", 400);
  }

  const pageNumber = parsedPage;
  const limitNumber = Math.min(parsedLimit, MAX_PAGE_SIZE);

  const skip = (pageNumber - 1) * limitNumber;

  // Always restrict transactions to authenticated user
  const where = {
    userId,
  };

  // Filter by transaction type
  if (type !== undefined) {
    if (!VALID_TRANSACTION_TYPES.includes(type)) {
      throw new AppError(
        "Transaction type must be either INCOME or EXPENSE",
        400
      );
    }

    where.type = type;
  }

  // Filter by category
  if (categoryId !== undefined) {
    if (!isValidUuid(categoryId)) {
      throw new AppError("Invalid category ID", 400);
    }

    // Make sure requested category is accessible
    const category = await categoryRepository.findAccessibleById(
      categoryId,
      userId
    );

    if (!category) {
      throw new AppError("Invalid category", 400);
    }

    where.categoryId = categoryId;
  }

  // Filter by date range
  if (startDate !== undefined || endDate !== undefined) {
    where.transactionDate = {};

    if (startDate !== undefined) {
      const start = new Date(startDate);

      if (Number.isNaN(start.getTime())) {
        throw new AppError("Invalid start date", 400);
      }

      start.setHours(0, 0, 0, 0);

      where.transactionDate.gte = start;
    }

    if (endDate !== undefined) {
      const end = new Date(endDate);

      if (Number.isNaN(end.getTime())) {
        throw new AppError("Invalid end date", 400);
      }

      end.setHours(23, 59, 59, 999);

      where.transactionDate.lte = end;
    }

    // Prevent invalid date range
    if (
      where.transactionDate.gte &&
      where.transactionDate.lte &&
      where.transactionDate.gte >
        where.transactionDate.lte
    ) {
      throw new AppError(
        "Start date cannot be greater than end date",
        400
      );
    }
  }

  const [transactions, total] =
    await transactionRepository.findManyWithCount(where, {
      skip,
      take: limitNumber,
      orderBy: {
        transactionDate: "desc",
      },
    });

  return {
    transactions,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(
        total / limitNumber
      ),
    },
  };
};

/**
 * Get Transaction By ID
 */
const getTransactionById = async (
  userId,
  transactionId
) => {
  validateUserId(userId);

  if (!isValidUuid(transactionId)) {
    throw new AppError("Invalid transaction ID", 400);
  }

  const transaction = await transactionRepository.findOwnedById(
    transactionId,
    userId
  );

  if (!transaction) {
    throw new AppError("Transaction not found", 404);
  }

  return transaction;
};

/**
 * Update Transaction
 */
const updateTransaction = async (
  userId,
  transactionId,
  data = {}
) => {
  validateUserId(userId);

  // Validate transaction UUID
  if (!isValidUuid(transactionId)) {
    throw new AppError("Invalid transaction ID", 400);
  }

  // Find existing transaction and verify ownership
  const existingTransaction = await transactionRepository.findOwnedById(
    transactionId,
    userId
  );

  if (!existingTransaction) {
    throw new AppError("Transaction not found", 404);
  }

  // Allowlisted update object
  const updateData = {};

  // Amount
  if (data.amount !== undefined) {
    const amount = Number(data.amount);

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      throw new AppError("Amount must be greater than 0", 400);
    }

    updateData.amount = amount;
  }

  // Title
  if (data.title !== undefined) {
    if (
      typeof data.title !== "string" ||
      !data.title.trim()
    ) {
      throw new AppError("Title cannot be empty", 400);
    }

    updateData.title = data.title.trim();
  }

  // Note
  if (data.note !== undefined) {
    if (
      data.note !== null &&
      typeof data.note !== "string"
    ) {
      throw new AppError("Note must be a string", 400);
    }

    updateData.note =
      data.note?.trim() || null;
  }

  // Type
  if (data.type !== undefined) {
    if (
      !VALID_TRANSACTION_TYPES.includes(
        data.type
      )
    ) {
      throw new AppError(
        "Transaction type must be either INCOME or EXPENSE",
        400
      );
    }

    updateData.type = data.type;
  }

  // Transaction date
  if (data.transactionDate !== undefined) {
    const parsedDate =
      new Date(data.transactionDate);

    if (Number.isNaN(parsedDate.getTime())) {
      throw new AppError("Invalid transaction date", 400);
    }

    updateData.transactionDate = parsedDate;
  }

  // Category
  if (data.categoryId !== undefined) {
    if (!isValidUuid(data.categoryId)) {
      throw new AppError("Invalid category ID", 400);
    }

    updateData.categoryId = data.categoryId;
  }

  // Re-resolve whichever category the transaction will end up with
  // (whether or not it's being changed by this update) so its type stays
  // consistent with the transaction's final type.
  const finalType =
    data.type ?? existingTransaction.type;

  const finalCategoryId =
    data.categoryId ??
    existingTransaction.categoryId;

  const selectedCategory = await resolveAndAuthorizeCategory(
    finalCategoryId,
    userId
  );

  // Transaction type must match category type
  if (
    selectedCategory.type !== finalType
  ) {
    throw new AppError("Transaction type must match category type", 400);
  }

  // At least one valid field required
  if (
    Object.keys(updateData).length === 0
  ) {
    throw new AppError("No valid fields provided for update", 400);
  }

  // Update transaction
  const transaction = await transactionRepository.update(transactionId, updateData);
  void budgetAlertService.evaluateAfterTransaction(transaction);
  return transaction;
};

/**
 * Delete Transaction
 */
const deleteTransaction = async (
  userId,
  transactionId
) => {
  validateUserId(userId);

  // Validate transaction UUID
  if (!isValidUuid(transactionId)) {
    throw new AppError("Invalid transaction ID", 400);
  }

  // Verify ownership
  const transaction = await transactionRepository.findOwnedById(
    transactionId,
    userId
  );

  if (!transaction) {
    throw new AppError("Transaction not found", 404);
  }

  // Delete only user's transaction
  await transactionRepository.deleteById(transactionId);

  void budgetAlertService.evaluateAfterTransaction(transaction);

  return {
    message:
      "Transaction deleted successfully",
  };
};

module.exports = {
  createTransaction,
  getUserTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
};

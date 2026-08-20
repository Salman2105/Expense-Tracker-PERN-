const prisma = require("../../config/prisma");

const VALID_TRANSACTION_TYPES = ["INCOME", "EXPENSE"];

/**
 * UUID validation
 */
const isValidUuid = (value) => {
  if (typeof value !== "string") {
    return false;
  }

  const trimmed = value.trim();

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    trimmed
  );
};

/**
 * Validate authenticated user ID
 */
const validateUserId = (userId) => {
  if (!isValidUuid(userId)) {
    const error = new Error("Invalid user ID");
    error.statusCode = 400;
    throw error;
  }
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
    const error = new Error("Invalid category ID");
    error.statusCode = 400;
    throw error;
  }

  // Validate transaction type
  if (!VALID_TRANSACTION_TYPES.includes(type)) {
    const error = new Error(
      "Invalid transaction type. Type must be INCOME or EXPENSE"
    );
    error.statusCode = 400;
    throw error;
  }

  // Validate amount
  const parsedAmount = Number(amount);

  if (
    amount === undefined ||
    amount === null ||
    !Number.isFinite(parsedAmount) ||
    parsedAmount <= 0
  ) {
    const error = new Error("Amount must be greater than 0");
    error.statusCode = 400;
    throw error;
  }

  // Validate title
  if (
    typeof title !== "string" ||
    !title.trim()
  ) {
    const error = new Error("Transaction title is required");
    error.statusCode = 400;
    throw error;
  }

  // Validate note
  if (
    note !== undefined &&
    note !== null &&
    typeof note !== "string"
  ) {
    const error = new Error("Note must be a string");
    error.statusCode = 400;
    throw error;
  }

  // Validate transaction date
  let parsedTransactionDate;

  if (transactionDate !== undefined) {
    parsedTransactionDate = new Date(transactionDate);

    if (Number.isNaN(parsedTransactionDate.getTime())) {
      const error = new Error("Invalid transaction date");
      error.statusCode = 400;
      throw error;
    }
  }

  // Find category
  const category = await prisma.category.findUnique({
    where: {
      categoryId,
    },
  });

  // Category does not exist
  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
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
    const error = new Error(
      "You do not have access to this category"
    );
    error.statusCode = 403;
    throw error;
  }

  // Transaction type must match category type
  if (category.type !== type) {
    const error = new Error(
      "Transaction type must match category type"
    );
    error.statusCode = 400;
    throw error;
  }

  // Create transaction
  const transaction = await prisma.transaction.create({
    data: {
      userId,
      categoryId,
      type,
      amount: parsedAmount,
      title: title.trim(),
      note: note?.trim() || null,

      ...(parsedTransactionDate !== undefined && {
        transactionDate: parsedTransactionDate,
      }),
    },
  });

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
    const error = new Error(
      "Page must be a positive integer"
    );
    error.statusCode = 400;
    throw error;
  }

  if (
    !Number.isInteger(parsedLimit) ||
    parsedLimit < 1
  ) {
    const error = new Error(
      "Limit must be a positive integer"
    );
    error.statusCode = 400;
    throw error;
  }

  const pageNumber = parsedPage;
  const limitNumber = Math.min(parsedLimit, 100);

  const skip = (pageNumber - 1) * limitNumber;

  // Always restrict transactions to authenticated user
  const where = {
    userId,
  };

  // Filter by transaction type
  if (type !== undefined) {
    if (!VALID_TRANSACTION_TYPES.includes(type)) {
      const error = new Error(
        "Transaction type must be either INCOME or EXPENSE"
      );
      error.statusCode = 400;
      throw error;
    }

    where.type = type;
  }

  // Filter by category
  if (categoryId !== undefined) {
    if (!isValidUuid(categoryId)) {
      const error = new Error("Invalid category ID");
      error.statusCode = 400;
      throw error;
    }

    // Make sure requested category is accessible
    const category = await prisma.category.findFirst({
      where: {
        categoryId,
        OR: [
          {
            userId,
          },
          {
            isDefault: true,
            userId: null,
          },
        ],
      },
    });

    if (!category) {
      const error = new Error("Invalid category");
      error.statusCode = 400;
      throw error;
    }

    where.categoryId = categoryId;
  }

  // Filter by date range
  if (startDate !== undefined || endDate !== undefined) {
    where.transactionDate = {};

    if (startDate !== undefined) {
      const start = new Date(startDate);

      if (Number.isNaN(start.getTime())) {
        const error = new Error("Invalid start date");
        error.statusCode = 400;
        throw error;
      }

      start.setHours(0, 0, 0, 0);

      where.transactionDate.gte = start;
    }

    if (endDate !== undefined) {
      const end = new Date(endDate);

      if (Number.isNaN(end.getTime())) {
        const error = new Error("Invalid end date");
        error.statusCode = 400;
        throw error;
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
      const error = new Error(
        "Start date cannot be greater than end date"
      );
      error.statusCode = 400;
      throw error;
    }
  }

  const [transactions, total] =
    await prisma.$transaction([
      prisma.transaction.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: {
          transactionDate: "desc",
        },
      }),

      prisma.transaction.count({
        where,
      }),
    ]);

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
    const error = new Error(
      "Invalid transaction ID"
    );
    error.statusCode = 400;
    throw error;
  }

  const transaction =
    await prisma.transaction.findFirst({
      where: {
        transactionId,
        userId,
      },
    });

  if (!transaction) {
    const error = new Error(
      "Transaction not found"
    );
    error.statusCode = 404;
    throw error;
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
    const error = new Error(
      "Invalid transaction ID"
    );
    error.statusCode = 400;
    throw error;
  }

  // Find existing transaction and verify ownership
  const existingTransaction =
    await prisma.transaction.findFirst({
      where: {
        transactionId,
        userId,
      },
    });

  if (!existingTransaction) {
    const error = new Error(
      "Transaction not found"
    );
    error.statusCode = 404;
    throw error;
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
      const error = new Error(
        "Amount must be greater than 0"
      );
      error.statusCode = 400;
      throw error;
    }

    updateData.amount = amount;
  }

  // Title
  if (data.title !== undefined) {
    if (
      typeof data.title !== "string" ||
      !data.title.trim()
    ) {
      const error = new Error(
        "Title cannot be empty"
      );
      error.statusCode = 400;
      throw error;
    }

    updateData.title = data.title.trim();
  }

  // Note
  if (data.note !== undefined) {
    if (
      data.note !== null &&
      typeof data.note !== "string"
    ) {
      const error = new Error(
        "Note must be a string"
      );
      error.statusCode = 400;
      throw error;
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
      const error = new Error(
        "Transaction type must be either INCOME or EXPENSE"
      );
      error.statusCode = 400;
      throw error;
    }

    updateData.type = data.type;
  }

  // Transaction date
  if (data.transactionDate !== undefined) {
    const parsedDate =
      new Date(data.transactionDate);

    if (Number.isNaN(parsedDate.getTime())) {
      const error = new Error(
        "Invalid transaction date"
      );
      error.statusCode = 400;
      throw error;
    }

    updateData.transactionDate = parsedDate;
  }

  // Category
  let selectedCategory = null;

  if (data.categoryId !== undefined) {
    // Validate category UUID
    if (!isValidUuid(data.categoryId)) {
      const error = new Error(
        "Invalid category ID"
      );
      error.statusCode = 400;
      throw error;
    }

    // Find category
    selectedCategory =
      await prisma.category.findUnique({
        where: {
          categoryId: data.categoryId,
        },
      });

    // Category does not exist
    if (!selectedCategory) {
      const error = new Error(
        "Category not found"
      );
      error.statusCode = 404;
      throw error;
    }

    // Global/default category
    const isGlobalCategory =
      selectedCategory.isDefault === true &&
      selectedCategory.userId === null;

    // Custom category ownership
    if (
      !isGlobalCategory &&
      selectedCategory.userId !== userId
    ) {
      const error = new Error(
        "You do not have access to this category"
      );
      error.statusCode = 403;
      throw error;
    }

    updateData.categoryId =
      data.categoryId;
  }

  // Determine final type/category
  const finalType =
    data.type ?? existingTransaction.type;

  const finalCategoryId =
    data.categoryId ??
    existingTransaction.categoryId;

  // If category wasn't changed,
  // load the existing category
  if (selectedCategory === null) {
    selectedCategory =
      await prisma.category.findUnique({
        where: {
          categoryId: finalCategoryId,
        },
      });
  }

  // Category must exist
  if (!selectedCategory) {
    const error = new Error(
      "Category not found"
    );
    error.statusCode = 404;
    throw error;
  }

  // Verify category access even when
  // category wasn't explicitly changed
  const isGlobalCategory =
    selectedCategory.isDefault === true &&
    selectedCategory.userId === null;

  if (
    !isGlobalCategory &&
    selectedCategory.userId !== userId
  ) {
    const error = new Error(
      "You do not have access to this category"
    );
    error.statusCode = 403;
    throw error;
  }

  // Transaction type must match category type
  if (
    selectedCategory.type !== finalType
  ) {
    const error = new Error(
      "Transaction type must match category type"
    );
    error.statusCode = 400;
    throw error;
  }

  // At least one valid field required
  if (
    Object.keys(updateData).length === 0
  ) {
    const error = new Error(
      "No valid fields provided for update"
    );
    error.statusCode = 400;
    throw error;
  }

  // Update transaction
  return prisma.transaction.update({
    where: {
      transactionId,
    },
    data: updateData,
  });
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
    const error = new Error(
      "Invalid transaction ID"
    );
    error.statusCode = 400;
    throw error;
  }

  // Verify ownership
  const transaction =
    await prisma.transaction.findFirst({
      where: {
        transactionId,
        userId,
      },
    });

  if (!transaction) {
    const error = new Error(
      "Transaction not found"
    );
    error.statusCode = 404;
    throw error;
  }

  // Delete only user's transaction
  await prisma.transaction.delete({
    where: {
      transactionId,
    },
  });

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
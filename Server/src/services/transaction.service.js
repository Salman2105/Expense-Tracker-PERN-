const prisma = require("../../config/prisma");

const isValidUuid = (value) => {
    if (typeof value !== "string") return false;
    const trimmed = value.trim();

    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(trimmed);
};

const createTransaction = async (userId, data) => {
    const {
        categoryId,
        type,
        amount,
        title,
        note,
        transactionDate,
    } = data;

    if (!isValidUuid(categoryId)) {
        const error = new Error("Invalid category ID");
        error.statusCode = 400;
        throw error;
    }

    // 1. Find the category
    const category = await prisma.category.findUnique({
        where: {
            categoryId,
        },
    });

    // 2. Category does not exist
    if (!category) {
        const error = new Error("Category not found");
        error.statusCode = 404;
        throw error;
    }

    // 3. Global/default categories are allowed for all users.
    const isGlobalCategory = category.userId === null || category.isDefault === true;

    if (!isGlobalCategory) {
        // 4. Custom category → must belong to current user
        if (category.userId !== userId) {
            const error = new Error(
                "You do not have access to this category"
            );

            error.statusCode = 403;
            throw error;
        }
    }

    // 5. Create transaction
    const transaction = await prisma.transaction.create({
        data: {
            userId,
            categoryId,
            type,
            amount,
            title,
            note,
            transactionDate: transactionDate
                ? new Date(transactionDate)
                : undefined,
        },
    });

    return transaction;
};
    
const getUserTransactions = async (userId, filters = {}) => {
  const {
    page = 1,
    limit = 10,
    type,
    categoryId,
    startDate,
    endDate,
  } = filters;

  const pageNumber = Math.max(Number(page), 1);
  const limitNumber = Math.min(Math.max(Number(limit), 1), 100);

  const skip = (pageNumber - 1) * limitNumber;

  const where = {
    userId,
  };

  // Filter by transaction type
  if (type) {
    const allowedTypes = ["INCOME", "EXPENSE"];

    if (!allowedTypes.includes(type)) {
      const error = new Error("Transaction type must be either INCOME or EXPENSE");
      error.statusCode = 400;
      throw error;
    }

    where.type = type;
  }

  // Filter by category
  if (categoryId) {
    where.categoryId = categoryId;
  }

  // Filter by date range
 if (startDate || endDate) {
  where.transactionDate = {};

  if (startDate) {
    const start = new Date(startDate);

    if (Number.isNaN(start.getTime())) {
      const error = new Error("Invalid start date");
      error.statusCode = 400;
      throw error;
    }

    start.setHours(0, 0, 0, 0);

    where.transactionDate.gte = start;
  }

  if (endDate) {
    const end = new Date(endDate);

    if (Number.isNaN(end.getTime())) {
      const error = new Error("Invalid end date");
      error.statusCode = 400;
      throw error;
    }

    end.setHours(23, 59, 59, 999);

    where.transactionDate.lte = end;
  }
}

  const [transactions, total] = await prisma.$transaction([
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
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};
const getTransactionById = async (userId, transactionId) => {
    const transaction = await prisma.transaction.findFirst({
        where: {
            transactionId,
            userId,
        },
    });

    if (!transaction) {
        const error = new Error("Transaction not found");
        error.statusCode = 404;
        throw error;
    }

    return transaction;
};
const updateTransaction = async (userId, transactionId, data) => {
  // 1. Find existing transaction
  const existingTransaction = await prisma.transaction.findFirst({
    where: {
      transactionId,
      userId,
    },
  });

  if (!existingTransaction) {
    const error = new Error("Transaction not found");
    error.statusCode = 404;
    throw error;
  }

  // 2. Create allowlisted update object
  const updateData = {};

  // 3. ADD THE ALLOWED FIELD CHUNKS HERE

  // Amount
  if (data.amount !== undefined) {
    const amount = Number(data.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      const error = new Error("Amount must be greater than 0");
      error.statusCode = 400;
      throw error;
    }

    updateData.amount = amount;
  }

  // Title
  if (data.title !== undefined) {
    if (
      typeof data.title !== "string" ||
      data.title.trim().length === 0
    ) {
      const error = new Error("Title cannot be empty");
      error.statusCode = 400;
      throw error;
    }

    updateData.title = data.title.trim();
  }

  // Note
  if (data.note !== undefined) {
    if (data.note !== null && typeof data.note !== "string") {
      const error = new Error("Note must be a string");
      error.statusCode = 400;
      throw error;
    }

    updateData.note = data.note;
  }

  // Type
  if (data.type !== undefined) {
    if (!["INCOME", "EXPENSE"].includes(data.type)) {
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
    const parsedDate = new Date(data.transactionDate);

    if (Number.isNaN(parsedDate.getTime())) {
      const error = new Error("Invalid transaction date");
      error.statusCode = 400;
      throw error;
    }

    updateData.transactionDate = parsedDate;
  }

  // Category
  if (data.categoryId !== undefined) {
    updateData.categoryId = data.categoryId;
  }

  // 4. Finally update database
  return prisma.transaction.update({
    where: {
      transactionId,
    },
    data: updateData,
  });
};
const deleteTransaction = async (userId, transactionId) => {
    const transaction = await prisma.transaction.findFirst({
        where: {
            transactionId,
            userId,
        },
    });

    if (!transaction) {
        const error = new Error("Transaction not found");
        error.statusCode = 404;
        throw error;
    }

    await prisma.transaction.delete({
        where: {
            transactionId,
        },
    });

    return;
};

module.exports = {
    createTransaction,
    getUserTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction,

};
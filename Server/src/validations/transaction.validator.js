const isValidUuid = (value) => {
  if (typeof value !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.trim());
};

const validateUpdateTransaction = (req, res, next) => {
  const { amount, title, type, transactionDate, categoryId, note } = req.body;

  const protectedFields = [
    "transactionId",
    "userId",
    "createdAt",
    "updatedAt",
  ];

  for (const field of protectedFields) {
    if (req.body[field] !== undefined) {
      return res.status(400).json({
        message: `${field} cannot be modified`,
      });
    }
  }

  if (!isValidUuid(req.params.transactionId)) {
    return res.status(400).json({
      message: "Invalid transaction ID",
    });
  }

  // Amount validation
  if (amount !== undefined) {
    const numericAmount = Number(amount);

    if (
      amount === "" ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      return res.status(400).json({
        message: "Amount must be a valid number greater than 0",
      });
    }
  }

  // Title validation
  if (title !== undefined) {
    if (typeof title !== "string" || title.trim().length === 0) {
      return res.status(400).json({
        message: "Title cannot be empty",
      });
    }
  }

  // Transaction type validation
  if (type !== undefined) {
    const allowedTypes = ["INCOME", "EXPENSE"];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        message: "Transaction type must be either INCOME or EXPENSE",
      });
    }
  }

  // Transaction date validation
  if (transactionDate !== undefined) {
    const parsedDate = new Date(transactionDate);

    if (
      typeof transactionDate !== "string" ||
      transactionDate.trim() === "" ||
      Number.isNaN(parsedDate.getTime())
    ) {
      return res.status(400).json({
        message: "Transaction date must be a valid date",
      });
    }
  }

  // Category ID validation
  if (categoryId !== undefined) {
    if (!isValidUuid(categoryId)) {
      return res.status(400).json({
        message: "Invalid category ID",
      });
    }
  }

  // Note validation
  if (note !== undefined && note !== null) {
    if (typeof note !== "string") {
      return res.status(400).json({
        message: "Note must be a string",
      });
    }
  }

  next();
};
const validateGetTransactions = (req, res, next) => {
  const {
    page,
    limit,
    type,
    categoryId,
    startDate,
    endDate,
  } = req.query;

  // Validate page
  if (page !== undefined) {
    const pageNumber = Number(page);

    if (
      !Number.isInteger(pageNumber) ||
      pageNumber < 1
    ) {
      return res.status(400).json({
        message: "Page must be a positive integer",
      });
    }
  }

  // Validate limit
  if (limit !== undefined) {
    const limitNumber = Number(limit);

    if (
      !Number.isInteger(limitNumber) ||
      limitNumber < 1 ||
      limitNumber > 100
    ) {
      return res.status(400).json({
        message: "Limit must be between 1 and 100",
      });
    }
  }

  // Validate transaction type
  if (type !== undefined) {
    if (!["INCOME", "EXPENSE"].includes(type)) {
      return res.status(400).json({
        message: "Type must be either INCOME or EXPENSE",
      });
    }
  }

  // Validate category ID
  if (categoryId !== undefined) {
    if (
      typeof categoryId !== "string" ||
      categoryId.trim() === ""
    ) {
      return res.status(400).json({
        message: "Category ID cannot be empty",
      });
    }
  }

  // Validate start date
  if (startDate !== undefined) {
    const parsedStartDate = new Date(startDate);

    if (
      startDate.trim() === "" ||
      Number.isNaN(parsedStartDate.getTime())
    ) {
      return res.status(400).json({
        message: "Invalid start date",
      });
    }
  }

  // Validate end date
  if (endDate !== undefined) {
    const parsedEndDate = new Date(endDate);

    if (
      endDate.trim() === "" ||
      Number.isNaN(parsedEndDate.getTime())
    ) {
      return res.status(400).json({
        message: "Invalid end date",
      });
    }
  }

  // Validate date order
  if (startDate !== undefined && endDate !== undefined) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return res.status(400).json({
        message: "Start date cannot be later than end date",
      });
    }
  }

  next();
};

module.exports = {
  validateUpdateTransaction,
  validateGetTransactions,
};
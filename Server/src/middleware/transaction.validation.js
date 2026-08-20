const isValidUuid = (value) => {
    if (typeof value !== "string") {
        return false;
    }

    const trimmed = value.trim();

    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        trimmed
    );
};

const VALID_TRANSACTION_TYPES = ["INCOME", "EXPENSE"];

/**
 * Validate CREATE transaction request
 */
const validateCreateTransaction = (req, res, next) => {
    if (
        !req.body ||
        typeof req.body !== "object" ||
        Array.isArray(req.body)
    ) {
        return res.status(400).json({
            message: "Request body must be a valid JSON object",
        });
    }

    const {
        categoryId,
        type,
        amount,
        title,
        note,
        transactionDate,
    } = req.body;

    // Category ID
    if (!categoryId) {
        return res.status(400).json({
            message: "categoryId is required",
        });
    }

    if (!isValidUuid(categoryId)) {
        return res.status(400).json({
            message: "Invalid category ID",
        });
    }

    // Transaction type
    if (!type) {
        return res.status(400).json({
            message: "type is required",
        });
    }

    if (!VALID_TRANSACTION_TYPES.includes(type)) {
        return res.status(400).json({
            message: "type must be either INCOME or EXPENSE",
        });
    }

    // Amount
    if (
        amount === undefined ||
        amount === null ||
        amount === ""
    ) {
        return res.status(400).json({
            message: "amount is required",
        });
    }

    const numericAmount = Number(amount);

    if (
        !Number.isFinite(numericAmount) ||
        numericAmount <= 0
    ) {
        return res.status(400).json({
            message: "amount must be a positive number",
        });
    }

    // Title
    if (
        typeof title !== "string" ||
        !title.trim()
    ) {
        return res.status(400).json({
            message: "title is required",
        });
    }

    // Note
    if (
        note !== undefined &&
        note !== null &&
        typeof note !== "string"
    ) {
        return res.status(400).json({
            message: "note must be a string",
        });
    }

    // Transaction date
    if (
        transactionDate !== undefined &&
        transactionDate !== null
    ) {
        const parsedDate = new Date(transactionDate);

        if (Number.isNaN(parsedDate.getTime())) {
            return res.status(400).json({
                message:
                    "transactionDate must be a valid date",
            });
        }
    }

    next();
};

/**
 * Validate UPDATE transaction request
 */
const validateUpdateTransaction = (req, res, next) => {
    if (
        !req.body ||
        typeof req.body !== "object" ||
        Array.isArray(req.body)
    ) {
        return res.status(400).json({
            message: "Request body must be a valid JSON object",
        });
    }

    const {
        categoryId,
        type,
        amount,
        title,
        note,
        transactionDate,
    } = req.body;

    // At least one field must be provided
    if (
        categoryId === undefined &&
        type === undefined &&
        amount === undefined &&
        title === undefined &&
        note === undefined &&
        transactionDate === undefined
    ) {
        return res.status(400).json({
            message:
                "At least one field is required for update",
        });
    }

    // Category ID
    if (categoryId !== undefined) {
        if (!isValidUuid(categoryId)) {
            return res.status(400).json({
                message: "Invalid category ID",
            });
        }
    }

    // Transaction type
    if (type !== undefined) {
        if (!VALID_TRANSACTION_TYPES.includes(type)) {
            return res.status(400).json({
                message:
                    "type must be either INCOME or EXPENSE",
            });
        }
    }

    // Amount
    if (amount !== undefined) {
        const numericAmount = Number(amount);

        if (
            !Number.isFinite(numericAmount) ||
            numericAmount <= 0
        ) {
            return res.status(400).json({
                message:
                    "amount must be a positive number",
            });
        }
    }

    // Title
    if (title !== undefined) {
        if (
            typeof title !== "string" ||
            !title.trim()
        ) {
            return res.status(400).json({
                message: "title cannot be empty",
            });
        }
    }

    // Note
    if (note !== undefined) {
        if (
            note !== null &&
            typeof note !== "string"
        ) {
            return res.status(400).json({
                message: "note must be a string",
            });
        }
    }

    // Transaction date
    if (transactionDate !== undefined) {
        const parsedDate = new Date(transactionDate);

        if (Number.isNaN(parsedDate.getTime())) {
            return res.status(400).json({
                message:
                    "transactionDate must be a valid date",
            });
        }
    }

    next();
};

/**
 * Validate transaction ID
 */
const validateTransactionId = (req, res, next) => {
    const { transactionId } = req.params;

    if (!isValidUuid(transactionId)) {
        return res.status(400).json({
            message: "Invalid transaction ID",
        });
    }

    next();
};

module.exports = {
    validateCreateTransaction,
    validateUpdateTransaction,
    validateTransactionId,
};
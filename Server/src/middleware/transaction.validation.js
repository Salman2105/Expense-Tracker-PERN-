const validateCreateTransaction = (req, res, next) => {
    const {
        categoryId,
        type,
        amount,
        title,
        note,
        transactionDate,
    } = req.body;

    // Required fields
    if (!categoryId) {
        return res.status(400).json({
            message: "categoryId is required",
        });
    }

    if (!type) {
        return res.status(400).json({
            message: "type is required",
        });
    }

    if (amount === undefined || amount === null || amount === "") {
        return res.status(400).json({
            message: "amount is required",
        });
    }

    if (!title || typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
            message: "title is required",
        });
    }

    // Transaction type validation
    if (!["INCOME", "EXPENSE"].includes(type)) {
        return res.status(400).json({
            message: "type must be either INCOME or EXPENSE",
        });
    }

    // Amount validation
    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({
            message: "amount must be a positive number",
        });
    }

    // Optional note validation
    if (note !== undefined && note !== null && typeof note !== "string") {
        return res.status(400).json({
            message: "note must be a string",
        });
    }

    // Optional transaction date validation
    if (transactionDate !== undefined && transactionDate !== null) {
        const parsedDate = new Date(transactionDate);

        if (Number.isNaN(parsedDate.getTime())) {
            return res.status(400).json({
                message: "transactionDate must be a valid date",
            });
        }
    }

    next();
};

module.exports = {
    validateCreateTransaction,
};
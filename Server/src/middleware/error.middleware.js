const { errorResponse } = require("../utils/response.util");

const errorMiddleware = (err, req, res, next) => {
    console.error(err);

    const statusCode = err.statusCode || 500;

    const message =
        err.message || "Internal server error";

    const code =
        err.code || "INTERNAL_SERVER_ERROR";

    return errorResponse(
        res,
        statusCode,
        message,
        code
    );
};

module.exports = errorMiddleware;
const successResponse = (res, statusCode, message, data = null) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

const errorResponse = (
    res,
    statusCode,
    message,
    code = null,
    details = null
) => {
    return res.status(statusCode).json({
        success: false,
        message,
        ...(code && {
            error: {
                code,
                ...(details && { details }),
            },
        }),
    });
};

module.exports = {
    successResponse,
    errorResponse,
};
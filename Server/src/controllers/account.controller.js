const accountService = require("../services/account.service");

const { successResponse, errorResponse } = require("../utils/response.util");

/**
 * GET /api/account/status
 *
 * Get current authenticated user's account status.
 */
const getAccountStatus = async (req, res, next) => {
    try {
        const userId = req.user?.id;

        // Authentication middleware should always provide this.
        // This is an additional defensive check.
        if (!userId) {
            return errorResponse(
                res,
                401,
                "Authentication required",
                "AUTHENTICATION_REQUIRED"
            );
        }

        const status = await accountService.getAccountStatus(userId);

        return successResponse(
            res,
            200,
            "Account status retrieved successfully",
            status
        );
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/account/delete
 *
 * Soft-delete the currently authenticated user's account.
 */
const deleteAccount = async (req, res, next) => {
    try {
        const userId = req.user?.id;

        // Defensive authentication check.
        if (!userId) {
            return errorResponse(
                res,
                401,
                "Authentication required",
                "AUTHENTICATION_REQUIRED"
            );
        }

        const result = await accountService.deleteAccount(userId);

        return successResponse(
            res,
            200,
            "Account deleted successfully",
            result
        );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAccountStatus,
    deleteAccount,
};

const prisma = require("../../config/prisma");
const accountService = require("../services/account.service");

const {
    successResponse,
    errorResponse,
} = require("../utils/response.util");

/**
 * GET /api/account/status
 *
 * Get current authenticated user's account status.
 */
const getAccountStatus = async (req, res) => {
    try {
        const userId = req.user?.id;

        // Authentication middleware should always provide this.
        // This is an additional defensive check.
        if (!userId) {
            return errorResponse(
                res,
                401,
                "Authentication required",            );
        }

        const user = await prisma.user.findUnique({
            where: {
                userId,
            },
            select: {
                userId: true,
                status: true,
                deletedAt: true,
            },
        });

        if (!user) {
            return errorResponse(
                res,
                404,
                "User not found",
                "USER_NOT_FOUND"
            );
        }

        return successResponse(
            res,
            200,
            "Account status retrieved successfully",
            {
                status: user.status,
                deletedAt: user.deletedAt,
            }
        );
    } catch (error) {
        console.error("Get account status error:", error);

        return errorResponse(
            res,
            500,
            "Failed to retrieve account status",
            "ACCOUNT_STATUS_ERROR"
        );
    }
};

/**
 * DELETE /api/account
 *
 * Soft-delete the currently authenticated user's account.
 */
const deleteAccount = async (req, res) => {
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

        const user = await prisma.user.findUnique({
            where: {
                userId,
            },
            select: {
                userId: true,
                status: true,
                deletedAt: true,
            },
        });

        if (!user) {
            return errorResponse(
                res,
                404,
                "User not found",
            );
        }

        // Prevent deleting an already deleted account.
        if (user.deletedAt) {
            return errorResponse(
                res,
                400,
                "Account has already been deleted",
                "ACCOUNT_ALREADY_DELETED"
            );
        }

        // Suspended accounts cannot be deleted.
        if (user.status === "SUSPENDED") {
            return errorResponse(
                res,
                403,
                "Suspended accounts cannot be deleted",
                "ACCOUNT_SUSPENDED"
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
        console.error("Delete account error:", error);

        // Known business errors.
        if (error.code === "USER_NOT_FOUND") {
            return errorResponse(
                res,
                404,
                "User not found",
                "USER_NOT_FOUND"
            );
        }

        if (error.code === "ACCOUNT_ALREADY_DELETED") {
            return errorResponse(
                res,
                400,
                "Account has already been deleted",
                "ACCOUNT_ALREADY_DELETED"
            );
        }

        if (error.code === "ACCOUNT_SUSPENDED") {
            return errorResponse(
                res,
                403,
                "Suspended accounts cannot be deleted",
                "ACCOUNT_SUSPENDED"
            );
        }

        // Do not expose unexpected internal/database errors.
        return errorResponse(
            res,
            500,
            "Failed to delete account",
            "ACCOUNT_DELETE_ERROR"
        );
    }
};

module.exports = {
    getAccountStatus,
    deleteAccount,
};
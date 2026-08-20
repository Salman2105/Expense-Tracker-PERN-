const userSettingsService = require("../services/userSettings.service");

const {
    successResponse,
    errorResponse,
} = require("../utils/response.util");

/**
 * GET /api/user/me/settings
 */
const getMySettings = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return errorResponse(
                res,
                401,
                "Authentication required",
                "AUTHENTICATION_REQUIRED"
            );
        }

        let settings = await userSettingsService.getUserSettings(
            userId
        );

        /**
         * Automatically create default settings
         * when the user doesn't have a settings record.
         */
        if (!settings) {
            settings = await userSettingsService.createUserSettings(
                userId,
                {
                    theme: "SYSTEM",
                    preferredCurrency: "PKR",
                    language: "en",
                    emailNotifications: true,
                    budgetAlerts: true,
                }
            );
        }

        return successResponse(
            res,
            200,
            "User settings retrieved successfully",
            settings
        );
    } catch (error) {
        console.error("Get settings error:", error);

        if (error.code === "INVALID_USER_ID") {
            return errorResponse(
                res,
                400,
                "Invalid user ID",
                "INVALID_USER_ID"
            );
        }

        return errorResponse(
            res,
            500,
            "Failed to get user settings",
            "GET_SETTINGS_ERROR"
        );
    }
};

/**
 * POST /api/user/me/settings
 */
const createMySettings = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return errorResponse(
                res,
                401,
                "Authentication required",
                "AUTHENTICATION_REQUIRED"
            );
        }

        const settings =
            await userSettingsService.createUserSettings(
                userId,
                req.body
            );

        return successResponse(
            res,
            201,
            "User settings created successfully",
            settings
        );
    } catch (error) {
        console.error("Create settings error:", error);

        if (error.code === "INVALID_USER_ID") {
            return errorResponse(
                res,
                400,
                "Invalid user ID",
                "INVALID_USER_ID"
            );
        }

        if (error.code === "P2002") {
            return errorResponse(
                res,
                409,
                "User settings already exist",
                "SETTINGS_ALREADY_EXIST"
            );
        }

        return errorResponse(
            res,
            500,
            "Failed to create user settings",
            "CREATE_SETTINGS_ERROR"
        );
    }
};

/**
 * PATCH /api/user/me/settings
 */
const updateMySettings = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return errorResponse(
                res,
                401,
                "Authentication required",
                "AUTHENTICATION_REQUIRED"
            );
        }

        const settings =
            await userSettingsService.updateUserSettings(
                userId,
                req.body
            );

        return successResponse(
            res,
            200,
            "User settings updated successfully",
            settings
        );
    } catch (error) {
        console.error("Update settings error:", error);

        if (error.code === "INVALID_USER_ID") {
            return errorResponse(
                res,
                400,
                "Invalid user ID",
                "INVALID_USER_ID"
            );
        }

        if (error.code === "P2025") {
            return errorResponse(
                res,
                404,
                "User settings not found",
                "SETTINGS_NOT_FOUND"
            );
        }

        return errorResponse(
            res,
            500,
            "Failed to update user settings",
            "UPDATE_SETTINGS_ERROR"
        );
    }
};

module.exports = {
    getMySettings,
    createMySettings,
    updateMySettings,
};
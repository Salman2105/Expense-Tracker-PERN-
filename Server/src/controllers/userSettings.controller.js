const userSettingsService = require("../services/userSettings.service");

const {
    successResponse,
    errorResponse,
} = require("../utils/response.util");

/**
 * GET /api/user/me/settings
 */
const getMySettings = async (req, res, next) => {
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

        // Intentionally no message field here, matching this endpoint's
        // long-standing response shape (unlike every other success
        // response in this file, which does include one).
        return res.status(200).json({
            success: true,
            data: settings,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/user/me/settings
 */
const createMySettings = async (req, res, next) => {
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
        next(error);
    }
};

/**
 * PATCH /api/user/me/settings
 */
const updateMySettings = async (req, res, next) => {
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
        next(error);
    }
};

module.exports = {
    getMySettings,
    createMySettings,
    updateMySettings,
};

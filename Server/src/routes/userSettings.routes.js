const express = require("express");
const userSettingsService = require("../services/userSettings.service");
const authMiddleware = require("../middleware/auth.middleware");
const {
  validateUserSettings,
} = require("../middleware/userSettings.validation");

const router = express.Router();

/**
 * GET /api/user/me/settings
 */
const getMySettings = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    let settings =
      await userSettingsService.getUserSettings(
        userId
      );

    /**
     * Automatically create default settings
     * when the user doesn't have a settings record.
     */
    if (!settings) {
      settings =
        await userSettingsService.createUserSettings(
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

    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error(
      "Get settings error:",
      error
    );

    if (error.code === "INVALID_USER_ID") {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to get user settings",
    });
  }
};

/**
 * POST /api/user/me/settings
 */
const createMySettings = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const settings =
      await userSettingsService.createUserSettings(
        userId,
        req.body
      );

    return res.status(201).json({
      success: true,
      message:
        "User settings created successfully",
      data: settings,
    });
  } catch (error) {
    console.error(
      "Create settings error:",
      error
    );

    if (error.code === "INVALID_USER_ID") {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "User settings already exist",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create user settings",
    });
  }
};

/**
 * PATCH /api/user/me/settings
 */
const updateMySettings = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const settings =
      await userSettingsService.updateUserSettings(
        userId,
        req.body
      );

    return res.status(200).json({
      success: true,
      message:
        "User settings updated successfully",
      data: settings,
    });
  } catch (error) {
    console.error(
      "Update settings error:",
      error
    );

    if (error.code === "INVALID_USER_ID") {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "User settings not found",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to update user settings",
    });
  }
};

/**
 * @swagger
 * /api/users/me/settings:
 *   get:
 *     summary: Get current user's settings
 *     description: Returns the settings of the currently authenticated user.
 *     tags:
 *       - User Settings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User settings retrieved successfully
 *       401:
 *         description: Authentication token is missing or invalid
 *       404:
 *         description: User settings not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/me/settings",
  authMiddleware,
  getMySettings
);

/**
 * @swagger
 * /api/users/me/settings:
 *   post:
 *     summary: Create user settings
 *     description: Creates settings for the currently authenticated user. At least one setting must be provided.
 *     tags:
 *       - User Settings
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             additionalProperties: false
 *             properties:
 *               theme:
 *                 type: string
 *                 enum:
 *                   - LIGHT
 *                   - DARK
 *                   - SYSTEM
 *                 example: SYSTEM
 *               preferredCurrency:
 *                 type: string
 *                 pattern: '^[A-Z]{3}$'
 *                 minLength: 3
 *                 maxLength: 3
 *                 example: PKR
 *               language:
 *                 type: string
 *                 pattern: '^[a-zA-Z]{2,3}(-[a-zA-Z]{2,4})?$'
 *                 maxLength: 10
 *                 example: en
 *               emailNotifications:
 *                 type: boolean
 *                 example: true
 *               budgetAlerts:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: User settings created successfully
 *       400:
 *         description: Invalid settings data
 *       401:
 *         description: Authentication token is missing or invalid
 *       409:
 *         description: User settings already exist
 *       500:
 *         description: Internal server error
 */
router.post(
  "/me/settings",
  authMiddleware,
  validateUserSettings,
  createMySettings
);

/**
 * @swagger
 * /api/users/me/settings:
 *   patch:
 *     summary: Update user settings
 *     description: Updates one or more settings for the currently authenticated user.
 *     tags:
 *       - User Settings
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             additionalProperties: false
 *             properties:
 *               theme:
 *                 type: string
 *                 enum:
 *                   - LIGHT
 *                   - DARK
 *                   - SYSTEM
 *                 example: DARK
 *               preferredCurrency:
 *                 type: string
 *                 pattern: '^[A-Z]{3}$'
 *                 minLength: 3
 *                 maxLength: 3
 *                 example: PKR
 *               language:
 *                 type: string
 *                 pattern: '^[a-zA-Z]{2,3}(-[a-zA-Z]{2,4})?$'
 *                 maxLength: 10
 *                 example: ur-PK
 *               emailNotifications:
 *                 type: boolean
 *                 example: false
 *               budgetAlerts:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: User settings updated successfully
 *       400:
 *         description: Invalid settings data
 *       401:
 *         description: Authentication token is missing or invalid
 *       404:
 *         description: User settings not found
 *       500:
 *         description: Internal server error
 */
router.patch(
  "/me/settings",
  authMiddleware,
  validateUserSettings,
  updateMySettings
);

module.exports = router;
const express = require("express");
const userSettingsController = require("../controllers/userSettings.controller");
const authMiddleware = require("../middleware/auth.middleware");
const {
  validateUserSettings,
} = require("../middleware/userSettings.validation");

const router = express.Router();

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
  userSettingsController.getMySettings
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
  userSettingsController.createMySettings
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
  userSettingsController.updateMySettings
);

module.exports = router;

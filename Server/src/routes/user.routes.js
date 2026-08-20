const express = require("express");

const {
  getMyProfile,
  updateMyProfile,
  changePassword,
} = require("../controllers/user.controller");

const authMiddleware = require("../middleware/auth.middleware");

const {
  validateUpdateProfile,
  validateChangePassword,
} = require("../middleware/user.validation");

const router = express.Router();

/**
 * Get current user's profile
 */
/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user profile
 *     description: Returns the profile information of the currently authenticated user.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Authentication token is missing or invalid
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/me",
  authMiddleware,
  getMyProfile
);

/**
 * Update current user's profile
 */
/**
 * @swagger
 * /api/users/me:
 *   patch:
 *     summary: Update current user profile
 *     description: Updates the username and/or profile picture of the authenticated user. At least one field must be provided.
 *     tags:
 *       - User
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
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 pattern: '^[a-zA-Z0-9_.-]+$'
 *                 example: john_doe
 *               profilePicture:
 *                 type: string
 *                 nullable: true
 *                 maxLength: 2048
 *                 example: https://example.com/profile.jpg
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *       400:
 *         description: Invalid profile data or unexpected field
 *       401:
 *         description: Authentication token is missing or invalid
 *       409:
 *         description: Username already exists
 *       500:
 *         description: Internal server error
 */
router.patch(
  "/me",
  authMiddleware,
  validateUpdateProfile,
  updateMyProfile
);

/**
 * Change current user's password
 */
/**
 * @swagger
 * /api/users/me/password:
 *   patch:
 *     summary: Change current user's password
 *     description: Changes the password of the currently authenticated user.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 example: OldPassword123!
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: NewPassword123!
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication token is missing, invalid, or current password is incorrect
 *       500:
 *         description: Internal server error
 */
router.patch(
  "/me/password",
  authMiddleware,
  validateChangePassword,
  changePassword
);

module.exports = router;
const express = require("express");

const {
  getAccountStatus,
  deleteAccount,
} = require("../controllers/account.controller");

const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * GET /api/account/status
 *
 * Get the authenticated user's account status.
 */
/**
 * @swagger
 * /api/account/status:
 *   get:
 *     summary: Get account status
 *     description: Returns the current status of the authenticated user's account.
 *     tags:
 *       - Account
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account status retrieved successfully
 *       401:
 *         description: Authentication token is missing or invalid
 *       404:
 *         description: User account not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/status",
  authMiddleware,
  getAccountStatus
);

/**
 * DELETE /api/account
 *
 * Soft-delete the authenticated user's account.
 */
/**
 * @swagger
 * /api/account/delete:
 *   delete:
 *     summary: Delete account
 *     description: Deletes the currently authenticated user's account.
 *     tags:
 *       - Account
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       400:
 *         description: Account is already deleted or request is invalid
 *       401:
 *         description: Authentication token is missing or invalid
 *       404:
 *         description: User account not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/delete",
  authMiddleware,
  deleteAccount
);

module.exports = router;
const express = require("express");

const dashboardController = require("../controllers/dashboard.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// Protected dashboard endpoint
/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get user dashboard
 *     description: Returns dashboard data for the currently authenticated user, including financial summary and analytics.
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *       401:
 *         description: Authentication token is missing or invalid
 *       500:
 *         description: Internal server error
 */
router.get(
  "/",
  authMiddleware,
  dashboardController.getDashboard
);

module.exports = router;
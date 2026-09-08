const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const budgetController = require("../controllers/budget.controller");
const {
  validateCreateBudget,
  validateBudgetAmountUpdate,
} = require("../middleware/budget.validation");

const router = express.Router();

router.use(authMiddleware);

/**
 * @swagger
 * /api/budgets:
 *   get:
 *     summary: List the authenticated user's monthly budgets
 *     tags: [Budgets]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Budgets retrieved successfully }
 *       401: { description: Authentication required }
 *   post:
 *     summary: Create a monthly category budget
 *     tags: [Budgets]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [categoryId, amount]
 *             properties:
 *               categoryId: { type: string, format: uuid }
 *               amount: { type: number, minimum: 0 }
 *               startDate: { type: string, format: date-time }
 *     responses:
 *       201: { description: Budget created successfully }
 *       400: { description: Invalid budget data }
 *       401: { description: Authentication required }
 *       409: { description: Budget already exists for the month }
 */
router.get("/", budgetController.getBudgets);
router.post("/", validateCreateBudget, budgetController.createBudget);

/**
 * @swagger
 * /api/budgets/{budgetId}:
 *   patch:
 *     summary: Update a monthly budget amount
 *     tags: [Budgets]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: budgetId
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount: { type: number, minimum: 0 }
 *     responses:
 *       200: { description: Budget updated successfully }
 *       400: { description: Invalid budget data }
 *       401: { description: Authentication required }
 *       404: { description: Budget not found }
 *   delete:
 *     summary: Delete a monthly budget
 *     tags: [Budgets]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: budgetId
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Budget deleted successfully }
 *       401: { description: Authentication required }
 *       404: { description: Budget not found }
 */
router.patch("/:budgetId", validateBudgetAmountUpdate, budgetController.updateBudget);
router.delete("/:budgetId", budgetController.deleteBudget);

module.exports = router;

const express = require("express");

const transactionController = require("../controllers/transaction.controller");
const authMiddleware = require("../middleware/auth.middleware");

const {
  validateCreateTransaction,
  validateUpdateTransaction,
  validateTransactionId,
} = require("../middleware/transaction.validation");

const {
  validateGetTransactions,
} = require("../validations/transaction.validator");

const router = express.Router();

// CREATE TRANSACTION
/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Create a transaction
 *     description: Creates a new income or expense transaction for the authenticated user.
 *     tags:
 *       - Transactions
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryId
 *               - type
 *               - amount
 *               - title
 *             additionalProperties: false
 *             properties:
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the category associated with the transaction
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *               type:
 *                 type: string
 *                 enum:
 *                   - INCOME
 *                   - EXPENSE
 *                 example: EXPENSE
 *               amount:
 *                 type: number
 *                 format: double
 *                 exclusiveMinimum: 0
 *                 description: Transaction amount. Must be greater than zero.
 *                 example: 2500.50
 *               title:
 *                 type: string
 *                 description: Transaction title
 *                 example: Grocery shopping
 *               note:
 *                 type: string
 *                 nullable: true
 *                 description: Optional transaction note
 *                 example: Monthly groceries
 *               transactionDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 description: Optional transaction date
 *                 example: 2026-08-20T10:30:00.000Z
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *       400:
 *         description: Invalid transaction data
 *       401:
 *         description: Authentication token is missing or invalid
 *       404:
 *         description: Category not found or not accessible
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  authMiddleware,
  validateCreateTransaction,
  transactionController.createTransaction
);

// GET ALL USER TRANSACTIONS
/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get user transactions
 *     description: Returns transactions belonging to the authenticated user with optional filtering and pagination.
 *     tags:
 *       - Transactions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         required: false
 *         description: Page number. Must be a positive integer.
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *           example: 1
 *
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Number of transactions per page. Must be between 1 and 100.
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *           example: 20
 *
 *       - name: type
 *         in: query
 *         required: false
 *         description: Filter transactions by transaction type.
 *         schema:
 *           type: string
 *           enum:
 *             - INCOME
 *             - EXPENSE
 *           example: EXPENSE
 *
 *       - name: categoryId
 *         in: query
 *         required: false
 *         description: Filter transactions by category UUID.
 *         schema:
 *           type: string
 *           format: uuid
 *           example: 550e8400-e29b-41d4-a716-446655440000
 *
 *       - name: startDate
 *         in: query
 *         required: false
 *         description: Return transactions from this date/time onward.
 *         schema:
 *           type: string
 *           format: date-time
 *           example: 2026-08-01T00:00:00.000Z
 *
 *       - name: endDate
 *         in: query
 *         required: false
 *         description: Return transactions up to this date/time.
 *         schema:
 *           type: string
 *           format: date-time
 *           example: 2026-08-20T23:59:59.999Z
 *
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *       400:
 *         description: Invalid pagination, filter, category UUID, or date parameters
 *       401:
 *         description: Authentication token is missing or invalid
 *       500:
 *         description: Internal server error
 */
router.get(
  "/",
  authMiddleware,
  validateGetTransactions,
  transactionController.getUserTransactions
);

// GET SINGLE TRANSACTION
/**
 * @swagger
 * /api/transactions/{transactionId}:
 *   get:
 *     summary: Get a single transaction
 *     description: Returns a single transaction belonging to the authenticated user.
 *     tags:
 *       - Transactions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: transactionId
 *         in: path
 *         required: true
 *         description: UUID of the transaction to retrieve
 *         schema:
 *           type: string
 *           format: uuid
 *           example: 550e8400-e29b-41d4-a716-446655440000
 *     responses:
 *       200:
 *         description: Transaction retrieved successfully
 *       400:
 *         description: Invalid transaction UUID
 *       401:
 *         description: Authentication token is missing or invalid
 *       404:
 *         description: Transaction not found or not accessible
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:transactionId",
  authMiddleware,
  validateTransactionId,
  transactionController.getTransactionById
);

// UPDATE TRANSACTION
/**
 * @swagger
 * /api/transactions/{transactionId}:
 *   patch:
 *     summary: Update a transaction
 *     description: Updates allowed fields of a transaction belonging to the authenticated user.
 *     tags:
 *       - Transactions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: transactionId
 *         in: path
 *         required: true
 *         description: UUID of the transaction to update
 *         schema:
 *           type: string
 *           format: uuid
 *           example: 550e8400-e29b-41d4-a716-446655440000
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 format: double
 *                 exclusiveMinimum: 0
 *                 description: Updated transaction amount. Must be greater than zero.
 *                 example: 3000.50
 *               title:
 *                 type: string
 *                 description: Updated transaction title.
 *                 example: Monthly groceries
 *               type:
 *                 type: string
 *                 enum:
 *                   - INCOME
 *                   - EXPENSE
 *                 example: EXPENSE
 *               transactionDate:
 *                 type: string
 *                 format: date-time
 *                 description: Updated transaction date.
 *                 example: 2026-08-20T10:30:00.000Z
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the new category.
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *               note:
 *                 type: string
 *                 nullable: true
 *                 description: Updated transaction note.
 *                 example: Updated monthly groceries
 *     responses:
 *       200:
 *         description: Transaction updated successfully
 *       400:
 *         description: Invalid transaction ID or update data
 *       401:
 *         description: Authentication token is missing or invalid
 *       404:
 *         description: Transaction or category not found, or resource not accessible
 *       500:
 *         description: Internal server error
 */
router.patch(
  "/:transactionId",
  authMiddleware,
  validateTransactionId,
  validateUpdateTransaction,
  transactionController.updateTransaction
);

// DELETE TRANSACTION
/**
 * @swagger
 * /api/transactions/{transactionId}:
 *   delete:
 *     summary: Delete a transaction
 *     description: Deletes a transaction belonging to the authenticated user.
 *     tags:
 *       - Transactions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: transactionId
 *         in: path
 *         required: true
 *         description: UUID of the transaction to delete
 *         schema:
 *           type: string
 *           format: uuid
 *           example: 550e8400-e29b-41d4-a716-446655440000
 *     responses:
 *       200:
 *         description: Transaction deleted successfully
 *       400:
 *         description: Invalid transaction UUID
 *       401:
 *         description: Authentication token is missing or invalid
 *       404:
 *         description: Transaction not found or not accessible
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:transactionId",
  authMiddleware,
  validateTransactionId,
  transactionController.deleteTransaction
);

module.exports = router;
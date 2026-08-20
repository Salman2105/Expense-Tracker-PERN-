const express = require("express");

const categoryController = require("../controllers/category.controller");
const authMiddleware = require("../middleware/auth.middleware");

const {
  validateCreateCategory,
  validateUpdateCategory,
  validateCategoryId,
} = require("../middleware/category.validation");
const router = express.Router();

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a category
 *     description: Creates a new category for the authenticated user.
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - icon
 *               - type
 *             additionalProperties: false
 *             properties:
 *               name:
 *                 type: string
 *                 example: Food
 *               icon:
 *                 type: string
 *                 example: 🍔
 *               type:
 *                 type: string
 *                 enum:
 *                   - INCOME
 *                   - EXPENSE
 *                 example: EXPENSE
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Invalid category data
 *       401:
 *         description: Authentication token is missing or invalid
 *       409:
 *         description: Category already exists
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  authMiddleware,
  validateCreateCategory,
  categoryController.createCategory
);

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get categories
 *     description: Returns the categories available to the authenticated user.
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *       401:
 *         description: Authentication token is missing or invalid
 *       500:
 *         description: Internal server error
 */
router.get(
  "/",
  authMiddleware,
  categoryController.getCategories
);

/**
 * @swagger
 * /api/categories/{categoryId}:
 *   patch:
 *     summary: Update a category
 *     description: Updates one or more fields of a category owned by the authenticated user.
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: categoryId
 *         in: path
 *         required: true
 *         description: UUID of the category to update
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
 *             minProperties: 1
 *             additionalProperties: false
 *             properties:
 *               name:
 *                 type: string
 *                 example: Groceries
 *               icon:
 *                 type: string
 *                 example: 🛒
 *               type:
 *                 type: string
 *                 enum:
 *                   - INCOME
 *                   - EXPENSE
 *                 example: EXPENSE
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Invalid UUID or category update data
 *       401:
 *         description: Authentication token is missing or invalid
 *       404:
 *         description: Category not found or not accessible
 *       409:
 *         description: Category update conflicts with an existing category
 *       500:
 *         description: Internal server error
 */
router.patch(
  "/:categoryId",
  authMiddleware,
  validateCategoryId,
  validateUpdateCategory,
  categoryController.updateCategory
);
/**
 * @swagger
 * /api/categories/{categoryId}:
 *   delete:
 *     summary: Delete a category
 *     description: Deletes a category owned by the authenticated user.
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: categoryId
 *         in: path
 *         required: true
 *         description: UUID of the category to delete
 *         schema:
 *           type: string
 *           format: uuid
 *           example: 550e8400-e29b-41d4-a716-446655440000
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       400:
 *         description: Invalid category UUID
 *       401:
 *         description: Authentication token is missing or invalid
 *       404:
 *         description: Category not found or not accessible
 *       409:
 *         description: Category cannot be deleted because it is being used
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:categoryId",
  authMiddleware,
  validateCategoryId,
  categoryController.deleteCategory
);

module.exports = router;
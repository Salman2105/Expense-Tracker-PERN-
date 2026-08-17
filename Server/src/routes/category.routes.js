const express = require("express");

const categoryController = require("../controllers/category.controller");
const authMiddleware = require("../middleware/auth.middleware");

const {
  validateCreateCategory,
  validateUpdateCategory,
} = require("../middleware/category.validation");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  validateCreateCategory,
  categoryController.createCategory
);

router.get(
  "/",
  authMiddleware,
  categoryController.getCategories
);

router.patch(
  "/:categoryId",
  authMiddleware,
  validateUpdateCategory,
  categoryController.updateCategory
);

router.delete(
  "/:categoryId",
  authMiddleware,
  categoryController.deleteCategory
);

module.exports = router;
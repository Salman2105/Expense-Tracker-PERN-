const express = require("express");
const transactionController = require("../controllers/transaction.controller");
const authMiddleware = require("../middleware/auth.middleware");
const {
  validateCreateTransaction,
} = require("../middleware/transaction.validation");
const {
  validateUpdateTransaction,
  validateGetTransactions,
} = require("../validations/transaction.validator");
const router = express.Router();

router.post(
  "/",
  authMiddleware,
  validateCreateTransaction,
  transactionController.createTransaction
);

router.get(
  "/",
  authMiddleware,
  transactionController.getUserTransactions
);

router.get(
  "/:transactionId",
  authMiddleware,
  transactionController.getTransactionById
);

router.patch(
  "/:transactionId",
  authMiddleware,
  validateUpdateTransaction,
  transactionController.updateTransaction
);

router.delete(
  "/:transactionId",
  authMiddleware,
  transactionController.deleteTransaction
);

module.exports = router;
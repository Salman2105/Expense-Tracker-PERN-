
const express = require("express");

const {
  getAccountStatus,
  deleteAccount,
} = require("../controllers/account.controller");

const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/status", authMiddleware, getAccountStatus);
router.delete("/", authMiddleware, deleteAccount);

module.exports = router;

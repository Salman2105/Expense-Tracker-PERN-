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

router.get(
  "/me",
  authMiddleware,
  getMyProfile
);

router.patch(
  "/me",
  authMiddleware,
  validateUpdateProfile,
  updateMyProfile
);

router.patch(
  "/me/password",
  authMiddleware,
  validateChangePassword,
  changePassword
);

module.exports = router;
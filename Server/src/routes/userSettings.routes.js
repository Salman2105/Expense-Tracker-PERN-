const express = require("express");
// const validateSettings = require("../validators/settings.validator");

const {
  getMySettings,
  createMySettings,
  updateMySettings,
} = require("../controllers/userSettings.controller");

const authMiddleware = require("../middleware/auth.middleware");

const {
  validateUserSettings,
} = require("../middleware/userSettings.validation");

const router = express.Router();

router.get(
  "/me/settings",
  authMiddleware,
  getMySettings
);

router.post(
  "/me/settings",
  authMiddleware,
  validateUserSettings,
  createMySettings
);

router.patch(
  "/me/settings",
  authMiddleware,
  validateUserSettings,
  updateMySettings
);

module.exports = router;
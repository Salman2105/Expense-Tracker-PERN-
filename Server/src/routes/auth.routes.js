const express = require("express");
const authController = require("../controllers/auth.controller");
const authenticate = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authenticate, authController.getMe);
router.post("/logout", authenticate, authController.logout);

router.get("/protected", authenticate, (req, res) => {
  res.status(200).json({
    message: "You are authenticated",
    userId: req.user.id,
  });
});

module.exports = router;
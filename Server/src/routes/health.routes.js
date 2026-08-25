const express = require("express");
const healthController = require("../controllers/health.controller");

const router = express.Router();

router.get("/", healthController.getStatus);
router.get("/db-check", healthController.getDbCheck);

module.exports = router;

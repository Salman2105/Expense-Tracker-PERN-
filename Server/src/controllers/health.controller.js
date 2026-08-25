const prisma = require("../../config/prisma");

/**
 * GET /
 */
const getStatus = (req, res) => {
  res.json({
    message: "Expense Tracker API is running",
  });
};

/**
 * GET /db-check
 */
const getDbCheck = async (req, res) => {
  try {
    const usersCount = await prisma.user.count();

    res.json({
      ok: true,
      usersCount,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
};

module.exports = {
  getStatus,
  getDbCheck,
};

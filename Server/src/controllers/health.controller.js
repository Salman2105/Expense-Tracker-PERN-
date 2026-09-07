const userRepository = require("../repositories/user.repository");

/**
 * GET /
 */
const getStatus = (req, res) => {
  res.json({
    message: "Expense Tracker API is running",
  });
};

const getHealth = (req, res) => {
  res.json({
    success: true,
    message: "API is healthy",
  });
};

/**
 * GET /db-check
 */
const getDbCheck = async (req, res) => {
  try {
    const usersCount = await userRepository.count();

    res.json({
      ok: true,
      usersCount,
    });
  } catch {
    res.status(500).json({
      ok: false,
      error: "Database check failed",
    });
  }
};

module.exports = {
  getStatus,
  getHealth,
  getDbCheck,
};

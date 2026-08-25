const userRepository = require("../repositories/user.repository");

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
    const usersCount = await userRepository.count();

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

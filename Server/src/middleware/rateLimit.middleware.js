const rateLimit = require("express-rate-limit");

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,

  message: {
    success: false,
    message: "Too many authentication requests. Please try again later.",
  },

  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authRateLimiter,
};
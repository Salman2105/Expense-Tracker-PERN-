const rateLimit = require("express-rate-limit");
const env = require("../../config/env");

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 
  max: 10,

  message: {
    success: false,
    message: "Too many authentication requests. Please try again later.",
  },

  standardHeaders: true,
  legacyHeaders: false,

  // The automated test suite exercises register/login far more than any
  // real client would within one window; rate limiting stays fully active
  // in development and production.
  skip: () => env.nodeEnv === "test",
});

const passwordResetRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many password reset requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.nodeEnv === "test",
});

module.exports = {
  authRateLimiter,
  passwordResetRateLimiter,
};
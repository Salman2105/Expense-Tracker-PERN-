const env = require("../../config/env");
const jwt = require("jsonwebtoken");

const generateToken = (userId, username, email) => {
  return jwt.sign(
    {
      userId,
      username,
      email,
    },
    env.jwtSecret,
    {
      expiresIn: "1d",
    }
  );
};

module.exports = {
  generateToken,
};
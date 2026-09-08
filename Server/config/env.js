const dotenv = require("dotenv");

dotenv.config();

const requiredEnv = [
  "DATABASE_URL",
  "JWT_SECRET",
];

for (const envName of requiredEnv) {
  if (!process.env[envName]) {
    throw new Error(`Missing required environment variable: ${envName}`);
  }
}

if (process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters long");
}

// Browsers send the Origin header without a trailing slash. A CLIENT_URL
// pasted with one (e.g. "https://app.onrender.com/") would never match and
// every CORS preflight would fail, so normalize it here.
const normalizeOrigin = (url) => url.replace(/\/+$/, "");

const env = {
  nodeEnv: process.env.NODE_ENV || "development",

  port: Number(process.env.PORT) || 3000,

  clientUrl: normalizeOrigin(
    process.env.CLIENT_URL || "http://localhost:5173"
  ),

  frontendUrl: normalizeOrigin(
    process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:5173"
  ),

  passwordResetTokenExpiresMinutes: Number(
    process.env.PASSWORD_RESET_TOKEN_EXPIRES_MINUTES
  ) || 30,

  databaseUrl: process.env.DATABASE_URL,

  jwtSecret: process.env.JWT_SECRET,

  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  logLevel: process.env.LOG_LEVEL || "info",

  email: {
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === "true",
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM,
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
};

module.exports = env;
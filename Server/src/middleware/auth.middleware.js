const env = require("../../config/env");
const jwt = require("jsonwebtoken");
const prisma = require("../../config/prisma");
const { validate: isValidUuid } = require("uuid");
const { errorResponse } = require("../utils/response.util");

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (typeof authHeader !== "string") {
      return errorResponse(res, 401, "Authentication token is required");
    }

    // 2. Extract token
    const bearerMatch = authHeader.match(/^Bearer\s+(\S+)$/i);

    if (!bearerMatch) {
      return errorResponse(res, 401, "Authentication token is required");
    }

    const token = bearerMatch[1];

    // A JWT must contain exactly three non-empty segments.
    if (token.split(".").length !== 3) {
      return errorResponse(res, 401, "Invalid authentication token");
    }

    // 3. Verify JWT
    const decoded = jwt.verify(
      token,
      env.jwtSecret
    );

    // 4. Make sure JWT contains a userId
    if (!decoded || !decoded.userId) {
      return errorResponse(res, 401, "Invalid authentication token");
    }

    // 5. Validate userId UUID
    if (!isValidUuid(decoded.userId)) {
      return errorResponse(res, 401, "Invalid authentication token");
    }

    // 6. Find authenticated user
    const user = await prisma.user.findUnique({
      where: {
        userId: decoded.userId,
      },
      select: {
        userId: true,
        username: true,
        email: true,
        status: true,
        deletedAt: true,
      },
    });

    // 7. User must exist
    if (!user) {
      return errorResponse(res, 401, "User not found");
    }

    // 8. Deleted account check
    if (user.deletedAt) {
      return errorResponse(res, 403, "Account has been deleted");
    }

    // 9. Suspended account check
    if (user.status === "SUSPENDED") {
      return errorResponse(res, 403, "Account is suspended");
    }

    // 10. Attach authenticated user
    req.user = {
      id: user.userId,
      userId: user.userId,
      username: user.username,
      email: user.email,
      status: user.status,
    };

    // 11. Continue
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);

    // Invalid JWT
    if (error.name === "JsonWebTokenError") {
      return errorResponse(res, 401, "Invalid authentication token");
    }

    // Expired JWT
    if (error.name === "TokenExpiredError") {
      return errorResponse(res, 401, "Authentication token has expired");
    }

    // JWT not active yet
    if (error.name === "NotBeforeError") {
      return errorResponse(res, 401, "Authentication token is not active");
    }

    // Unexpected server/database error
    return errorResponse(res, 500, "Authentication failed");
  }
};

module.exports = authMiddleware;


const jwt = require("jsonwebtoken");
const prisma = require("../../config/prisma");

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required",
      });
    }

    const token = authHeader.split(" ")[1];

    // 2. Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Find user
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

    // 4. User must exist
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // 5. Deleted account check
    if (user.deletedAt) {
      return res.status(403).json({
        success: false,
        message: "Account has been deleted",
      });
    }

    // 6. Suspended account check
    if (user.status === "SUSPENDED") {
      return res.status(403).json({
        success: false,
        message: "Account is suspended",
      });
    }

    // 7. Attach authenticated user to request
    req.user = {
      id: user.userId,
      userId: user.userId,
      username: user.username,
      email: user.email,
      status: user.status,
    };

    // 8. Continue
    next();
  } catch (error) {
    console.error("Authentication error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Authentication token has expired",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

module.exports = authMiddleware;


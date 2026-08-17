
const prisma = require("../../config/prisma");
const accountService = require("../services/account.service");

// GET /api/account/status
const getAccountStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: {
        userId,
      },
      select: {
        userId: true,
        username: true,
        email: true,
        status: true,
        deletedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        status: user.status,
        deletedAt: user.deletedAt,
      },
    });
  } catch (error) {
    console.error("Get account status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve account status",
    });
  }
};

// DELETE /api/account
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: {
        userId,
      },
      select: {
        userId: true,
        email: true,
        status: true,
        deletedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Account has already been deleted
    if (user.deletedAt) {
      return res.status(400).json({
        success: false,
        message: "Account has already been deleted",
      });
    }

    // Suspended accounts cannot be deleted by the user
    if (user.status === "SUSPENDED") {
      return res.status(403).json({
        success: false,
        message: "Suspended accounts cannot be deleted",
      });
    }

    const deletedAt = new Date();

    // Free the original email for future registration
    
const mangledUsername =
  `deleted_${user.userId}_${deletedAt.getTime()}`;

const mangledEmail =
  `deleted_${user.userId}_${deletedAt.getTime()}@deleted.local`;

const deletedUser = await prisma.user.update({
  where: {
    userId,
  },
  data: {
    username: mangledUsername,
    email: mangledEmail,
    deletedAt,
  },
  select: {
    userId: true,
    deletedAt: true,
  },
});


    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
      data: deletedUser,
    });
  } catch (error) {
    console.error("Delete account error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete account",
    });
  }
};

module.exports = {
  getAccountStatus,
  deleteAccount,
};


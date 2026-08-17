const userService = require("../services/user.service");

const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await userService.getUserProfile(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get user profile",
    });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { username, profilePicture } = req.body;

    const updatedUser = await userService.updateUserProfile(userId, {
      username,
      profilePicture,
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    // Prisma unique constraint violation
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Username is already taken",
      });
    }

    // User does not exist
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update user profile",
    });
  }
};
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;

    const { currentPassword, newPassword } = req.body;

    await userService.changeUserPassword(
      userId,
      currentPassword,
      newPassword
    );

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);

    if (error.code === "INVALID_CURRENT_PASSWORD") {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    if (error.code === "USER_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  changePassword,
};
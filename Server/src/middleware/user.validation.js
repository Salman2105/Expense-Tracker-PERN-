const validateUpdateProfile = (req, res, next) => {
  const { username, profilePicture } = req.body;

  // At least one field must be provided
  if (username === undefined && profilePicture === undefined) {
    return res.status(400).json({
      success: false,
      message: "At least one profile field is required",
    });
  }

  // Validate username
  if (username !== undefined) {
    if (typeof username !== "string") {
      return res.status(400).json({
        success: false,
        message: "Username must be a string",
      });
    }

    const trimmedUsername = username.trim();

    if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
      return res.status(400).json({
        success: false,
        message: "Username must be between 3 and 30 characters",
      });
    }

    req.body.username = trimmedUsername;
  }

  // Validate profile picture
  if (profilePicture !== undefined && profilePicture !== null) {
    if (typeof profilePicture !== "string") {
      return res.status(400).json({
        success: false,
        message: "Profile picture must be a string or null",
      });
    }

    if (profilePicture.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Profile picture cannot be empty",
      });
    }

    req.body.profilePicture = profilePicture.trim();
  }

  next();
};
const validateChangePassword = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // Both passwords are required
  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Current password and new password are required",
    });
  }

  // Passwords must be strings
  if (
    typeof currentPassword !== "string" ||
    typeof newPassword !== "string"
  ) {
    return res.status(400).json({
      success: false,
      message: "Passwords must be strings",
    });
  }

  // New password length
  if (newPassword.length < 8 || newPassword.length > 100) {
    return res.status(400).json({
      success: false,
      message: "New password must be between 8 and 100 characters",
    });
  }

  // New password must be different
  if (currentPassword === newPassword) {
    return res.status(400).json({
      success: false,
      message: "New password must be different from current password",
    });
  }

  next();
};

module.exports = {
   validateUpdateProfile,
   validateChangePassword,
};
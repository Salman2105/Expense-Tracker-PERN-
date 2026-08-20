/**
 * Validate PATCH /me
 */
const validateUpdateProfile = (req, res, next) => {
  // Request body must be a valid object
  if (
    !req.body ||
    typeof req.body !== "object" ||
    Array.isArray(req.body)
  ) {
    return res.status(400).json({
      success: false,
      message: "Request body must be a valid JSON object",
    });
  }

  const { username, profilePicture } = req.body;

  // Only these fields are allowed
  const allowedFields = ["username", "profilePicture"];

  const providedFields = Object.keys(req.body);

  const unexpectedFields = providedFields.filter(
    (field) => !allowedFields.includes(field)
  );

  if (unexpectedFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Unexpected field: ${unexpectedFields[0]}`,
    });
  }

  // At least one field must be provided
  if (
    username === undefined &&
    profilePicture === undefined
  ) {
    return res.status(400).json({
      success: false,
      message: "At least one profile field is required",
    });
  }

  /**
   * Validate username
   */
  if (username !== undefined) {
    if (typeof username !== "string") {
      return res.status(400).json({
        success: false,
        message: "Username must be a string",
      });
    }

    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      return res.status(400).json({
        success: false,
        message: "Username cannot be empty",
      });
    }

    if (
      trimmedUsername.length < 3 ||
      trimmedUsername.length > 30
    ) {
      return res.status(400).json({
        success: false,
        message: "Username must be between 3 and 30 characters",
      });
    }

    // Same username rules used during registration
    const usernameRegex = /^[a-zA-Z0-9_.-]+$/;

    if (!usernameRegex.test(trimmedUsername)) {
      return res.status(400).json({
        success: false,
        message:
          "Username may only contain letters, numbers, underscores, dots and hyphens",
      });
    }

    req.body.username = trimmedUsername;
  }

  /**
   * Validate profile picture
   */
  if (profilePicture !== undefined) {
    // null is allowed to remove profile picture
    if (profilePicture === null) {
      req.body.profilePicture = null;
    } else {
      if (typeof profilePicture !== "string") {
        return res.status(400).json({
          success: false,
          message: "Profile picture must be a string or null",
        });
      }

      const trimmedProfilePicture =
        profilePicture.trim();

      if (!trimmedProfilePicture) {
        return res.status(400).json({
          success: false,
          message: "Profile picture cannot be empty",
        });
      }

      if (trimmedProfilePicture.length > 2048) {
        return res.status(400).json({
          success: false,
          message:
            "Profile picture must not exceed 2048 characters",
        });
      }

      req.body.profilePicture =
        trimmedProfilePicture;
    }
  }

  next();
};

/**
 * Validate PATCH /me/password
 */
const validateChangePassword = (req, res, next) => {
  // Request body must be a valid object
  if (
    !req.body ||
    typeof req.body !== "object" ||
    Array.isArray(req.body)
  ) {
    return res.status(400).json({
      success: false,
      message: "Request body must be a valid JSON object",
    });
  }

  const {
    currentPassword,
    newPassword,
  } = req.body;

  // Only expected fields are allowed
  const allowedFields = [
    "currentPassword",
    "newPassword",
  ];

  const providedFields = Object.keys(req.body);

  const unexpectedFields = providedFields.filter(
    (field) => !allowedFields.includes(field)
  );

  if (unexpectedFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Unexpected field: ${unexpectedFields[0]}`,
    });
  }

  // Required fields
  if (
    currentPassword === undefined ||
    currentPassword === null ||
    currentPassword === ""
  ) {
    return res.status(400).json({
      success: false,
      message: "Current password is required",
    });
  }

  if (
    newPassword === undefined ||
    newPassword === null ||
    newPassword === ""
  ) {
    return res.status(400).json({
      success: false,
      message: "New password is required",
    });
  }

  // Data types
  if (typeof currentPassword !== "string") {
    return res.status(400).json({
      success: false,
      message: "Current password must be a string",
    });
  }

  if (typeof newPassword !== "string") {
    return res.status(400).json({
      success: false,
      message: "New password must be a string",
    });
  }

  // Reject whitespace-only passwords
  if (!currentPassword.trim()) {
    return res.status(400).json({
      success: false,
      message: "Current password cannot be empty",
    });
  }

  if (!newPassword.trim()) {
    return res.status(400).json({
      success: false,
      message: "New password cannot be empty",
    });
  }

  // Current password maximum length
  if (currentPassword.length > 128) {
    return res.status(400).json({
      success: false,
      message:
        "Current password must not exceed 128 characters",
    });
  }

  // New password length
  if (
    newPassword.length < 8 ||
    newPassword.length > 128
  ) {
    return res.status(400).json({
      success: false,
      message:
        "New password must be between 8 and 128 characters",
    });
  }

  // New password must be different
  if (currentPassword === newPassword) {
    return res.status(400).json({
      success: false,
      message:
        "New password must be different from current password",
    });
  }

  next();
};

module.exports = {
  validateUpdateProfile,
  validateChangePassword,
};
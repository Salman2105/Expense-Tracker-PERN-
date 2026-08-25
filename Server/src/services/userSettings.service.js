const { validate: isValidUuid } = require("uuid");
const AppError = require("../utils/AppError");
const userSettingsRepository = require("../repositories/userSettings.repository");

/**
 * Validate authenticated user ID.
 */
const validateUserId = (userId) => {
  if (!userId || typeof userId !== "string" || !isValidUuid(userId)) {
    throw new AppError("Invalid user ID", 400, "INVALID_USER_ID");
  }
};

/**
 * Get settings for authenticated user.
 */
const getUserSettings = async (userId) => {
  validateUserId(userId);

  return userSettingsRepository.findByUserId(userId);
};

/**
 * Create settings for authenticated user.
 */
const createUserSettings = async (
  userId,
  data = {}
) => {
  validateUserId(userId);

  try {
    return await userSettingsRepository.create({
      userId,

      theme:
        data.theme !== undefined
          ? data.theme
          : "SYSTEM",

      preferredCurrency:
        data.preferredCurrency !== undefined
          ? data.preferredCurrency
          : "PKR",

      language:
        data.language !== undefined
          ? data.language
          : "en",

      ...(data.emailNotifications !== undefined && {
        emailNotifications:
          data.emailNotifications,
      }),

      ...(data.budgetAlerts !== undefined && {
        budgetAlerts:
          data.budgetAlerts,
      }),
    });
  } catch (error) {
    if (error?.code === "P2002") {
      throw new AppError(
        "User settings already exist",
        409,
        "SETTINGS_ALREADY_EXIST"
      );
    }

    throw error;
  }
};

/**
 * Update settings for authenticated user.
 */
const updateUserSettings = async (
  userId,
  data
) => {
  validateUserId(userId);

  const updateData = {};

  if (data.theme !== undefined) {
    updateData.theme = data.theme;
  }

  if (data.preferredCurrency !== undefined) {
    updateData.preferredCurrency =
      data.preferredCurrency;
  }

  if (data.language !== undefined) {
    updateData.language = data.language;
  }

  if (data.emailNotifications !== undefined) {
    updateData.emailNotifications =
      data.emailNotifications;
  }

  if (data.budgetAlerts !== undefined) {
    updateData.budgetAlerts =
      data.budgetAlerts;
  }

  try {
    return await userSettingsRepository.update(userId, updateData);
  } catch (error) {
    if (error?.code === "P2025") {
      throw new AppError(
        "User settings not found",
        404,
        "SETTINGS_NOT_FOUND"
      );
    }

    throw error;
  }
};

module.exports = {
  getUserSettings,
  createUserSettings,
  updateUserSettings,
};

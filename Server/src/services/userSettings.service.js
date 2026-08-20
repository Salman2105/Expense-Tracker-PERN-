const prisma = require("../../config/prisma");
const { validate: isValidUuid } = require("uuid");

/**
 * Validate authenticated user ID.
 */
const validateUserId = (userId) => {
  if (!userId || typeof userId !== "string") {
    const error = new Error("Invalid user ID");
    error.code = "INVALID_USER_ID";
    throw error;
  }

  if (!isValidUuid(userId)) {
    const error = new Error("Invalid user ID");
    error.code = "INVALID_USER_ID";
    throw error;
  }
};

/**
 * Get settings for authenticated user.
 */
const getUserSettings = async (userId) => {
  validateUserId(userId);

  return prisma.userSettings.findUnique({
    where: {
      userId,
    },
  });
};

/**
 * Create settings for authenticated user.
 */
const createUserSettings = async (
  userId,
  data = {}
) => {
  validateUserId(userId);

  return prisma.userSettings.create({
    data: {
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
    },
  });
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

  return prisma.userSettings.update({
    where: {
      userId,
    },
    data: updateData,
  });
};

module.exports = {
  getUserSettings,
  createUserSettings,
  updateUserSettings,
};
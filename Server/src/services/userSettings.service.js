const prisma = require("../../config/prisma");

const getUserSettings = async (userId) => {
  return await prisma.userSettings.findUnique({
    where: {
      userId,
    },
  });
};

const createUserSettings = async (userId, data = {}) => {
  return await prisma.userSettings.create({
    data: {
      userId,
      theme: data.theme || "SYSTEM",
      preferredCurrency: data.preferredCurrency || "USD",
      language: data.language || "en",
    },
  });
};

const updateUserSettings = async (userId, data) => {
  const updateData = {};

  if (data.theme !== undefined) {
    const theme = String(data.theme).trim().toUpperCase();

    if (!["LIGHT", "DARK", "SYSTEM"].includes(theme)) {
      throw new Error("Invalid theme value. Allowed values: LIGHT, DARK, SYSTEM");
    }

    updateData.theme = theme;
  }

  if (data.preferredCurrency !== undefined) {
    updateData.preferredCurrency = data.preferredCurrency;
  }

  if (data.language !== undefined) {
    updateData.language = data.language;
  }

  if (data.emailNotifications !== undefined) {
    updateData.emailNotifications = Boolean(data.emailNotifications);
  }

  if (data.budgetAlerts !== undefined) {
    updateData.budgetAlerts = Boolean(data.budgetAlerts);
  }

  return await prisma.userSettings.update({
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
const prisma = require("../../config/prisma");

const getUserSettings = async (userId) => {
  return await prisma.userSettings.findUnique({
    where: {
      userId,
    },
  });
};

const createUserSettings = async (userId, data) => {
  return await prisma.userSettings.create({
    data: {
      userId,
      theme: data.theme,
      preferredCurrency: data.preferredCurrency || "USD",
      language: data.language || "en",
    },
  });
};

const updateUserSettings = async (userId, data) => {
  const updateData = {};

  if (data.theme !== undefined) {
    updateData.theme = data.theme;
  }

  if (data.preferredCurrency !== undefined) {
    updateData.preferredCurrency = data.preferredCurrency;
  }

  if (data.language !== undefined) {
    updateData.language = data.language;
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
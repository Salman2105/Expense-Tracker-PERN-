const userSettingsService = require("../services/userSettings.service");

const getMySettings = async (req, res) => {
  try {
    const userId = req.user.id;

    const settings = await userSettingsService.getUserSettings(userId);

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "User settings not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Get settings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get user settings",
    });
  }
};

const createMySettings = async (req, res) => {
  try {
    const userId = req.user.id;

    const settings = await userSettingsService.createUserSettings(
      userId,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "User settings created successfully",
      data: settings,
    });
  } catch (error) {
    console.error("Create settings error:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "User settings already exist",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create user settings",
    });
  }
};

const updateMySettings = async (req, res) => {
  try {
    const userId = req.user.id;

    const settings = await userSettingsService.updateUserSettings(
      userId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "User settings updated successfully",
      data: settings,
    });
  } catch (error) {
    console.error("Update settings error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "User settings not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update user settings",
    });
  }
};

module.exports = {
  getMySettings,
  createMySettings,
  updateMySettings,
};
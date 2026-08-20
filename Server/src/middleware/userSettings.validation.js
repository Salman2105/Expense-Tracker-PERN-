const allowedFields = [
  "theme",
  "preferredCurrency",
  "language",
  "emailNotifications",
  "budgetAlerts",
];

const validThemes = ["LIGHT", "DARK", "SYSTEM"];

const validateUserSettings = (req, res, next) => {
  const settings = req.body;

  // Request body must be a valid object
  if (
    !settings ||
    typeof settings !== "object" ||
    Array.isArray(settings)
  ) {
    return res.status(400).json({
      success: false,
      message: "Settings data must be a valid JSON object",
    });
  }

  const fields = Object.keys(settings);

  // Empty body is not allowed
  if (fields.length === 0) {
    return res.status(400).json({
      success: false,
      message: "At least one setting is required",
    });
  }

  // Reject unexpected fields
  const invalidFields = fields.filter(
    (field) => !allowedFields.includes(field)
  );

  if (invalidFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Invalid settings field(s): ${invalidFields.join(", ")}`,
    });
  }

  /**
   * Theme validation
   */
  if (settings.theme !== undefined) {
    if (typeof settings.theme !== "string") {
      return res.status(400).json({
        success: false,
        message: "Theme must be a string",
      });
    }

    const normalizedTheme =
      settings.theme.trim().toUpperCase();

    if (!validThemes.includes(normalizedTheme)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid theme value. Allowed values: LIGHT, DARK, SYSTEM",
      });
    }

    settings.theme = normalizedTheme;
  }

  /**
   * Preferred currency validation
   */
  if (settings.preferredCurrency !== undefined) {
    if (
      typeof settings.preferredCurrency !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Preferred currency must be a string",
      });
    }

    const currency =
      settings.preferredCurrency.trim().toUpperCase();

    if (!currency) {
      return res.status(400).json({
        success: false,
        message: "Preferred currency cannot be empty",
      });
    }

    // ISO-style 3-letter currency code
    if (!/^[A-Z]{3}$/.test(currency)) {
      return res.status(400).json({
        success: false,
        message:
          "Preferred currency must be a valid 3-letter currency code",
      });
    }

    settings.preferredCurrency = currency;
  }

  /**
   * Language validation
   */
  if (settings.language !== undefined) {
    if (typeof settings.language !== "string") {
      return res.status(400).json({
        success: false,
        message: "Language must be a string",
      });
    }

    const language = settings.language.trim();

    if (!language) {
      return res.status(400).json({
        success: false,
        message: "Language cannot be empty",
      });
    }

    if (language.length > 10) {
      return res.status(400).json({
        success: false,
        message:
          "Language must not exceed 10 characters",
      });
    }

    // Example accepted values: en, ur, en-US, ur-PK
    if (!/^[a-zA-Z]{2,3}(-[a-zA-Z]{2,4})?$/.test(language)) {
      return res.status(400).json({
        success: false,
        message: "Invalid language format",
      });
    }

    settings.language = language;
  }

  /**
   * Boolean settings
   */
  if (settings.emailNotifications !== undefined) {
    if (
      typeof settings.emailNotifications !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email notifications must be a boolean",
      });
    }
  }

  if (settings.budgetAlerts !== undefined) {
    if (typeof settings.budgetAlerts !== "boolean") {
      return res.status(400).json({
        success: false,
        message:
          "Budget alerts must be a boolean",
      });
    }
  }

  next();
};

module.exports = {
  validateUserSettings,
};
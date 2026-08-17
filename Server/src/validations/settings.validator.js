const validateSettings = (req, res, next) => {
  const { preferredCurrency, theme } = req.body;

  // Check for unsupported fields
  const allowedFields = ["preferredCurrency", "theme"];

  const invalidFields = Object.keys(req.body).filter(
    (field) => !allowedFields.includes(field)
  );

  if (invalidFields.length > 0) {
    return res.status(400).json({
      message: "Invalid settings field(s)",
      fields: invalidFields,
    });
  }

  // Validate preferred currency
  if (
    preferredCurrency !== undefined &&
    (typeof preferredCurrency !== "string" ||
      preferredCurrency.trim().length !== 3)
  ) {
    return res.status(400).json({
      message: "preferredCurrency must be a 3-letter currency code",
    });
  }

  // Validate theme
  const validThemes = ["LIGHT", "DARK", "SYSTEM"];

  if (theme !== undefined && !validThemes.includes(theme)) {
    return res.status(400).json({
      message: "theme must be LIGHT, DARK, or SYSTEM",
    });
  }

  next();
};

module.exports = validateSettings;
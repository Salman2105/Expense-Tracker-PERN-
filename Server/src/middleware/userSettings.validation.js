const allowedFields = [
  "theme",
  "preferredCurrencyId",
];

const validateUserSettings = (req, res, next) => {
  const settings = req.body;

  if (
    !settings ||
    typeof settings !== "object" ||
    Array.isArray(settings)
  ) {
    return res.status(400).json({
      success: false,
      message: "Settings data must be a valid object",
    });
  }

  const fields = Object.keys(settings);

  if (fields.length === 0) {
    return res.status(400).json({
      success: false,
      message: "At least one setting is required",
    });
  }

  const invalidFields = fields.filter(
    (field) => !allowedFields.includes(field)
  );

  if (invalidFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Invalid settings field(s): ${invalidFields.join(", ")}`,
    });
  }

  next();
};

module.exports = {
  validateUserSettings,
};
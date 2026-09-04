const multer = require("multer");
const AppError = require("../utils/AppError");

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new AppError("Only JPG, PNG, and WEBP images are allowed", 400, "INVALID_IMAGE_TYPE"));
      return;
    }

    callback(null, true);
  },
}).single("image");

const uploadProfilePicture = (req, res, next) => {
  upload(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      next(new AppError("Profile picture must be 5 MB or smaller", 400, "IMAGE_TOO_LARGE"));
      return;
    }

    next(error);
  });
};

module.exports = uploadProfilePicture;
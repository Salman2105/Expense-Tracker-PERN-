const { cloudinary, isConfigured } = require("../../config/cloudinary");
const AppError = require("../utils/AppError");

const uploadProfilePicture = (buffer, userId) => {
  if (!isConfigured) {
    throw new AppError(
      "Profile picture upload is not configured",
      503,
      "UPLOAD_NOT_CONFIGURED"
    );
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "expense-tracker/profile-pictures",
        public_id: `${userId}-${Date.now()}`,
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(new AppError("Profile picture upload failed", 502, "UPLOAD_FAILED"));
          return;
        }

        resolve(result.secure_url);
      }
    );

    uploadStream.end(buffer);
  });
};

const deleteProfilePicture = async (secureUrl) => {
  if (!isConfigured || !secureUrl) return;

  const uploadPath = secureUrl.split("/upload/")[1];
  if (!uploadPath) return;

  const publicId = uploadPath
    .replace(/^v\d+\//, "")
    .replace(/\.[a-zA-Z0-9]+$/, "");

  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
};

module.exports = { uploadProfilePicture, deleteProfilePicture };
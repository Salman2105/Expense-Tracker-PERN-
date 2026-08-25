const prisma = require("../../config/prisma");
const bcrypt = require("bcrypt");
const { BCRYPT_SALT_ROUNDS } = require("../constants");
const AppError = require("../utils/AppError");

const getUserProfile = async (userId) => {
  return await prisma.user.findUnique({
    where: {
      userId,
    },
    select: {
      userId: true,
      username: true,
      email: true,
      profilePicture: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

const updateUserProfile = async (userId, data) => {
  const updateData = {};

  /**
   * Profile picture
   *
   * Validation middleware should already validate this,
   * but the service still avoids storing undefined values.
   */
  if (data.profilePicture) {
    updateData.profilePicture = data.profilePicture || null;
  }

  /**
   * Prevent empty PATCH requests from reaching Prisma.
   */
  if (Object.keys(updateData).length === 0) {
    throw new AppError(
      "At least one profile field must be provided",
      400,
      "EMPTY_UPDATE"
    );
  }

  try {
    return await prisma.user.update({
      where: {
        userId,
      },
      data: updateData,
      select: {
        userId: true,
        username: true,
        email: true,
        profilePicture: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } catch (error) {
    if (error?.code === "P2002") {
      throw new AppError(
        "Username is already taken",
        409,
        "USERNAME_ALREADY_TAKEN"
      );
    }

    if (error?.code === "P2025") {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    throw error;
  }
};

const changeUserPassword = async (
  userId,
  currentPassword,
  newPassword
) => {
  const user = await prisma.user.findUnique({
    where: {
      userId,
    },
    select: {
      passwordHash: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  /**
   * Verify current password.
   */
  const isPasswordCorrect = await bcrypt.compare(
    currentPassword,
    user.passwordHash
  );

  if (!isPasswordCorrect) {
    throw new AppError(
      "Current password is incorrect",
      400,
      "INVALID_CURRENT_PASSWORD"
    );
  }

  /**
   * Prevent reusing the same password.
   */
  const isSamePassword = await bcrypt.compare(
    newPassword,
    user.passwordHash
  );

  if (isSamePassword) {
    throw new AppError(
      "New password must be different from current password",
      400,
      "SAME_PASSWORD"
    );
  }

  /**
   * Hash new password.
   */
  const newPasswordHash = await bcrypt.hash(
    newPassword,
    BCRYPT_SALT_ROUNDS
  );

  /**
   * Update password.
   */
  await prisma.user.update({
    where: {
      userId,
    },
    data: {
      passwordHash: newPasswordHash,
    },
  });
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
};

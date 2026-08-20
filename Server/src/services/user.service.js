const prisma = require("../../config/prisma");
const bcrypt = require("bcrypt");

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
  if (data.profilePicture !== undefined) {
    updateData.profilePicture =
      data.profilePicture === null
        ? null
        : data.profilePicture.trim();
  }

  /**
   * Prevent empty PATCH requests from reaching Prisma.
   */
  if (Object.keys(updateData).length === 0) {
    const error = new Error(
      "At least one profile field must be provided"
    );

    error.code = "EMPTY_UPDATE";

    throw error;
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
      const prismaError = new Error(
        "Username is already taken"
      );

      prismaError.code = "P2002";

      throw prismaError;
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
    const error = new Error("User not found");

    error.code = "USER_NOT_FOUND";

    throw error;
  }

  /**
   * Verify current password.
   */
  const isPasswordCorrect = await bcrypt.compare(
    currentPassword,
    user.passwordHash
  );

  if (!isPasswordCorrect) {
    const error = new Error(
      "Current password is incorrect"
    );

    error.code = "INVALID_CURRENT_PASSWORD";

    throw error;
  }

  /**
   * Prevent reusing the same password.
   */
  const isSamePassword = await bcrypt.compare(
    newPassword,
    user.passwordHash
  );

  if (isSamePassword) {
    const error = new Error(
      "New password must be different from current password"
    );

    error.code = "SAME_PASSWORD";

    throw error;
  }

  /**
   * Hash new password.
   */
  const newPasswordHash = await bcrypt.hash(
    newPassword,
    12
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
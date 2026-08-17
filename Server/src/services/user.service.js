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

  if (data.username !== undefined) {
    updateData.username = data.username;
  }

  if (data.profilePicture !== undefined) {
    updateData.profilePicture = data.profilePicture;
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
      const prismaError = new Error("Username is already taken");
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

  const isPasswordCorrect = await bcrypt.compare(
    currentPassword,
    user.passwordHash
  );

  if (!isPasswordCorrect) {
    const error = new Error("Current password is incorrect");
    error.code = "INVALID_CURRENT_PASSWORD";
    throw error;
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 12);

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
  changeUserPassword
};
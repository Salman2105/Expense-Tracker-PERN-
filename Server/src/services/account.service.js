const crypto = require("crypto");
const prisma = require("../../config/prisma");

const createEmailHash = (email) => {
  return crypto
    .createHash("sha256")
    .update(email.trim().toLowerCase(), "utf8")
    .digest("hex");
};

const deleteAccount = async (userId) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      email: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const originalEmailHash = createEmailHash(user.email);

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      originalEmailHash,
      deletedAt: new Date(),
    },
  });

  return {
    message: "Account scheduled for deletion",
  };
};

module.exports = {
  deleteAccount,
};
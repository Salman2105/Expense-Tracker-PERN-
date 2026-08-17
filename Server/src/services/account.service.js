const crypto = require("crypto");
const prisma = require("../../config/prisma");

const createEmailHash = (email) => {
  if (!email || typeof email !== "string") {
    throw new Error("Valid email is required to create hash");
  }

  return crypto
    .createHash("sha256")
    .update(email.trim().toLowerCase(), "utf8")
    .digest("hex");
};

const deleteAccount = async (userId) => {
  const user = await prisma.user.findUnique({
    where: {
      userId,
    },
    select: {
      email: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const deletedAt = new Date();
  const originalEmailHash = createEmailHash(user.email);
  const mangledUsername = `deleted_${userId}_${deletedAt.getTime()}`;
  const mangledEmail = `deleted_${userId}_${deletedAt.getTime()}@deleted.local`;

  const deletedUser = await prisma.user.update({
    where: {
      userId,
    },
    data: {
      username: mangledUsername,
      email: mangledEmail,
      originalEmailHash,
      deletedAt,
    },
    select: {
      userId: true,
      deletedAt: true,
      originalEmailHash: true,
    },
  });

  return {
    success: true,
    message: "Account deleted successfully",
    data: deletedUser,
  };
};

const anonymizeAccount = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const anonymizedUser = await prisma.user.update({
    where: { userId },
    data: {
      username: `deleted_${userId}`,
      email: `deleted_${userId}@deleted.local`,
      passwordHash: "DELETED",
      profilePicture: null,
      originalEmailHash: null,
    },
  });

  return anonymizedUser;
};

const getAccountsEligibleForCleanup = async () => {
  const retentionDate = new Date();
  retentionDate.setDate(retentionDate.getDate() - 30);

  return prisma.user.findMany({
    where: {
      deletedAt: {
        not: null,
        lte: retentionDate,
      },
    },
    select: {
      userId: true,
      email: true,
      originalEmailHash: true,
      deletedAt: true,
    },
  });
};

const logCleanupResult = (result) => {
  const timestamp = new Date().toISOString();

  if (result.status === "DELETED") {
    console.log(
      `[ACCOUNT CLEANUP] ${timestamp} | userId=${result.userId} | status=DELETED`
    );
  } else {
    console.error(
      `[ACCOUNT CLEANUP] ${timestamp} | userId=${result.userId} | status=FAILED | error=${result.error}`
    );
  }
};

const processEligibleAccounts = async () => {
  const eligibleAccounts = await getAccountsEligibleForCleanup();

  const summary = {
    found: eligibleAccounts.length,
    deleted: 0,
    failed: 0,
    results: [],
  };

  for (const account of eligibleAccounts) {
    try {
      await anonymizeAccount(account.userId);

      const deleteResult = await hardDeleteAccount(account.userId);

      logCleanupResult(deleteResult);

      summary.deleted++;

      summary.results.push(deleteResult);
    } catch (error) {
      const failedResult = {
        userId: account.userId,
        status: "FAILED",
        error: error.message,
      };

      logCleanupResult(failedResult);

      summary.failed++;

      summary.results.push(failedResult);
    }
  }

  return summary;
};

const hardDeleteAccount = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Safety check:
  // Only accounts that have already been anonymized
  // can be permanently deleted.
  if (
    user.email !== `deleted_${userId}@deleted.local` ||
    user.originalEmailHash !== null
  ) {
    throw new Error("Account has not been anonymized");
  }

  await prisma.user.delete({
    where: { userId },
  });

  return {
    userId,
    status: "DELETED",
  };
};


module.exports = {
  deleteAccount,
  createEmailHash,
  getAccountsEligibleForCleanup,
  anonymizeAccount,
  processEligibleAccounts,
  hardDeleteAccount,
};

processEligibleAccounts()
  .then((results) => {
    console.log("Cleanup results:", results);
  })
  .catch((error) => {
    console.error("Cleanup failed:", error);
  });

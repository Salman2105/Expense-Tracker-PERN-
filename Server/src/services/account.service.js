const crypto = require("crypto");
const { validate: isValidUuid } = require("uuid");
const { ACCOUNT_RETENTION_DAYS } = require("../constants");
const AppError = require("../utils/AppError");
const userRepository = require("../repositories/user.repository");

/**
 * Validate account user ID.
 *
 * This is defensive validation.
 * Normally the ID comes from auth.middleware.js.
 */
const validateUserId = (userId) => {
  if (!userId || typeof userId !== "string" || !isValidUuid(userId)) {
    throw new AppError("Invalid user ID", 400, "INVALID_USER_ID");
  }
};

/**
 * Create SHA-256 hash of original email.
 */
const createEmailHash = (email) => {
  if (!email || typeof email !== "string") {
    throw new Error(
      "Valid email is required to create hash"
    );
  }

  return crypto
    .createHash("sha256")
    .update(
      email.trim().toLowerCase(),
      "utf8"
    )
    .digest("hex");
};

/**
 * Get an account's status (used by GET /api/account/status).
 */
const getAccountStatus = async (userId) => {
  validateUserId(userId);

  const user = await userRepository.findAccountStatusById(userId);

  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  return {
    status: user.status,
    deletedAt: user.deletedAt,
  };
};

/**
 * Soft-delete an account.
 *
 * The original email is hashed for retention/audit purposes.
 * The email and username are then mangled so the original
 * values can be used again for a future registration.
 */
const deleteAccount = async (userId) => {
  validateUserId(userId);

  const user = await userRepository.findDeletionEligibilityById(userId);

  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  if (user.deletedAt) {
    throw new AppError(
      "Account has already been deleted",
      400,
      "ACCOUNT_ALREADY_DELETED"
    );
  }

  if (user.status === "SUSPENDED") {
    throw new AppError(
      "Suspended accounts cannot be deleted",
      403,
      "ACCOUNT_SUSPENDED"
    );
  }

  const deletedAt = new Date();

  const timestamp = deletedAt.getTime();

  const originalEmailHash = createEmailHash(
    user.email
  );

  const mangledUsername =
    `deleted_${userId}_${timestamp}`;

  const mangledEmail =
    `deleted_${userId}_${timestamp}@deleted.local`;

  const deletedUser = await userRepository.applySoftDelete(userId, {
    username: mangledUsername,
    email: mangledEmail,
    originalEmailHash,
    deletedAt,
  });

  return {
    success: true,
    message: "Account deleted successfully",
    data: deletedUser,
  };
};

/**
 * Find accounts that have passed the 30-day retention period.
 */
const getAccountsEligibleForCleanup = async () => {
  const retentionDate = new Date();

  retentionDate.setDate(
    retentionDate.getDate() - ACCOUNT_RETENTION_DAYS
  );

  return userRepository.findEligibleForCleanup(retentionDate);
};

/**
 * Anonymize an account before permanent deletion.
 */
const anonymizeAccount = async (userId) => {
  validateUserId(userId);

  const user = await userRepository.findAnonymizationFields(userId);

  if (!user) {
    throw new Error("User not found");
  }

  /**
   * Safety check:
   * Only deleted accounts can be anonymized.
   */
  if (!user.deletedAt) {
    throw new Error(
      "Account has not been deleted"
    );
  }

  await userRepository.anonymize(userId, {
    username: `deleted_${userId}`,
    email: `deleted_${userId}@deleted.local`,
    passwordHash: "DELETED",
    profilePicture: null,
    originalEmailHash: null,
  });

  return {
    success: true,
    userId,
    status: "ANONYMIZED",
  };
};

/**
 * Permanently delete an anonymized account.
 */
const hardDeleteAccount = async (userId) => {
  validateUserId(userId);

  const user = await userRepository.findAnonymizationFields(userId);

  if (!user) {
    throw new Error("User not found");
  }

  /**
   * Safety check:
   * The account must have been soft-deleted first.
   */
  if (!user.deletedAt) {
    throw new Error(
      "Account has not been deleted"
    );
  }

  /**
   * Safety check:
   * Only anonymized accounts may be permanently deleted.
   */
  if (
    user.email !==
      `deleted_${userId}@deleted.local` ||
    user.originalEmailHash !== null
  ) {
    throw new Error(
      "Account has not been anonymized"
    );
  }

  await userRepository.deleteById(userId);

  return {
    userId,
    status: "DELETED",
  };
};

/**
 * Log cleanup result.
 */
const logCleanupResult = (result) => {
  const timestamp =
    new Date().toISOString();

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

/**
 * Process all accounts eligible for permanent cleanup.
 */
const processEligibleAccounts = async () => {
  const eligibleAccounts =
    await getAccountsEligibleForCleanup();

  const summary = {
    found: eligibleAccounts.length,
    deleted: 0,
    failed: 0,
    results: [],
  };

  for (const account of eligibleAccounts) {
    try {
      await anonymizeAccount(
        account.userId
      );

      const deleteResult =
        await hardDeleteAccount(
          account.userId
        );

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

      summary.results.push(
        failedResult
      );
    }
  }

  return summary;
};

module.exports = {
  getAccountStatus,
  deleteAccount,
  createEmailHash,
  getAccountsEligibleForCleanup,
  anonymizeAccount,
  processEligibleAccounts,
  hardDeleteAccount,
};

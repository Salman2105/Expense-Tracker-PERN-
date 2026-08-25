const prisma = require("../../config/prisma");

/**
 * User repository — every Prisma call against the `User` model lives here.
 * Services/middleware/controllers call these functions instead of talking
 * to Prisma directly.
 *
 * Every function accepts an optional `client` (defaulting to the shared
 * Prisma singleton) so callers that need multiple writes to be atomic can
 * pass a `prisma.$transaction(async (tx) => ...)` transaction client
 * through instead.
 */

const PROFILE_SELECT = {
  userId: true,
  username: true,
  email: true,
  profilePicture: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

/**
 * Existence check used during registration — email path.
 */
const findUserIdByEmail = (email, client = prisma) =>
  client.user.findUnique({
    where: { email },
    select: { userId: true },
  });

/**
 * Existence check used during registration — username path.
 */
const findUserIdByUsername = (username, client = prisma) =>
  client.user.findUnique({
    where: { username },
    select: { userId: true },
  });

/**
 * Create a new user (registration).
 */
const create = (data, client = prisma) =>
  client.user.create({
    data,
    select: {
      userId: true,
      username: true,
      email: true,
      status: true,
      deletedAt: true,
      createdAt: true,
    },
  });

/**
 * Full user record by email, used for login (needs passwordHash, status,
 * deletedAt — everything).
 */
const findByEmail = (email, client = prisma) =>
  client.user.findUnique({
    where: { email },
  });

/**
 * Minimal status fields for GET /api/account/status.
 */
const findAccountStatusById = (userId, client = prisma) =>
  client.user.findUnique({
    where: { userId },
    select: { userId: true, status: true, deletedAt: true },
  });

/**
 * Fields needed to decide whether an account is eligible for soft delete.
 */
const findDeletionEligibilityById = (userId, client = prisma) =>
  client.user.findUnique({
    where: { userId },
    select: { email: true, status: true, deletedAt: true },
  });

/**
 * Apply a soft delete (mangle username/email, stamp deletedAt).
 */
const applySoftDelete = (userId, data, client = prisma) =>
  client.user.update({
    where: { userId },
    data,
    select: { userId: true, deletedAt: true, originalEmailHash: true },
  });

/**
 * Soft-deleted accounts past the retention window, for the cleanup job.
 */
const findEligibleForCleanup = (retentionDate, client = prisma) =>
  client.user.findMany({
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

/**
 * Fields needed by the anonymize/hard-delete safety checks.
 */
const findAnonymizationFields = (userId, client = prisma) =>
  client.user.findUnique({
    where: { userId },
    select: {
      userId: true,
      email: true,
      originalEmailHash: true,
      deletedAt: true,
    },
  });

/**
 * Overwrite PII with anonymized placeholders (pre permanent deletion).
 */
const anonymize = (userId, data, client = prisma) =>
  client.user.update({
    where: { userId },
    data,
  });

/**
 * Permanently delete a user row.
 */
const deleteById = (userId, client = prisma) =>
  client.user.delete({
    where: { userId },
  });

/**
 * Profile fields for GET /api/users/me.
 */
const findProfileById = (userId, client = prisma) =>
  client.user.findUnique({
    where: { userId },
    select: PROFILE_SELECT,
  });

/**
 * Update editable profile fields, returning the same shape as
 * findProfileById.
 */
const updateProfile = (userId, data, client = prisma) =>
  client.user.update({
    where: { userId },
    data,
    select: PROFILE_SELECT,
  });

/**
 * Just the password hash, for password-change verification.
 */
const findPasswordHashById = (userId, client = prisma) =>
  client.user.findUnique({
    where: { userId },
    select: { passwordHash: true },
  });

/**
 * Overwrite the stored password hash.
 */
const updatePasswordHash = (userId, passwordHash, client = prisma) =>
  client.user.update({
    where: { userId },
    data: { passwordHash },
  });

/**
 * Fields needed by GET /api/auth/me (includes deletedAt, unlike
 * findProfileById — this endpoint's response shape has always included it).
 */
const findAuthProfileById = (userId, client = prisma) =>
  client.user.findUnique({
    where: { userId },
    select: {
      userId: true,
      username: true,
      email: true,
      profilePicture: true,
      status: true,
      deletedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

/**
 * Fields needed by auth.middleware.js to authorize a request.
 */
const findAuthContextById = (userId, client = prisma) =>
  client.user.findUnique({
    where: { userId },
    select: {
      userId: true,
      username: true,
      email: true,
      status: true,
      deletedAt: true,
    },
  });

/**
 * Total user count, used by the /db-check health endpoint.
 */
const count = (client = prisma) => client.user.count();

module.exports = {
  findUserIdByEmail,
  findUserIdByUsername,
  create,
  findByEmail,
  findAccountStatusById,
  findDeletionEligibilityById,
  applySoftDelete,
  findEligibleForCleanup,
  findAnonymizationFields,
  anonymize,
  deleteById,
  findProfileById,
  updateProfile,
  findPasswordHashById,
  updatePasswordHash,
  findAuthProfileById,
  findAuthContextById,
  count,
};

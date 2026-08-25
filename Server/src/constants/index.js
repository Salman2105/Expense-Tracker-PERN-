/**
 * Shared, genuinely cross-cutting constants. Domain-specific magic numbers
 * that only ever appear in one file (e.g. a single validator's field-length
 * bound) are left where they're used — this module is only for values that
 * were previously duplicated across multiple files.
 */

// Same value the Prisma `TransactionType`/`CategoryType` enums encode
// (prisma/schema.prisma); duplicated here as a plain array since both types
// share this exact set of values across services/validators.
const TRANSACTION_TYPES = ["INCOME", "EXPENSE"];

// bcrypt.hash() cost factor. Previously 10 at registration and 12 at
// password change with no explanation for the difference; unified on the
// stronger value. Existing password hashes remain valid — bcrypt encodes
// its own cost factor in the hash string, so this only affects newly
// hashed passwords going forward.
const BCRYPT_SALT_ROUNDS = 12;

// Hard cap applied to any client-supplied `limit`/pagination size.
const MAX_PAGE_SIZE = 100;

// Number of days a soft-deleted account is retained before the cleanup job
// permanently deletes it.
const ACCOUNT_RETENTION_DAYS = 30;

module.exports = {
  TRANSACTION_TYPES,
  BCRYPT_SALT_ROUNDS,
  MAX_PAGE_SIZE,
  ACCOUNT_RETENTION_DAYS,
};

const prisma = require("../../config/prisma");

/**
 * UserSettings repository — every Prisma call against the `UserSettings`
 * model lives here. See user.repository.js for the `client` parameter
 * convention.
 */

/**
 * A user's settings, or null if they haven't been created yet.
 */
const findByUserId = (userId, client = prisma) =>
  client.userSettings.findUnique({
    where: { userId },
  });

/**
 * Create a user's settings row.
 */
const create = (data, client = prisma) =>
  client.userSettings.create({
    data,
  });

/**
 * Update a user's settings row.
 */
const update = (userId, data, client = prisma) =>
  client.userSettings.update({
    where: { userId },
    data,
  });

module.exports = {
  findByUserId,
  create,
  update,
};

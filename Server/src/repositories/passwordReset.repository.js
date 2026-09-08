const prisma = require("../../config/prisma");

const deleteByUserId = (userId, client = prisma) =>
  client.passwordResetToken.deleteMany({ where: { userId } });

const create = (data, client = prisma) =>
  client.passwordResetToken.create({ data });

const findValidByHash = (tokenHash, now = new Date(), client = prisma) =>
  client.passwordResetToken.findFirst({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: { gt: now },
    },
    include: { user: true },
  });

const markUsed = (id, usedAt, client = prisma) =>
  client.passwordResetToken.update({ where: { id }, data: { usedAt } });

const deleteExpired = (now = new Date(), client = prisma) =>
  client.passwordResetToken.deleteMany({ where: { expiresAt: { lte: now } } });

module.exports = {
  deleteByUserId,
  create,
  findValidByHash,
  markUsed,
  deleteExpired,
};
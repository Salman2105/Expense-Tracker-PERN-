const bcrypt = require("bcrypt");
const crypto = require("crypto");

const { generateToken } = require("../utils/jwt");
const { BCRYPT_SALT_ROUNDS } = require("../constants");
const env = require("../../config/env");
const prisma = require("../../config/prisma");
const emailService = require("./email.service");
const passwordResetRepository = require("../repositories/passwordReset.repository");
const userRepository = require("../repositories/user.repository");
const logger = require("../utils/logger");

const PASSWORD_RESET_MESSAGE = "If an account exists with this email, a password reset link has been sent.";

const hashResetToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

/**
 * Register a new user
 */
const registerUser = async ({ username, email, password }) => {
  // Normalize values
  const normalizedUsername = username.trim();
  const normalizedEmail = email.trim().toLowerCase();

  /**
   * Check whether email already exists
   */
  const existingEmailUser = await userRepository.findUserIdByEmail(
    normalizedEmail
  );

  if (existingEmailUser) {
    return {
      success: false,
      message: "Email is already registered",
    };
  }

  /**
   * Check whether username already exists
   */
  const existingUsernameUser = await userRepository.findUserIdByUsername(
    normalizedUsername
  );

  if (existingUsernameUser) {
    return {
      success: false,
      message: "Username is already taken",
    };
  }

  /**
   * Hash password
   */
  const passwordHash = await bcrypt.hash(
    password,
    BCRYPT_SALT_ROUNDS
  );

  /**
   * Create user
   */
  try {
    const user = await userRepository.create({
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash,
      status: "ACTIVE",
      deletedAt: null,
    });

    return user;
  } catch (error) {
    /**
     * Handle Prisma unique constraint race conditions.
     *
     * Even after checking email/username above,
     * another request could create the same value
     * between the check and create operation.
     */
    if (error.code === "P2002") {
      const target = error.meta?.target;

      if (
        Array.isArray(target) &&
        target.includes("email")
      ) {
        return {
          success: false,
          message: "Email is already registered",
        };
      }

      if (
        Array.isArray(target) &&
        target.includes("username")
      ) {
        return {
          success: false,
          message: "Username is already taken",
        };
      }
    }

    throw error;
  }
};

/**
 * Login user
 */
const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  /**
   * Find user
   */
  const user = await userRepository.findByEmail(normalizedEmail);

  /**
   * Do not reveal whether the email exists.
   */
  if (!user) {
    return {
      success: false,
      message: "Invalid email or password",
    };
  }

  /**
   * Prevent deleted accounts from logging in.
   */
  if (user.deletedAt) {
    return {
      success: false,
      message: "Account has been deleted",
    };
  }

  /**
   * Prevent suspended accounts from logging in.
   */
  if (user.status === "SUSPENDED") {
    return {
      success: false,
      message: "Account is suspended",
    };
  }

  /**
   * Compare password with stored hash.
   */
  const isPasswordValid = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!isPasswordValid) {
    return {
      success: false,
      message: "Invalid email or password",
    };
  }

  /**
   * Generate JWT.
   */
  const token = generateToken(user.userId, user.username, user.email);

  /**
   * Never return passwordHash.
   */
  return {
    token,
    user: {
      userId: user.userId,
      username: user.username,
      email: user.email,
      status: user.status,
    },
  };
};

const requestPasswordReset = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await userRepository.findByEmail(normalizedEmail);

  if (!user || user.deletedAt || user.status !== "ACTIVE") {
    return PASSWORD_RESET_MESSAGE;
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashResetToken(rawToken);
  const expiresAt = new Date(
    Date.now() + env.passwordResetTokenExpiresMinutes * 60 * 1000
  );

  await prisma.$transaction(async (tx) => {
    await passwordResetRepository.deleteByUserId(user.userId, tx);
    await passwordResetRepository.create({
      userId: user.userId,
      tokenHash,
      expiresAt,
    }, tx);
  });

  const resetUrl = `${env.frontendUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;
  try {
    await emailService.sendEmail({
      to: user.email,
      subject: "Reset your Expense Tracker password",
      text: [
        "Reset your password",
        "",
        "We received a request to reset your Expense Tracker password.",
        `Use this link to create a new password: ${resetUrl}`,
        `This link will expire in ${env.passwordResetTokenExpiresMinutes} minutes.`,
        "If you did not request a password reset, you can safely ignore this email.",
      ].join("\n"),
      html: `<h1>Reset your password</h1><p>We received a request to reset your Expense Tracker password.</p><p><a href="${resetUrl}">Reset Password</a></p><p>This link will expire in ${env.passwordResetTokenExpiresMinutes} minutes.</p><p>If you did not request a password reset, you can safely ignore this email.</p>`,
    });
    logger.info("Password reset email sent", { userId: user.userId });
  } catch (error) {
    await passwordResetRepository.deleteByUserId(user.userId);
    logger.error("Password reset email delivery failed", {
      userId: user.userId,
      error: error.message,
    });
  }

  return PASSWORD_RESET_MESSAGE;
};

const resetPassword = async ({ token, password }) => {
  const tokenHash = hashResetToken(token);
  const now = new Date();
  const resetToken = await passwordResetRepository.findValidByHash(tokenHash, now);

  if (!resetToken || resetToken.user.deletedAt || resetToken.user.status !== "ACTIVE") {
    return { success: false, message: "Invalid or expired password reset token." };
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  try {
    await prisma.$transaction(async (tx) => {
      const claim = await tx.passwordResetToken.updateMany({
        where: {
          id: resetToken.id,
          usedAt: null,
          expiresAt: { gt: now },
        },
        data: { usedAt: now },
      });

      if (claim.count !== 1) {
        throw new Error("PASSWORD_RESET_TOKEN_INVALID");
      }

      await userRepository.updatePasswordHash(resetToken.userId, passwordHash, tx);
      await passwordResetRepository.deleteByUserId(resetToken.userId, tx);
    });
  } catch (error) {
    if (error.message === "PASSWORD_RESET_TOKEN_INVALID") {
      return { success: false, message: "Invalid or expired password reset token." };
    }
    throw error;
  }

  logger.info("Password reset completed", { userId: resetToken.userId });
  return { success: true };
};

module.exports = {
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPassword,
};

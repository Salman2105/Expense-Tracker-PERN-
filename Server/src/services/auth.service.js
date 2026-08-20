const bcrypt = require("bcrypt");

const prisma = require("../../config/prisma");
const { generateToken } = require("../utils/jwt");

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
  const existingEmailUser = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
    select: {
      userId: true,
    },
  });

  if (existingEmailUser) {
    return {
      success: false,
      message: "Email is already registered",
    };
  }

  /**
   * Check whether username already exists
   */
  const existingUsernameUser = await prisma.user.findUnique({
    where: {
      username: normalizedUsername,
    },
    select: {
      userId: true,
    },
  });

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
    10
  );

  /**
   * Create user
   */
  try {
    const user = await prisma.user.create({
      data: {
        username: normalizedUsername,
        email: normalizedEmail,
        passwordHash,
        status: "ACTIVE",
        deletedAt: null,
      },
      select: {
        userId: true,
        username: true,
        email: true,
        status: true,
        deletedAt: true,
        createdAt: true,
      },
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
  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

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

module.exports = {
  registerUser,
  loginUser,
};
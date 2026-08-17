const bcrypt = require("bcrypt");
const prisma = require("../../config/prisma");
const { generateToken } = require("../utils/jwt");


const registerUser = async ({ username, email, password }) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    return {
      success: false,
      message: "Email is already registered",
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      email,
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
};



const loginUser = async ({ email, password }) => {
  // 1. Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // 2. Don't reveal whether email exists
  if (!user) {
    return {
      success: false,
      message: "Invalid email or password",
    };
  }

  if (user.deletedAt) {
    return {
      success: false,
      message: "Account has been deleted",
    };
  }

  if (user.status === "SUSPENDED") {
    return {
      success: false,
      message: "Account is suspended",
    };
  }

  // 3. Compare entered password with hashed password
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

  // 4. Generate JWT
  const token = generateToken(user.userId);

  // 5. Don't return passwordHash
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
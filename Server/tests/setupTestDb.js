const prisma = require("../config/prisma");

/**
 * Cleans all app tables between test files so each test suite starts
 * from a known-empty state. Order matters because of FK constraints.
 */
const resetDatabase = async () => {
  await prisma.transaction.deleteMany();
  await prisma.category.deleteMany();
  await prisma.userSettings.deleteMany();
  await prisma.user.deleteMany();
};

beforeAll(async () => {
  try {
    await prisma.$connect();
  } catch (error) {
    console.error(
      "Could not connect to the test database. Is Postgres running and DATABASE_URL correct?",
      error.message
    );
    throw error;
  }
  await resetDatabase();
});

afterEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await prisma.$disconnect();
});

module.exports = { resetDatabase };

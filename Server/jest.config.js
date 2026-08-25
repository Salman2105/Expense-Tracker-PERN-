module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  setupFilesAfterEnv: ["<rootDir>/tests/setupTestDb.js"],
  testTimeout: 15000,
  forceExit: true,
  // `uuid@14` is ESM-only; Jest's CJS loader can't require() it the way
  // Node 22+ can natively. See tests/mocks/uuidShim.js for details.
  moduleNameMapper: {
    "^uuid$": "<rootDir>/tests/mocks/uuidShim.js",
  },
};

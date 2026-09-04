/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  // Each test seeds the emulator; give it room on slow CI runners.
  testTimeout: 30000,
}

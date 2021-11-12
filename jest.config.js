module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: "tests",
  testTimeout: 240000,
  setupFiles: ["../../packages/lambda/src/test/setup.ts"],
};

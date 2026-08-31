export default {
  testEnvironment: "node",
  transform: {},
  verbose: true,
  testMatch: ["**/tests/**/*.test.js"],
  collectCoverageFrom: [
    "routes/**/*.js",
    "middleware/**/*.js",
    "utils/**/*.js",
    "models/**/*.js",
    "server.js",
    "!**/node_modules/**"
  ]
};

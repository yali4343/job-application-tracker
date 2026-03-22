export default {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  collectCoverageFrom: ["src/**/*.js"],
  transform: {
    "^.+\\.js$": "babel-jest",
  },
};

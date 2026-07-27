// @ts-check
const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 45000,
  fullyParallel: false,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:8793",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npx serve . -l 8793",
    url: "http://localhost:8793",
    reuseExistingServer: true,
    timeout: 30000,
  },
});

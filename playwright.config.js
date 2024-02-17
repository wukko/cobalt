import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  testMatch: 'src/testPlaywright/**/*.spec.js',
  use: {
    // Base URL to use in actions like `await page.goto('/')`.
    baseURL: 'http://127.0.0.1:9001',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [{
    // Web
    command: 'webURL=http://localhost:9001 apiURL=http://localhost:9000 node src/cobalt.js',
    url: 'http://127.0.0.1:9001',
  }, {
    // API
    command: 'apiURL=http://localhost:9000 node src/cobalt.js',
    url: 'http://127.0.0.1:9000',
  }]
});

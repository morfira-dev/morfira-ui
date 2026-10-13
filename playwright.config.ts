import { defineConfig, devices } from '@playwright/test';
import process from 'node:process';

export default defineConfig({
  testDir: './tests/browser',
  snapshotPathTemplate: '{testDir}/__snapshots__/{testFilePath}/{platform}/{arg}{ext}',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  ...(process.env.CI ? { workers: 1 } : {}),
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.01,
      threshold: 0.2,
    },
  },
  use: {
    baseURL: 'http://127.0.0.1:4173/apps/playground-dom/',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: [
    {
      command: 'python3 -m http.server 4173',
      reuseExistingServer: true,
      url: 'http://127.0.0.1:4173/apps/playground-dom/',
    },
    {
      command: 'node scripts/serve-consumer-fixtures.mjs',
      reuseExistingServer: true,
      url: 'http://127.0.0.1:4174/react/',
    },
  ],
});

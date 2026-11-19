import { defineConfig, devices, type ReporterDescription } from '@playwright/test';
import { environment } from './src/config/environment';

const isCI = Boolean(process.env.CI);
// GitHub gets failure annotations and test-step output; local runs stay concise.
const terminalReporters: ReporterDescription[] = isCI
  ? [['github'], ['list', { printSteps: true }]]
  : [['list']];
const machineReadableReporters: ReporterDescription[] = process.env.GITHUB_ACTIONS
  ? [['json', { outputFile: 'test-results/playwright-results.json' }]]
  : [];

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : 1,
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  reporter: [
    ...terminalReporters,
    ...machineReadableReporters,
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  outputDir: 'test-results/artifacts',
  use: {
    baseURL: environment.baseUrl,
    actionTimeout: 10_000,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
  ],
});

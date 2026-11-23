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
const suiteLabels: Record<string, string> = {
  smoke: 'Smoke',
  sanity: 'Sanity',
  regression: 'Regression',
  e2e: 'End-to-end',
  'end-to-end': 'End-to-end',
  'regression-e2e': 'Regression + E2E',
  'regression + e2e': 'Regression + E2E',
  all: 'All suites',
  'all suites': 'All suites',
};
const browserLabels: Record<string, string> = {
  chromium: 'Chromium',
  edge: 'Microsoft Edge',
  'microsoft edge': 'Microsoft Edge',
  both: 'Chromium + Microsoft Edge',
  'all browsers': 'Chromium + Microsoft Edge',
  'chromium + microsoft edge': 'Chromium + Microsoft Edge',
};
const selectedSuite = process.env.TEST_SUITE?.toLowerCase() || 'all';
const selectedBrowser = process.env.TEST_BROWSER?.toLowerCase() || 'both';
const reportTitle = [
  'Playwright',
  suiteLabels[selectedSuite] ?? selectedSuite,
  browserLabels[selectedBrowser] ?? selectedBrowser,
  environment.name === 'local' ? 'Leap & Leash demo' : environment.name.toUpperCase(),
  process.env.GITHUB_RUN_NUMBER ? `Run #${process.env.GITHUB_RUN_NUMBER}` : 'Local run',
].join(' | ');

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
    ['html', { outputFolder: 'playwright-report', open: 'never', title: reportTitle }],
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
      name: 'Chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
  ],
});

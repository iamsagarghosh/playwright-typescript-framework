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
const isJenkins = Boolean(process.env.JENKINS_URL && process.env.BUILD_NUMBER);
const isGitHubActions = Boolean(process.env.GITHUB_ACTIONS);
const isAzurePipelines = Boolean(process.env.TF_BUILD);
const ciProvider = isJenkins
  ? 'Jenkins'
  : isGitHubActions
    ? 'GitHub Actions'
    : isAzurePipelines
      ? 'Azure Pipelines'
      : isCI
        ? 'CI'
        : 'Local';
const selectedSuite = process.env.TEST_SUITE?.toLowerCase() || 'all';
const selectedBrowser = process.env.TEST_BROWSER?.toLowerCase() || 'both';
const buildNumber =
  process.env.BUILD_NUMBER ?? process.env.GITHUB_RUN_NUMBER ?? process.env.BUILD_BUILDNUMBER;
const runLabel = buildNumber ? `${ciProvider} #${buildNumber}` : `${ciProvider} run`;
const branch =
  process.env.BRANCH_NAME ??
  process.env.GIT_BRANCH?.replace(/^origin\//, '') ??
  process.env.GITHUB_HEAD_REF ??
  process.env.GITHUB_REF_NAME ??
  process.env.BUILD_SOURCEBRANCH?.replace(/^refs\/heads\//, '');
const buildUrl =
  process.env.BUILD_URL ??
  (process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
    ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
    : undefined);
const reportMetadata = Object.fromEntries(
  Object.entries({
    'CI Provider': ciProvider,
    Job: process.env.JOB_NAME ?? process.env.GITHUB_WORKFLOW ?? process.env.SYSTEM_DEFINITIONNAME,
    'Build Number': buildNumber,
    'Build URL': buildUrl,
    Branch: branch,
    Commit: process.env.GIT_COMMIT ?? process.env.GITHUB_SHA ?? process.env.BUILD_SOURCEVERSION,
    Suite: suiteLabels[selectedSuite] ?? selectedSuite,
    Browser: browserLabels[selectedBrowser] ?? selectedBrowser,
    Environment: environment.name,
    Workers: process.env.TEST_WORKERS ?? (isCI ? '2' : '1'),
    Agent: process.env.NODE_NAME,
    'Node.js': process.version,
  }).filter((entry): entry is [string, string] => Boolean(entry[1])),
);
const reportTitle = [
  'Playwright',
  suiteLabels[selectedSuite] ?? selectedSuite,
  browserLabels[selectedBrowser] ?? selectedBrowser,
  environment.name === 'local' ? 'Leap & Leash demo' : environment.name.toUpperCase(),
  runLabel,
].join(' | ');

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : 1,
  timeout: 30_000,
  metadata: reportMetadata,
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

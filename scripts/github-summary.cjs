/* global console, process, require */

const fs = require('node:fs');
const path = require('node:path');

const reportPath = path.resolve('test-results/playwright-results.json');
const summaryPath = process.env.GITHUB_STEP_SUMMARY;
const artifactUrl = process.env.PLAYWRIGHT_ARTIFACT_URL;
const runUrl =
  process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
    ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
    : undefined;
const suiteLabels = {
  smoke: 'Smoke',
  sanity: 'Sanity',
  regression: 'Regression',
  e2e: 'End-to-end',
  'regression-e2e': 'Regression + E2E',
  'regression + e2e': 'Regression + E2E',
  all: 'All suites',
  'all suites': 'All suites',
};
const browserLabels = {
  chromium: 'Chromium',
  edge: 'Microsoft Edge',
  'microsoft edge': 'Microsoft Edge',
  both: 'Chromium + Microsoft Edge',
  'all browsers': 'Chromium + Microsoft Edge',
  'chromium + microsoft edge': 'Chromium + Microsoft Edge',
};
const environmentLabels = {
  local: 'Leap & Leash demo',
  qa: 'QA',
  staging: 'Staging',
  uat: 'UAT',
};
const eventLabels = {
  schedule: 'Scheduled',
  workflow_dispatch: 'Manual run',
  push: 'Push',
  pull_request: 'Pull request',
};
const resultLabels = {
  success: 'Passed',
  failure: 'Failed',
  cancelled: 'Cancelled',
};

function formatCell(value) {
  return String(value).replace(/[|\r\n]/g, (character) => (character === '|' ? '\\|' : ' '));
}

function displayLabel(value, labels, fallback = 'Not specified') {
  const key = String(value || '').toLowerCase();
  return labels[key] || value || fallback;
}

function formatDuration(durationMs) {
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

function collectProjectCounts(suites, counts = new Map()) {
  for (const suite of suites ?? []) {
    for (const spec of suite.specs ?? []) {
      for (const test of spec.tests ?? []) {
        const projectName = test.projectName || 'Unknown project';
        const projectCounts = counts.get(projectName) ?? {
          expected: 0,
          unexpected: 0,
          flaky: 0,
          skipped: 0,
          total: 0,
        };

        if (Object.hasOwn(projectCounts, test.status)) {
          projectCounts[test.status] += 1;
        }
        projectCounts.total += 1;
        counts.set(projectName, projectCounts);
      }
    }

    collectProjectCounts(suite.suites, counts);
  }

  return counts;
}

function buildSummary() {
  const lines = [
    '## Playwright test run',
    '',
    '### Run details',
    '',
    '| Detail | Value |',
    '| --- | --- |',
    `| Test suites | ${formatCell(displayLabel(process.env.TEST_SUITE, suiteLabels))} |`,
    `| Browsers | ${formatCell(displayLabel(process.env.TEST_BROWSER, browserLabels))} |`,
    `| Environment | ${formatCell(displayLabel(process.env.TEST_ENV, environmentLabels))} |`,
    `| Parallel workers | ${formatCell(process.env.TEST_WORKERS || 'Not specified')} |`,
    `| Run result | ${formatCell(displayLabel(process.env.PLAYWRIGHT_JOB_STATUS, resultLabels, 'Unknown'))} |`,
  ];

  const runMetadata = [
    ['Workflow', process.env.GITHUB_WORKFLOW],
    [
      'Run',
      process.env.GITHUB_RUN_NUMBER && runUrl
        ? `[${process.env.GITHUB_RUN_NUMBER}](${runUrl})`
        : undefined,
    ],
    ['Trigger', displayLabel(process.env.GITHUB_EVENT_NAME, eventLabels)],
    ['Branch', process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME],
    ['Commit', process.env.GITHUB_SHA?.slice(0, 7)],
  ];

  for (const [label, value] of runMetadata) {
    if (value) {
      lines.push(`| ${label} | ${formatCell(value)} |`);
    }
  }

  lines.push('');

  if (!fs.existsSync(reportPath)) {
    lines.push('Test counts are unavailable because Playwright did not produce a JSON report.');
  } else {
    try {
      const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      const stats = report.stats;

      if (!stats) {
        throw new Error('The Playwright JSON report did not contain run statistics.');
      }

      const total = stats.expected + stats.unexpected + stats.flaky + stats.skipped;
      lines.push(
        '### Test results',
        '',
        `**${total} test cases** completed in ${formatDuration(stats.duration)}.`,
        '',
        '| Passed | Failed | Flaky | Skipped | Total |',
        '| ---: | ---: | ---: | ---: | ---: |',
        `| ${stats.expected} | ${stats.unexpected} | ${stats.flaky} | ${stats.skipped} | ${total} |`,
        '',
        '### Results by browser',
        '',
        '| Browser | Passed | Failed | Flaky | Skipped | Total |',
        '| --- | ---: | ---: | ---: | ---: | ---: |',
      );

      for (const [projectName, counts] of collectProjectCounts(report.suites)) {
        lines.push(
          `| ${projectName} | ${counts.expected} | ${counts.unexpected} | ${counts.flaky} | ${counts.skipped} | ${counts.total} |`,
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Could not parse Playwright JSON results: ${message}`);
      lines.push(`Test counts are unavailable: ${message}`);
    }
  }

  lines.push('', '### Reports and failure artifacts', '');
  if (artifactUrl) {
    lines.push(
      `[Download the Playwright report and diagnostics artifact](${artifactUrl})`,
      '',
      'The artifact contains the HTML report, JUnit XML, Playwright JSON results, and available failure diagnostics.',
    );
  } else {
    lines.push(
      'No report artifact link is available. Check the artifact upload step in the workflow log.',
    );
  }
  lines.push('');

  return `${lines.join('\n')}\n`;
}

const summary = buildSummary();
console.log(summary);

if (summaryPath) {
  fs.appendFileSync(summaryPath, summary, 'utf8');
}

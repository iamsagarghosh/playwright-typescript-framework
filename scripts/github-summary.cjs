/* global console, process, require */

const fs = require('node:fs');
const path = require('node:path');

const reportPath = path.resolve('test-results/playwright-results.json');
const summaryPath = process.env.GITHUB_STEP_SUMMARY;
const artifactUrl = process.env.PLAYWRIGHT_ARTIFACT_URL;

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
    '## Playwright run summary',
    '',
    '| Selection | Value |',
    '| --- | --- |',
    `| Suite | ${process.env.TEST_SUITE || 'Not specified'} |`,
    `| Browser project(s) | ${process.env.TEST_BROWSER || 'Not specified'} |`,
    `| Environment | ${process.env.TEST_ENV || 'Not specified'} |`,
    `| Workers | ${process.env.TEST_WORKERS || 'Not specified'} |`,
    `| Job status | ${process.env.PLAYWRIGHT_JOB_STATUS || 'Unknown'} |`,
    '',
  ];

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
        `**${total} tests reported** in ${formatDuration(stats.duration)}.`,
        '',
        '| Passed | Failed | Flaky | Skipped | Total |',
        '| ---: | ---: | ---: | ---: | ---: |',
        `| ${stats.expected} | ${stats.unexpected} | ${stats.flaky} | ${stats.skipped} | ${total} |`,
        '',
        '### Results by browser project',
        '',
        '| Project | Passed | Failed | Flaky | Skipped | Total |',
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

  lines.push('', '### Reports and diagnostics', '');
  if (artifactUrl) {
    lines.push(`[Download the Playwright report and diagnostics artifact](${artifactUrl})`);
  } else {
    lines.push('No report artifact was uploaded for this run. Check the workflow log for details.');
  }
  lines.push(
    '',
    'The artifact contains the HTML report, JUnit XML, Playwright JSON results, and available failure diagnostics.',
    '',
  );

  return `${lines.join('\n')}\n`;
}

const summary = buildSummary();
console.log(summary);

if (summaryPath) {
  fs.appendFileSync(summaryPath, summary, 'utf8');
}

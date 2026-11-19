import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { TestLogger } from '../utils/logger';

interface FrameworkFixtures {
  homePage: HomePage;
  logger: TestLogger;
}

export const test = base.extend<FrameworkFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  // Playwright requires a destructured first argument even when this fixture has no dependencies.
  // eslint-disable-next-line no-empty-pattern
  logger: async ({}, use, testInfo) => {
    const logger = new TestLogger(testInfo.title);
    await use(logger);

    // Keep per-test execution notes in failure artifacts without cluttering passing reports.
    if (testInfo.status !== testInfo.expectedStatus && logger.hasEntries) {
      await testInfo.attach('execution-log.txt', {
        body: logger.toText(),
        contentType: 'text/plain',
      });
    }
  },
});

export { expect };

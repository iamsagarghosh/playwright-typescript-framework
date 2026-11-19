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
  logger: async (_fixtures, use, testInfo) => {
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

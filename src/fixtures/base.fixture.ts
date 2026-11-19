import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

interface FrameworkFixtures {
  homePage: HomePage;
}

export const test = base.extend<FrameworkFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
});

export { expect };

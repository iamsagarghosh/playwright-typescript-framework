import type { Locator, Page } from '@playwright/test';

export class ProductCardComponent {
  readonly locator: Locator;

  constructor(page: Page, productName: string) {
    this.locator = page.getByRole('button', {
      name: `View details for ${productName}`,
      exact: false,
    });
  }

  async openDetails(): Promise<void> {
    await this.locator.click();
  }
}

import type { Locator, Page } from '@playwright/test';

export class NavigationComponent {
  private readonly productsLink: Locator;

  constructor(page: Page) {
    this.productsLink = page.getByRole('link', { name: 'Products', exact: true });
  }

  async openProducts(): Promise<void> {
    await this.productsLink.click();
  }
}

import type { Locator, Page } from '@playwright/test';

export class ProductDetailsDialogComponent {
  private readonly dialog: Locator;

  constructor(page: Page) {
    this.dialog = page.getByRole('dialog');
  }

  get title(): Locator {
    return this.dialog.getByRole('heading');
  }

  async addToCart(): Promise<void> {
    await this.dialog.getByRole('button', { name: 'Add to cart', exact: true }).click();
  }

  priceByText(price: string): Locator {
    return this.dialog.getByText(price, { exact: true });
  }
}

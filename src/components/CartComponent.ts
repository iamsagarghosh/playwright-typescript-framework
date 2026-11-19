import type { Locator, Page } from '@playwright/test';

export class CartComponent {
  private readonly drawer: Locator;
  private readonly openCartButton: Locator;

  constructor(page: Page) {
    this.drawer = page.getByRole('complementary', { name: 'Shopping cart' });
    this.openCartButton = page.getByRole('button', { name: 'Open cart' });
  }

  get itemCount(): Locator {
    return this.openCartButton;
  }

  get heading(): Locator {
    return this.drawer.getByRole('heading', { name: 'Your Cart', exact: true });
  }

  item(productName: string): Locator {
    return this.drawer.getByText(productName, { exact: true });
  }

  quantityControl(productName: string): Locator {
    return this.drawer.getByLabel(`${productName} quantity`);
  }

  subtotal(amount: string): Locator {
    return this.drawer.getByText(amount, { exact: true });
  }

  async open(): Promise<void> {
    await this.openCartButton.click();
  }

  async goToCheckout(): Promise<void> {
    await this.drawer.getByRole('button', { name: 'Checkout', exact: true }).click();
  }

  async increaseQuantity(productName: string): Promise<void> {
    await this.quantityControl(productName).getByRole('button', { name: '+', exact: true }).click();
  }

  async decreaseQuantity(productName: string): Promise<void> {
    await this.quantityControl(productName).getByRole('button', { name: '-', exact: true }).click();
  }
}

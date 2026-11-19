import type { Locator, Page } from '@playwright/test';
import type { TestCustomerData } from '../data/testDataFactory';

export class CheckoutComponent {
  private readonly page: Page;
  private readonly region: Locator;

  constructor(page: Page) {
    this.page = page;
    this.region = page.getByRole('region', { name: 'Checkout' });
  }

  get heading(): Locator {
    return this.region.getByRole('heading', { name: 'Checkout', exact: true });
  }

  get recipientName(): Locator {
    return this.region.getByLabel('Recipient name');
  }

  get emailAddress(): Locator {
    return this.region.getByLabel('Email address');
  }

  get streetAddress(): Locator {
    return this.region.getByLabel('Street address');
  }

  get postalCode(): Locator {
    return this.region.getByLabel('ZIP code');
  }

  get city(): Locator {
    return this.region.getByLabel('City');
  }

  get country(): Locator {
    return this.region.getByLabel('Country');
  }

  get requiredAddressFields(): Locator[] {
    return [
      this.recipientName,
      this.emailAddress,
      this.streetAddress,
      this.postalCode,
      this.city,
      this.country,
    ];
  }

  get demoCardOption(): Locator {
    return this.region.getByRole('radio', { name: 'Demo card ending in 4242' });
  }

  get deliveryDetails(): Locator {
    return this.page.getByRole('region', { name: 'Delivery details' });
  }

  get orderSummary(): Locator {
    return this.page.getByRole('complementary', { name: 'Order summary' });
  }

  get confirmationHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Order confirmed', exact: true });
  }

  async fillAddress(customer: TestCustomerData): Promise<void> {
    await this.recipientName.fill(customer.fullName);
    await this.emailAddress.fill(customer.email);
    await this.streetAddress.fill(customer.streetAddress);
    await this.postalCode.fill(customer.postalCode);
    await this.city.fill(customer.city);
    await this.country.fill(customer.country);
  }

  async continueToPayment(): Promise<void> {
    await this.region.getByRole('button', { name: 'Continue to payment' }).click();
  }

  async selectDemoCard(): Promise<void> {
    await this.demoCardOption.check();
  }

  async reviewOrder(): Promise<void> {
    await this.region.getByRole('button', { name: 'Review order', exact: true }).click();
  }

  async placeDemoOrder(): Promise<void> {
    await this.region.getByRole('button', { name: 'Place order', exact: true }).click();
  }
}

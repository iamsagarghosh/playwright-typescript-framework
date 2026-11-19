import type { Locator, Page } from '@playwright/test';
import { CartComponent } from '../components/CartComponent';
import { CheckoutComponent } from '../components/CheckoutComponent';
import { NavigationComponent } from '../components/NavigationComponent';
import { ProductDetailsDialogComponent } from '../components/ProductDetailsDialogComponent';
import { ProductListingComponent } from '../components/ProductListingComponent';
import { SearchComponent } from '../components/SearchComponent';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly cart: CartComponent;
  readonly checkout: CheckoutComponent;
  readonly navigation: NavigationComponent;
  readonly productDetails: ProductDetailsDialogComponent;
  readonly products: ProductListingComponent;
  readonly search: SearchComponent;

  constructor(page: Page) {
    super(page);
    this.cart = new CartComponent(page);
    this.checkout = new CheckoutComponent(page);
    this.navigation = new NavigationComponent(page);
    this.productDetails = new ProductDetailsDialogComponent(page);
    this.products = new ProductListingComponent(page);
    this.search = new SearchComponent(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('./', { waitUntil: 'domcontentloaded' });
  }

  heroHeading(): Locator {
    return this.page.getByRole('heading', {
      name: 'Everything pets need, ready for the week ahead.',
      exact: true,
    });
  }
}

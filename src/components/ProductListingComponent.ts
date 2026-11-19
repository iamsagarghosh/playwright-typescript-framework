import type { Locator, Page } from '@playwright/test';
import { ProductCardComponent } from './ProductCardComponent';

export type ProductCategory = 'all' | 'dog' | 'cat' | 'small';
export type ProductSortOrder = 'featured' | 'price-low' | 'price-high';

export class ProductListingComponent {
  private readonly categoryFilter: Locator;
  private readonly sortControl: Locator;
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    this.categoryFilter = page.getByRole('combobox', { name: 'Filter products by category' });
    this.sortControl = page.getByRole('combobox', { name: 'Sort products' });
  }

  get heading(): Locator {
    return this.page.getByRole('heading', { name: 'All Products', exact: true });
  }

  get productCards(): Locator {
    return this.page.getByRole('button', { name: /^View details for / });
  }

  productCard(productName: string): ProductCardComponent {
    return new ProductCardComponent(this.page, productName);
  }

  async filterByCategory(category: ProductCategory): Promise<void> {
    await this.categoryFilter.selectOption(category);
  }

  async sortBy(order: ProductSortOrder): Promise<void> {
    await this.sortControl.selectOption(order);
  }
}

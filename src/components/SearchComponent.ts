import type { Locator, Page } from '@playwright/test';

export class SearchComponent {
  private readonly searchInput: Locator;

  constructor(page: Page) {
    this.searchInput = page.getByPlaceholder('Search food, toys, care');
  }

  async searchFor(query: string): Promise<void> {
    await this.searchInput.fill(query);
  }
}

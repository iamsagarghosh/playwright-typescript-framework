import { expect, test } from '../../src/fixtures/base.fixture';
import { testData } from '../../src/data/testData';

test(
  'Search returns the matching product',
  { tag: ['@smoke', '@sanity'] },
  async ({ homePage, logger }) => {
    await test.step('Open the storefront', async () => {
      await homePage.goto();
      await expect(homePage.heroHeading()).toBeVisible();
    });

    await test.step('Search the product catalog', async () => {
      logger.info(`Searching the catalog for "${testData.productSearch.query}".`);
      await homePage.search.searchFor(testData.productSearch.query);
    });

    await test.step('Verify matching and excluded products', async () => {
      await expect(
        homePage.products.productCard(testData.productSearch.expectedProduct).locator,
      ).toBeVisible();
      await expect(
        homePage.products.productCard(testData.productSearch.excludedProduct).locator,
      ).toHaveCount(0);
    });
  },
);

test(
  'Products navigation opens the product list',
  { tag: ['@smoke', '@sanity'] },
  async ({ homePage, page }) => {
    await test.step('Open the storefront and navigate to Products', async () => {
      await homePage.goto();
      await homePage.navigation.openProducts();
    });

    await test.step('Verify the product list is displayed', async () => {
      await expect(page).toHaveURL(/#products$/);
      await expect(homePage.products.heading).toBeInViewport();
    });
  },
);

test('Product card opens its details', { tag: '@smoke' }, async ({ homePage }) => {
  await test.step('Open the selected product details', async () => {
    await homePage.goto();
    await homePage.products.productCard('Tough Loop Rope Toy').openDetails();
  });

  await test.step('Verify the product name and price', async () => {
    await expect(homePage.productDetails.title).toHaveText('Tough Loop Rope Toy');
    await expect(homePage.productDetails.priceByText('$14.00')).toBeVisible();
  });
});

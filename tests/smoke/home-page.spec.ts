import { expect, test } from '../../src/fixtures/base.fixture';
import { testData } from '../../src/data/testData';

test('search shows the matching product @smoke @sanity', async ({ homePage, logger }) => {
  await homePage.goto();
  await expect(homePage.heroHeading()).toBeVisible();
  logger.info(`Searching the catalog for "${testData.productSearch.query}".`);
  await homePage.search.searchFor(testData.productSearch.query);

  await expect(
    homePage.products.productCard(testData.productSearch.expectedProduct).locator,
  ).toBeVisible();
  await expect(
    homePage.products.productCard(testData.productSearch.excludedProduct).locator,
  ).toHaveCount(0);
});

test('products navigation opens the product list @smoke @sanity', async ({ homePage, page }) => {
  await homePage.goto();
  await homePage.navigation.openProducts();

  await expect(page).toHaveURL(/#products$/);
  await expect(homePage.products.heading).toBeInViewport();
});

test('product card opens product details @smoke', async ({ homePage }) => {
  await homePage.goto();
  await homePage.products.productCard('Tough Loop Rope Toy').openDetails();

  await expect(homePage.productDetails.title).toHaveText('Tough Loop Rope Toy');
  await expect(homePage.productDetails.priceByText('$14.00')).toBeVisible();
});

import { expect, test } from '../../src/fixtures/base.fixture';

test('category filter limits the product cards @regression', async ({ homePage }) => {
  await homePage.goto();
  await homePage.products.filterByCategory('cat');

  await expect(homePage.products.productCards).toHaveCount(3);
  await expect(homePage.products.productCard('Window Perch Cat Tree').locator).toBeVisible();
  await expect(homePage.products.productCard('Tough Loop Rope Toy').locator).toHaveCount(0);
});

test('price sorting orders products from low to high @regression', async ({ homePage }) => {
  await homePage.goto();
  await homePage.products.sortBy('price-low');

  await expect(homePage.products.productCards.first()).toHaveAttribute(
    'aria-label',
    /^View details for Tuna Snap Treats,/,
  );
  await expect(homePage.products.productCards.last()).toHaveAttribute(
    'aria-label',
    /^View details for Window Perch Cat Tree,/,
  );
});

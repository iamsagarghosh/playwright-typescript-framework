import { expect, test } from '../../src/fixtures/base.fixture';

test(
  'Category filter shows only matching products',
  { tag: '@regression' },
  async ({ homePage }) => {
    await test.step('Filter the catalog to cat products', async () => {
      await homePage.goto();
      await homePage.products.filterByCategory('cat');
    });

    await test.step('Verify only matching category products remain', async () => {
      await expect(homePage.products.productCards).toHaveCount(3);
      await expect(homePage.products.productCard('Window Perch Cat Tree').locator).toBeVisible();
      await expect(homePage.products.productCard('Tough Loop Rope Toy').locator).toHaveCount(0);
    });
  },
);

test(
  'Ascending price sort lists products from lowest to highest',
  { tag: '@regression' },
  async ({ homePage }) => {
    await test.step('Sort the catalog by ascending price', async () => {
      await homePage.goto();
      await homePage.products.sortBy('price-low');
    });

    await test.step('Verify the first and last products are price ordered', async () => {
      await expect(homePage.products.productCards.first()).toHaveAttribute(
        'aria-label',
        /^View details for Tuna Snap Treats,/,
      );
      await expect(homePage.products.productCards.last()).toHaveAttribute(
        'aria-label',
        /^View details for Window Perch Cat Tree,/,
      );
    });
  },
);

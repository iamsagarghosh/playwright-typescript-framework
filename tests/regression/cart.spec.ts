import { expect, test } from '../../src/fixtures/base.fixture';
import { testData } from '../../src/data/testData';

const { productName, unitPrice, doubleQuantitySubtotal } = testData.cart;

test(
  'guest can add and remove a product from the cart',
  { tag: '@regression' },
  async ({ homePage }) => {
    await test.step('Add a product to the cart', async () => {
      await homePage.goto();
      await homePage.products.productCard(productName).openDetails();
      await homePage.productDetails.addToCart();
    });

    await test.step('Verify the cart item and quantity', async () => {
      await expect(homePage.cart.heading).toBeVisible();
      await expect(homePage.cart.itemCount).toContainText('1');
      await expect(homePage.cart.item(productName)).toBeVisible();
      await expect(homePage.cart.quantityControl(productName)).toContainText('1');
    });

    await test.step('Remove the product and verify the cart is empty', async () => {
      await homePage.cart.decreaseQuantity(productName);
      await expect(homePage.cart.item(productName)).toHaveCount(0);
      await expect(homePage.cart.itemCount).toContainText('0');
    });
  },
);

test(
  'guest can update the quantity of a cart item',
  { tag: '@regression' },
  async ({ homePage }) => {
    await test.step('Add a product and increase its quantity', async () => {
      await homePage.goto();
      await homePage.products.productCard(productName).openDetails();
      await homePage.productDetails.addToCart();
      await homePage.cart.increaseQuantity(productName);
    });

    await test.step('Verify the increased quantity and subtotal', async () => {
      await expect(homePage.cart.quantityControl(productName)).toContainText('2');
      await expect(homePage.cart.subtotal(doubleQuantitySubtotal)).toBeVisible();
    });

    await test.step('Decrease quantity and verify the updated subtotal', async () => {
      await homePage.cart.decreaseQuantity(productName);
      await expect(homePage.cart.quantityControl(productName)).toContainText('1');
      await expect(homePage.cart.subtotal(unitPrice)).toBeVisible();
    });
  },
);

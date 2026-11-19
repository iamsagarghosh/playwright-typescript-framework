import { expect, test } from '../../src/fixtures/base.fixture';
import { testData } from '../../src/data/testData';

const { productName, unitPrice, doubleQuantitySubtotal } = testData.cart;

test('guest can add and remove a product from the cart @regression', async ({ homePage }) => {
  await homePage.goto();
  await homePage.products.productCard(productName).openDetails();
  await homePage.productDetails.addToCart();

  await expect(homePage.cart.heading).toBeVisible();
  await expect(homePage.cart.itemCount).toContainText('1');
  await expect(homePage.cart.item(productName)).toBeVisible();
  await expect(homePage.cart.quantityControl(productName)).toContainText('1');

  await homePage.cart.decreaseQuantity(productName);

  await expect(homePage.cart.item(productName)).toHaveCount(0);
  await expect(homePage.cart.itemCount).toContainText('0');
});

test('guest can update the quantity of a cart item @regression', async ({ homePage }) => {
  await homePage.goto();
  await homePage.products.productCard(productName).openDetails();
  await homePage.productDetails.addToCart();
  await homePage.cart.increaseQuantity(productName);

  await expect(homePage.cart.quantityControl(productName)).toContainText('2');
  await expect(homePage.cart.subtotal(doubleQuantitySubtotal)).toBeVisible();

  await homePage.cart.decreaseQuantity(productName);

  await expect(homePage.cart.quantityControl(productName)).toContainText('1');
  await expect(homePage.cart.subtotal(unitPrice)).toBeVisible();
});

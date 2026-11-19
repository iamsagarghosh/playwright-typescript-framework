import { expect, test } from '../../src/fixtures/base.fixture';
import { createTestCustomerData } from '../../src/data/testDataFactory';
import { testData } from '../../src/data/testData';

const { productName, totalWithShipping } = testData.cart;

test('guest checkout validates required address fields @e2e', async ({ homePage }) => {
  await homePage.goto();
  await homePage.products.productCard(productName).openDetails();
  await homePage.productDetails.addToCart();
  await homePage.cart.goToCheckout();
  await homePage.checkout.continueToPayment();

  for (const field of homePage.checkout.requiredAddressFields) {
    await expect(field).toHaveAttribute('required', '');
    expect(await field.evaluate((element) => element.matches(':invalid'))).toBe(true);
  }

  await expect(homePage.checkout.heading).toBeVisible();
});

test('guest can complete a simulated demo checkout @e2e', async ({ homePage }) => {
  const customer = createTestCustomerData();

  await homePage.goto();
  await homePage.products.productCard(productName).openDetails();
  await homePage.productDetails.addToCart();
  await homePage.cart.goToCheckout();
  await homePage.checkout.fillAddress(customer);
  await homePage.checkout.continueToPayment();
  await homePage.checkout.selectDemoCard();
  await homePage.checkout.reviewOrder();

  await expect(homePage.checkout.deliveryDetails).toContainText(customer.email);
  await expect(
    homePage.checkout.orderSummary.getByText(totalWithShipping, { exact: true }),
  ).toBeVisible();

  await homePage.checkout.placeDemoOrder();

  await expect(homePage.checkout.confirmationHeading).toBeVisible();
});

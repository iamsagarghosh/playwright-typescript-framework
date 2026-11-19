import { expect, test } from '../../src/fixtures/base.fixture';
import { createTestCustomerData } from '../../src/data/testDataFactory';
import { testData } from '../../src/data/testData';

const { productName, totalWithShipping } = testData.cart;

test('guest checkout validates required address fields @e2e', async ({ homePage, logger }) => {
  await homePage.goto();
  await homePage.products.productCard(productName).openDetails();
  await homePage.productDetails.addToCart();
  await homePage.cart.goToCheckout();
  logger.info('Checking that checkout blocks progress when required address fields are empty.');
  await homePage.checkout.continueToPayment();

  for (const field of homePage.checkout.requiredAddressFields) {
    await expect(field).toHaveAttribute('required', '');
    expect(await field.evaluate((element) => element.matches(':invalid'))).toBe(true);
  }

  await expect(homePage.checkout.heading).toBeVisible();
});

test('guest can complete a simulated demo checkout @e2e', async ({ homePage, logger }) => {
  const customer = createTestCustomerData();

  logger.info(`Starting a simulated guest checkout for "${productName}".`);

  await test.step('Add the product and open checkout', async () => {
    await homePage.goto();
    await homePage.products.productCard(productName).openDetails();
    await homePage.productDetails.addToCart();
    await homePage.cart.goToCheckout();
  });

  await test.step('Enter synthetic delivery details and review the order', async () => {
    await homePage.checkout.fillAddress(customer);
    await homePage.checkout.continueToPayment();
    await homePage.checkout.selectDemoCard();
    await homePage.checkout.reviewOrder();
  });

  await expect(homePage.checkout.deliveryDetails).toContainText(customer.email);
  await expect(
    homePage.checkout.orderSummary.getByText(totalWithShipping, { exact: true }),
  ).toBeVisible();

  await test.step('Place the simulated demo order', async () => {
    await homePage.checkout.placeDemoOrder();
  });

  await expect(homePage.checkout.confirmationHeading).toBeVisible();
});

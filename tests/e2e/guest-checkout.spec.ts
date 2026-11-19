import { expect, test } from '../../src/fixtures/base.fixture';
import { createTestCustomerData } from '../../src/data/testDataFactory';
import { testData } from '../../src/data/testData';

const { productName, totalWithShipping } = testData.cart;

test(
  'Checkout blocks progress when required address fields are missing',
  { tag: '@e2e' },
  async ({ homePage, logger }) => {
    await test.step('Open checkout with a product in the cart', async () => {
      await homePage.goto();
      await homePage.products.productCard(productName).openDetails();
      await homePage.productDetails.addToCart();
      await homePage.cart.goToCheckout();
    });

    await test.step('Attempt to continue without address details', async () => {
      logger.info('Checking that checkout blocks progress when required address fields are empty.');
      await homePage.checkout.continueToPayment();
    });

    await test.step('Verify required fields prevent checkout progress', async () => {
      for (const field of homePage.checkout.requiredAddressFields) {
        await expect(field).toHaveAttribute('required', '');
        expect(await field.evaluate((element) => element.matches(':invalid'))).toBe(true);
      }

      await expect(homePage.checkout.heading).toBeVisible();
    });
  },
);

test('Guest completes a simulated demo checkout', { tag: '@e2e' }, async ({ homePage, logger }) => {
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

    await expect(homePage.checkout.deliveryDetails).toContainText(customer.email);
    await expect(
      homePage.checkout.orderSummary.getByText(totalWithShipping, { exact: true }),
    ).toBeVisible();
  });

  await test.step('Place the simulated demo order and verify confirmation', async () => {
    await homePage.checkout.placeDemoOrder();
    await expect(homePage.checkout.confirmationHeading).toBeVisible();
  });
});

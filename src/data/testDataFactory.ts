import { faker } from '@faker-js/faker';

export interface TestCustomerData {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  streetAddress: string;
  postalCode: string;
  city: string;
  country: string;
}

export function createTestCustomerData(): TestCustomerData {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const uniqueId = faker.string.uuid();

  return {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    // The reserved .test domain prevents generated addresses from reaching real mailboxes.
    email: `qa.${uniqueId}@example.test`,
    streetAddress: faker.location.streetAddress(),
    postalCode: faker.location.zipCode(),
    city: faker.location.city(),
    country: 'United States',
  };
}

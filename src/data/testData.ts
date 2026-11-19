import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { environment } from '../config/environment';

export interface ProductSearchData {
  query: string;
  expectedProduct: string;
  excludedProduct: string;
}

export interface CartTestData {
  productName: string;
  unitPrice: string;
  doubleQuantitySubtotal: string;
  totalWithShipping: string;
}

export interface FrameworkTestData {
  productSearch: ProductSearchData;
  cart: CartTestData;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFrameworkTestData(value: unknown): value is FrameworkTestData {
  if (!isRecord(value) || !isRecord(value.productSearch)) {
    return false;
  }

  const { query, expectedProduct, excludedProduct } = value.productSearch;
  const { productName, unitPrice, doubleQuantitySubtotal, totalWithShipping } = isRecord(value.cart)
    ? value.cart
    : {};
  return (
    typeof query === 'string' &&
    typeof expectedProduct === 'string' &&
    typeof excludedProduct === 'string' &&
    typeof productName === 'string' &&
    typeof unitPrice === 'string' &&
    typeof doubleQuantitySubtotal === 'string' &&
    typeof totalWithShipping === 'string'
  );
}

function loadTestData(): FrameworkTestData {
  const filePath = resolve(process.cwd(), 'test-data', `${environment.name}.json`);

  if (!existsSync(filePath)) {
    throw new Error(
      `Missing test data for TEST_ENV "${environment.name}". Add the file: ${filePath}`,
    );
  }

  const parsedData: unknown = JSON.parse(readFileSync(filePath, 'utf8'));

  if (!isFrameworkTestData(parsedData)) {
    throw new Error(`Test data file has an invalid structure: ${filePath}`);
  }

  return parsedData;
}

export const testData = loadTestData();

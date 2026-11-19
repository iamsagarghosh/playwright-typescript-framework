import 'dotenv/config';

const environmentNames = ['local', 'qa', 'staging', 'uat'] as const;

export type EnvironmentName = (typeof environmentNames)[number];

export interface EnvironmentConfig {
  name: EnvironmentName;
  baseUrl: string;
}

export interface TestCredentials {
  username: string;
  password: string;
}

const localDemoBaseUrl = 'https://demoapps.leapwork.ai/retail/';

function isEnvironmentName(value: string): value is EnvironmentName {
  return (environmentNames as readonly string[]).includes(value);
}

function resolveEnvironmentName(value: string | undefined): EnvironmentName {
  const normalizedValue = value?.trim().toLowerCase() || 'local';

  if (!isEnvironmentName(normalizedValue)) {
    throw new Error(
      `Unsupported TEST_ENV "${normalizedValue}". Expected one of: ${environmentNames.join(', ')}.`,
    );
  }

  return normalizedValue;
}

function resolveBaseUrl(name: EnvironmentName, configuredBaseUrl: string | undefined): string {
  const baseUrl = configuredBaseUrl?.trim() || (name === 'local' ? localDemoBaseUrl : undefined);

  if (!baseUrl) {
    throw new Error(`BASE_URL must be set when TEST_ENV is "${name}".`);
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(baseUrl);
  } catch {
    throw new Error('BASE_URL must be an absolute HTTP or HTTPS URL.');
  }

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    throw new Error('BASE_URL must use HTTP or HTTPS.');
  }

  return parsedUrl.toString();
}

const name = resolveEnvironmentName(process.env.TEST_ENV);
const baseUrl = resolveBaseUrl(name, process.env.BASE_URL);

export const environment: EnvironmentConfig = Object.freeze({ name, baseUrl });

export function getTestCredentials(): TestCredentials {
  const username = process.env.TEST_USERNAME?.trim();
  const password = process.env.TEST_PASSWORD;

  if (!username || !password) {
    throw new Error(
      'Set TEST_USERNAME and TEST_PASSWORD using local or pipeline secret variables.',
    );
  }

  return { username, password };
}

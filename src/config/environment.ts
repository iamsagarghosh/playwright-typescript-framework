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

function parseAllowedHosts(value: string | undefined): Set<string> {
  return new Set(
    (value ?? '')
      .split(',')
      .map((host) => host.trim().toLowerCase().replace(/\.$/, ''))
      .filter(Boolean),
  );
}

function resolveBaseUrl(
  name: EnvironmentName,
  configuredBaseUrl: string | undefined,
  configuredAllowedHosts: string | undefined,
): string {
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

  const hostname = parsedUrl.hostname.toLowerCase().replace(/\.$/, '');
  const allowedHosts = parseAllowedHosts(configuredAllowedHosts);
  const localHosts = new Set(['demoapps.leapwork.ai', 'localhost', '127.0.0.1', '[::1]']);
  const isAllowed =
    name === 'local'
      ? localHosts.has(hostname) || allowedHosts.has(hostname)
      : allowedHosts.has(hostname);

  if (!isAllowed) {
    const requirement =
      name === 'local'
        ? 'Use the approved Leap & Leash demo or a loopback URL, or explicitly allow a local test host.'
        : `Add the approved test hostname to ALLOWED_BASE_URL_HOSTS for TEST_ENV="${name}".`;
    throw new Error(
      `BASE_URL host "${hostname}" is not approved for TEST_ENV="${name}". ${requirement} Host entries must be exact hostnames; wildcards are not supported.`,
    );
  }

  return parsedUrl.toString();
}

const name = resolveEnvironmentName(process.env.TEST_ENV);
const baseUrl = resolveBaseUrl(name, process.env.BASE_URL, process.env.ALLOWED_BASE_URL_HOSTS);

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

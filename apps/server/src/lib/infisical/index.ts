import { InfisicalClient } from '@infisical/sdk';

let client: InfisicalClient | null = null;

function getClient(): InfisicalClient {
  if (client) return client;

  const token = process.env.INFISICAL_TOKEN;
  if (!token) {
    throw new Error(
      'INFISICAL_TOKEN is not set. Please configure it in .env.local',
    );
  }

  client = new InfisicalClient({
    accessToken: token,
    siteUrl: process.env.INFISICAL_SITE_URL || undefined,
    // LogLevel: 4 = Error, 3 = Warn (avoid ambient const enum for verbatimModuleSyntax)
    logLevel: process.env.NODE_ENV === 'production' ? 4 : 3,
  });

  return client;
}

interface CacheEntry {
  value: string;
  expiresAt: number;
}

const secretCache = new Map<string, CacheEntry>();
const CACHE_TTL = 60 * 1000; // 1 minute

export async function getSecret(secretName: string): Promise<string> {
  const cached = secretCache.get(secretName);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const projectId = process.env.INFISICAL_PROJECT_ID;
  if (!projectId) {
    throw new Error(
      'INFISICAL_PROJECT_ID is not set. Please configure it in .env.local',
    );
  }

  const c = getClient();
  const response = await c.getSecret({
    secretName,
    projectId,
    environment: process.env.NODE_ENV === 'production' ? 'prod' : 'dev',
    path: '/',
  });

  secretCache.set(secretName, {
    value: response.secretValue,
    expiresAt: Date.now() + CACHE_TTL,
  });

  return response.secretValue;
}

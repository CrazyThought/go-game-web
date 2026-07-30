import { createClient } from '@supabase/supabase-js';
import { getSecret } from '@/lib/infisical';

let adminClient: ReturnType<typeof createClient> | null = null;

export async function createAdminClient() {
  if (adminClient) return adminClient;

  const [url, serviceRoleKey] = await Promise.all([
    getSecret('SUPABASE_URL'),
    getSecret('SUPABASE_SERVICE_ROLE_KEY'),
  ]);

  adminClient = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return adminClient;
}

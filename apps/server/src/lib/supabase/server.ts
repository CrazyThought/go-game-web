import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSecret } from '@/lib/infisical';

let _url: string | null = null;
let _publishableKey: string | null = null;

async function getSupabaseConfig() {
  if (!_url || !_publishableKey) {
    [_url, _publishableKey] = await Promise.all([
      getSecret('SUPABASE_URL'),
      getSecret('SUPABASE_PUBLISHABLE_KEY'),
    ]);
  }
  return { url: _url, publishableKey: _publishableKey };
}

export async function createClient() {
  const cookieStore = await cookies();
  const { url, publishableKey } = await getSupabaseConfig();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
            cookiesToSet: { name: string; value: string; options: object }[],
          ) {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          },
    },
  });
}

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSecret } from '@/lib/infisical';

let _url: string | null = null;
let _anonKey: string | null = null;

async function getSupabaseConfig() {
  if (!_url || !_anonKey) {
    [_url, _anonKey] = await Promise.all([
      getSecret('SUPABASE_URL'),
      getSecret('SUPABASE_ANON_KEY'),
    ]);
  }
  return { url: _url, anonKey: _anonKey };
}

export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = await getSupabaseConfig();

  return createServerClient(url, anonKey, {
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

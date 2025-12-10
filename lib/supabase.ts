import 'server-only';
import { createClient } from '@supabase/supabase-js';

export function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !serviceKey) {
    throw new Error('Missing SUPABASE env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export const SERVICE_RATES: Record<string, number> = {
  'Cuci + Setrika': 7000,
  'Cuci Saja': 5000,
  'Setrika Saja': 4000,
};

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? '';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '';

const isConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

let _supabase: ReturnType<typeof createClient<Database>> | null = null;

function getClient() {
  if (!isConfigured) {
    console.warn('[Baby Fitters] Supabase env vars not set — data will not load until VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are configured.');
    return null;
  }
  if (!_supabase) {
    _supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        storage: typeof window !== 'undefined' ? localStorage : undefined,
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return _supabase;
}

export { isConfigured as supabaseConfigured };

export const supabase = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(_, prop, receiver) {
    const client = getClient();
    if (!client) {
      if (prop === 'from') return () => ({ select: () => Promise.resolve({ data: [], error: null }), insert: () => Promise.resolve({ data: null, error: null }), upsert: () => Promise.resolve({ data: null, error: null }), delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }), update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }) });
      if (prop === 'channel') {
        const noopChannel: any = { on: () => noopChannel, subscribe: () => noopChannel, unsubscribe: () => noopChannel };
        return () => noopChannel;
      }
      if (prop === 'removeChannel') return () => {};
      if (prop === 'storage') return { from: () => ({ upload: () => Promise.resolve({ error: null }), getPublicUrl: () => ({ data: { publicUrl: '' } }) }) };
      return () => {};
    }
    return Reflect.get(client, prop, receiver);
  },
});

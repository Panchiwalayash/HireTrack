import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import { env, isLiveSupabaseConfigured } from './env.config.js';

export { isLiveSupabaseConfigured };

export const supabase: SupabaseClient = isLiveSupabaseConfigured
    ? createClient(env.SUPABASE_URL, env.supabaseKey, {
          auth: {
              autoRefreshToken: false,
              persistSession: false,
          },
          realtime: {
              transport: WebSocket as never,
          },
      })
    : (null as unknown as SupabaseClient);

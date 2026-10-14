import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../../config/env';

// Instancia única (Singleton) de Supabase
let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      throw new Error('Las credenciales de Supabase no están configuradas correctamente.');
    }
    supabaseInstance = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false
      }
    });
  }
  return supabaseInstance;
}

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    '[Cloud AIs] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set. ' +
    'Sign-in, credits, and paid plans will not work until you configure Supabase -- see .env.example.'
  );
}

// Falls back to placeholder values so createClient() doesn't throw when the
// env vars are missing; isSupabaseConfigured is what callers should check
// before relying on auth actually working.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);

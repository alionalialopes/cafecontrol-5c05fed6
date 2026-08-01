import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url =
  (import.meta.env['VITE_SUPABASE_URL'] as string | undefined) ??
  (import.meta.env['VITE_SUPABASE_PROJECT_URL'] as string | undefined);

const key =
  (import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'] as string | undefined) ??
  (import.meta.env['VITE_SUPABASE_ANON_KEY'] as string | undefined);

export const supabaseConfigurado = Boolean(url && key);

export const supabase: SupabaseClient | null = supabaseConfigurado
  ? createClient(url as string, key as string, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

export function getSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      "Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.",
    );
  }
  return supabase;
}

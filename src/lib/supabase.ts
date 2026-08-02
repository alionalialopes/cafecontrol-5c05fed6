import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Chaves publicáveis (seguras para o cliente)
const URL_PADRAO = "https://jsgoxuxukibnryaxrogv.supabase.co";
const KEY_PADRAO = "sb_publishable_PSUbxXkVcMthPRCEnmgj1w_X7P8KPHi";

const url =
  (import.meta.env['VITE_SUPABASE_URL'] as string | undefined) ??
  (import.meta.env['VITE_SUPABASE_PROJECT_URL'] as string | undefined) ??
  URL_PADRAO;

const key =
  (import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'] as string | undefined) ??
  (import.meta.env['VITE_SUPABASE_ANON_KEY'] as string | undefined) ??
  KEY_PADRAO;

export const supabaseConfigurado = Boolean(url && key);

const isBrowser = typeof window !== "undefined";

export const supabase: SupabaseClient | null = supabaseConfigurado
  ? createClient(url as string, key as string, {
      auth: {
        persistSession: isBrowser,
        autoRefreshToken: isBrowser,
        detectSessionInUrl: isBrowser,
      },
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

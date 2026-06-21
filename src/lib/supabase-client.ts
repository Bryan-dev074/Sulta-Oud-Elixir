"use client";

import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/**
 * Cliente Supabase para uso exclusivo en el navegador.
 * Las claves públicas (anon) son seguras para exponer al cliente.
 */
export function createClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    throw new Error(
      "Faltan variables de entorno de Supabase. Define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local"
    );
  }

  // Reutiliza la misma instancia entre renders para no saturar conexiones.
  if (cached) return cached;

  cached = createSupabaseClient(url, anon, {
    auth: { persistSession: false },
  });
  return cached;
}

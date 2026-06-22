import { NextResponse } from "next/server";
import { fetchCatalogo } from "@/lib/catalog";

/**
 * Endpoint que devuelve el catálogo público (perfumes activos).
 * Usa la misma lógica de fallback elegante que el Server Component original:
 * si Supabase no responde o está vacío, devuelve el seed local.
 *
 * Lo consume el <CatalogProvider> del layout, y permite refrescar el catálogo
 * en el cliente tras ediciones desde /admin.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const perfumes = await fetchCatalogo();
  return NextResponse.json(perfumes, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

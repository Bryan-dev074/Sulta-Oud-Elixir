import { NextRequest, NextResponse } from "next/server";
import { sesionValida } from "@/lib/supabase-admin";
import { buscarEnTodasLasTiendas } from "@/lib/scraper-tiendas";

/**
 * POST /api/asistente/tiendas
 * Body: { nombre: string }
 * Busca el producto en todas las tiendas (Flujo B), puntúa con Gemini y devuelve
 * los datos para la tabla semáforo del asistente.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  if (!(await sesionValida())) {
    return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 });
  }
  let nombre = "";
  try {
    nombre = String((await req.json()).nombre ?? "").trim();
  } catch {
    return NextResponse.json({ ok: false, error: "Body inválido." }, { status: 400 });
  }
  if (nombre.length < 3) {
    return NextResponse.json({ ok: false, error: "Nombre demasiado corto." }, { status: 400 });
  }
  try {
    const tiendas = await buscarEnTodasLasTiendas(nombre);
    return NextResponse.json({ ok: true, tiendas });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error desconocido";
    console.error("[api/asistente/tiendas]", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

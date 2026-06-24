import { NextRequest, NextResponse } from "next/server";
import { sesionValida, adminConfigurado, supabaseAdmin } from "@/lib/supabase-admin";
import { similitud } from "@/lib/similitud";

/**
 * POST /api/asistente/duplicados
 * Body: { nombre: string }
 * Devuelve productos ya existentes con nombre igual o muy parecido, para alertar
 * al asistente ANTES de cargar (control de duplicados en tiempo real, onBlur).
 *
 * Respuesta: { ok, hayDuplicado, exacto, candidatos: [{id, nombre, marca, similitud}] }
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UMBRAL_ALERTA = 0.72; // a partir de acá se considera "muy similar"

export async function POST(req: NextRequest) {
  if (!(await sesionValida())) {
    return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 });
  }
  if (!adminConfigurado()) {
    return NextResponse.json({ ok: false, error: "Supabase no configurado." }, { status: 500 });
  }

  let nombre = "";
  try {
    nombre = String((await req.json()).nombre ?? "").trim();
  } catch {
    return NextResponse.json({ ok: false, error: "Body inválido." }, { status: 400 });
  }
  if (nombre.length < 3) {
    return NextResponse.json({ ok: true, hayDuplicado: false, exacto: false, candidatos: [] });
  }

  try {
    const supabase = supabaseAdmin();
    const { data, error } = await supabase.from("perfumes").select("id, nombre, marca");
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    const candidatos = (data ?? [])
      .map((p) => ({
        id: p.id as string,
        nombre: p.nombre as string,
        marca: p.marca as string,
        similitud: Number(similitud(nombre, p.nombre as string).toFixed(3)),
      }))
      .filter((c) => c.similitud >= UMBRAL_ALERTA)
      .sort((a, b) => b.similitud - a.similitud)
      .slice(0, 5);

    const exacto = candidatos.some((c) => c.similitud >= 0.97);
    return NextResponse.json({
      ok: true,
      hayDuplicado: candidatos.length > 0,
      exacto,
      candidatos,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error desconocido";
    console.error("[api/asistente/duplicados]", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

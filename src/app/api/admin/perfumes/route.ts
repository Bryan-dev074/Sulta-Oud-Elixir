import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { ADMIN_PASSWORD } from "@/data/site-config";
import { FALLBACK_PERFUMES } from "@/data/fallback-perfumes";
import { Perfume } from "@/types/database";

/**
 * Endpoint de administración del catálogo.
 *
 * GET  → lista TODOS los perfumes (activos e inactivos).
 *        Si hay Supabase con service role, lee de ahí.
 *        Si no, devuelve el fallback marcando todos como activos/demos.
 *
 * POST → actualiza uno o varios perfumes.
 *        Cuerpo: { password, updates: [{ id, activo?, destacado? }] }
 *        - Si hay Supabase con service role → actualiza en la base.
 *        - Si no → responde ok y el panel aplica los cambios en localStorage.
 *
 * El panel /admin maneja los dos modos con gracia.
 */
export const dynamic = "force-dynamic";

function serviceRoleConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key, { auth: { persistSession: false } });
}

export async function GET() {
  const supabase = getClient();
  if (!supabase) {
    // Modo sin service role: devolvemos el fallback marcándolo como demo
    const todos: Perfume[] = FALLBACK_PERFUMES.map((p) => ({ ...p }));
    return NextResponse.json({ perfumes: todos, modo: "local" });
  }

  const { data, error } = await supabase
    .from("perfumes")
    .select("*")
    .order("created_at", { ascending: true });

  if (error || !data) {
    return NextResponse.json({ perfumes: FALLBACK_PERFUMES, modo: "local" });
  }

  return NextResponse.json({ perfumes: data, modo: "supabase" });
}

interface UpdateItem {
  id: string;
  activo?: boolean;
  destacado?: boolean;
}

export async function POST(req: NextRequest) {
  let body: {
    password?: string;
    updates?: UpdateItem[];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (body.password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!Array.isArray(body.updates) || body.updates.length === 0) {
    return NextResponse.json(
      { error: "Falta 'updates'" },
      { status: 400 }
    );
  }

  const supabase = getClient();

  // Modo sin service role → el panel aplica cambios en localStorage.
  if (!supabase || !serviceRoleConfigured()) {
    return NextResponse.json({
      ok: true,
      modo: "local",
      mensaje:
        "Sin SUPABASE_SERVICE_ROLE_KEY. Los cambios se aplican solo en este navegador.",
    });
  }

  // Aplicar cada update individualmente (campos opcionales)
  const resultados: { id: string; ok: boolean }[] = [];
  for (const u of body.updates) {
    const patch: Record<string, boolean> = {};
    if (typeof u.activo === "boolean") patch.activo = u.activo;
    if (typeof u.destacado === "boolean") patch.destacado = u.destacado;
    if (Object.keys(patch).length === 0) continue;

    const { error } = await supabase
      .from("perfumes")
      .update(patch)
      .eq("id", u.id);
    resultados.push({ id: u.id, ok: !error });
  }

  return NextResponse.json({ ok: true, modo: "supabase", resultados });
}

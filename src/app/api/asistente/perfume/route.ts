import { NextRequest, NextResponse } from "next/server";
import { sesionValida } from "@/lib/supabase-admin";

/**
 * POST /api/asistente/perfume
 * Body: { nombre: string }
 * Llama a Gemini Flash como experto en perfumería y devuelve un JSON estructurado
 * para autocompletar el formulario: marca, ml, categorías, descripción y las 3
 * capas de notas olfativas.
 *
 * Requiere la env var GEMINI_API_KEY (y opcional GEMINI_MODEL).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MODELO = process.env.GEMINI_MODEL || "gemini-2.0-flash";

// Schema de salida estructurada de Gemini (formato OpenAPI que acepta la API).
const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    marca: { type: "STRING", description: "Marca del perfume, ej: Lattafa, Afnan, Rasasi" },
    ml: { type: "INTEGER", description: "Volumen en mililitros, número puro extraído del nombre o contexto" },
    categorias: { type: "ARRAY", items: { type: "STRING" }, description: "Familias olfativas, ej: Oud, Dulce, Oriental" },
    descripcion: { type: "STRING", description: "Descripción atractiva para el cliente, máximo 2-3 oraciones cortas" },
    notas_salida: { type: "ARRAY", items: { type: "STRING" } },
    notas_corazon: { type: "ARRAY", items: { type: "STRING" } },
    notas_fondo: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: ["marca", "ml", "categorias", "descripcion", "notas_salida", "notas_corazon", "notas_fondo"],
};

export async function POST(req: NextRequest) {
  if (!(await sesionValida())) {
    return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "Falta GEMINI_API_KEY en el servidor." },
      { status: 500 }
    );
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

  const prompt =
    `Sos un experto en perfumería árabe y de nicho. A partir del nombre de un perfume, ` +
    `devolvé los datos técnicos reales de tu conocimiento. Nombre: "${nombre}".\n` +
    `Reglas:\n` +
    `- marca: la casa/marca real (ej: Lattafa, Afnan, Maison Alhambra).\n` +
    `- ml: el volumen en mililitros como número (extraelo del nombre; si no está, estimá el más común, 100).\n` +
    `- categorias: 2 a 4 familias/categorías olfativas (ej: Oud, Dulce, Oriental, Amaderado).\n` +
    `- descripcion: atractiva para vender, 2-3 oraciones cortas, en español.\n` +
    `- notas_salida / notas_corazon / notas_fondo: las notas reales de la pirámide olfativa.\n` +
    `Si no conocés el perfume exacto, hacé tu mejor estimación coherente con la marca y el nombre. ` +
    `Respondé SOLO el JSON del schema.`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent?key=${apiKey}`;
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          temperature: 0.4,
        },
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      console.error("[api/asistente/perfume] Gemini", resp.status, txt.slice(0, 300));
      return NextResponse.json(
        { ok: false, error: `Gemini respondió ${resp.status}. Revisá la API key y el modelo.` },
        { status: 502 }
      );
    }

    const data = await resp.json();
    const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!texto) {
      return NextResponse.json({ ok: false, error: "Gemini no devolvió contenido." }, { status: 502 });
    }
    const datos = JSON.parse(texto);

    // Mapeo a los campos del formulario de producto.
    return NextResponse.json({
      ok: true,
      perfume: {
        marca: String(datos.marca ?? "").trim(),
        volumen_ml: Number(datos.ml) || 100,
        categoria: Array.isArray(datos.categorias) ? datos.categorias : [],
        descripcion: String(datos.descripcion ?? "").trim(),
        notas_olfativas: {
          salida: Array.isArray(datos.notas_salida) ? datos.notas_salida : [],
          corazon: Array.isArray(datos.notas_corazon) ? datos.notas_corazon : [],
          fondo: Array.isArray(datos.notas_fondo) ? datos.notas_fondo : [],
        },
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error desconocido";
    console.error("[api/asistente/perfume]", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

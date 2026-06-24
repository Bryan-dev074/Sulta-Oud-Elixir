/**
 * Utilidades de estabilidad para el asistente de carga:
 *  · Caché temporal en memoria — evita re-consumir créditos de IA/scraping si
 *    se repite la MISMA consulta en la sesión (best-effort: vive mientras la
 *    instancia serverless esté caliente).
 *  · Control de ritmo (rate limit) — frena ráfagas que bloquearían la capa
 *    gratuita de Gemini; si llegás muy rápido con OTRO producto, pide esperar.
 *  · fetch con reintento — backoff ante 429/503 (saturación de la API).
 */

import { normalizar } from "@/lib/similitud";

// ── Caché ───────────────────────────────────────────────────────────────────
interface Entrada {
  data: unknown;
  expira: number;
}
const CACHE = new Map<string, Entrada>();
const TTL_MS = 10 * 60 * 1000; // 10 minutos

export function claveCache(tipo: string, nombre: string): string {
  return `${tipo}:${normalizar(nombre)}`;
}

export function cacheGet<T>(clave: string): T | null {
  const e = CACHE.get(clave);
  if (!e) return null;
  if (Date.now() > e.expira) {
    CACHE.delete(clave);
    return null;
  }
  return e.data as T;
}

export function cacheSet(clave: string, data: unknown, ttl = TTL_MS): void {
  CACHE.set(clave, { data, expira: Date.now() + ttl });
  // Limpieza oportunista para no crecer sin límite.
  if (CACHE.size > 300) {
    const ahora = Date.now();
    for (const [k, v] of CACHE) if (ahora > v.expira) CACHE.delete(k);
  }
}

// ── Control de ritmo ──────────────────────────────────────────────────────────
const MIN_INTERVALO_MS = 4000; // mínimo entre consultas de productos DISTINTOS
let ultimaClave = "";
let ultimaAt = 0;

/**
 * Devuelve { ok:true } si se puede consultar, o { ok:false, esperaSegundos }
 * si hay que frenar. La MISMA consulta siempre pasa (la sirve el caché);
 * solo frena cuando llega un producto NUEVO demasiado rápido.
 */
export function verificarRitmo(nombre: string): { ok: true } | { ok: false; esperaSegundos: number } {
  const clave = normalizar(nombre);
  const ahora = Date.now();
  if (clave === ultimaClave) return { ok: true };
  const delta = ahora - ultimaAt;
  if (ultimaAt && delta < MIN_INTERVALO_MS) {
    return { ok: false, esperaSegundos: Math.max(1, Math.ceil((MIN_INTERVALO_MS - delta) / 1000)) };
  }
  ultimaClave = clave;
  ultimaAt = ahora;
  return { ok: true };
}

// ── fetch con reintento (429/503) ────────────────────────────────────────────
export async function fetchConReintento(
  url: string,
  init: RequestInit,
  intentos = 3
): Promise<Response> {
  let ultimo: Response | null = null;
  for (let i = 0; i < intentos; i++) {
    const r = await fetch(url, init);
    if (r.status !== 429 && r.status !== 503) return r;
    ultimo = r;
    if (i < intentos - 1) {
      await new Promise((res) => setTimeout(res, 1500 * (i + 1))); // 1.5s, 3s
    }
  }
  return ultimo as Response;
}

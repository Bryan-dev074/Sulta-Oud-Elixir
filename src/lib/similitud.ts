/**
 * Similitud de texto para detectar productos duplicados o muy parecidos.
 * Combina distancia de edición (Levenshtein) con solapamiento de palabras
 * (Jaccard de tokens) — robusto ante orden distinto y palabras extra como
 * "EDP", "100ml", la marca, etc.
 */

/** Normaliza: minúsculas, sin tildes, sin signos, espacios colapsados. */
export function normalizar(s: string): string {
  return (s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Tokens significativos (descarta ruido típico de perfumería y números de ml). */
const RUIDO = new Set(["edp", "edt", "edc", "parfum", "perfume", "eau", "de", "the", "ml", "for", "y", "el", "la"]);
function tokens(s: string): string[] {
  return normalizar(s)
    .split(" ")
    .filter((t) => t && !RUIDO.has(t) && !/^\d+$/.test(t));
}

/** Distancia de Levenshtein entre dos strings. */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const fila = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = fila[0];
    fila[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = fila[j];
      fila[j] = Math.min(
        fila[j] + 1,
        fila[j - 1] + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
      prev = tmp;
    }
  }
  return fila[b.length];
}

/** 0..1 — qué tan parecidos son dos strings por edición. */
function ratioEdicion(a: string, b: string): number {
  const max = Math.max(a.length, b.length);
  return max === 0 ? 1 : 1 - levenshtein(a, b) / max;
}

/** 0..1 — solapamiento de palabras (Jaccard). */
function jaccardTokens(a: string, b: string): number {
  const ta = new Set(tokens(a));
  const tb = new Set(tokens(b));
  if (!ta.size || !tb.size) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  return inter / (ta.size + tb.size - inter);
}

/**
 * Puntaje de similitud combinado 0..1 entre dos nombres de producto.
 * Pondera el solapamiento de palabras (más importante) con la edición global.
 */
export function similitud(a: string, b: string): number {
  const na = normalizar(a);
  const nb = normalizar(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  const jac = jaccardTokens(a, b);
  const edit = ratioEdicion(na, nb);
  // Si todas las palabras de uno están contenidas en el otro, casi seguro es el mismo.
  const ta = tokens(a), tb = tokens(b);
  const contenido =
    ta.length && tb.length && (ta.every((t) => tb.includes(t)) || tb.every((t) => ta.includes(t)));
  const base = jac * 0.6 + edit * 0.4;
  return contenido ? Math.max(base, 0.85) : base;
}

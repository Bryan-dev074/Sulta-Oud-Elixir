"use client";

import { useState, useCallback } from "react";
import {
  Sparkles, AlertTriangle, CheckCircle2, ExternalLink, Search, Loader2, Save, Wand2,
} from "lucide-react";
import { guardarPerfumeAction, type PerfumeInput } from "./actions";

// ─── Tipos que devuelven las rutas del asistente ────────────────────────────
interface Candidato { titulo: string; url: string; precio: string; }
interface ResultadoTienda {
  id: string; tienda: string; metodo: "html" | "api" | "manual"; urlTienda: string;
  candidatos: Candidato[]; mejorIndice: number; confianza: number;
  semaforo: "verde" | "amarillo" | "rojo"; nota?: string;
}
interface PerfumeIA {
  marca: string; volumen_ml: number; categoria: string[]; descripcion: string;
  notas_olfativas: { salida: string[]; corazon: string[]; fondo: string[] };
}

const lista = (a: string[]) => (a ?? []).join(", ");
const desdeLista = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

/**
 * Asistente de carga de productos con IA:
 *  1. Nombre → chequeo de duplicados (onBlur) con alerta roja.
 *  2. "Sincronizar" → Gemini (datos) + scraping de tiendas (en paralelo).
 *  3. Autocompletado de campos + tabla semáforo con selects pre-elegidos.
 *  4. "Confirmar y Guardar" → registra el producto con todas sus tiendas.
 */
export default function AsistenteCarga({
  toast,
}: {
  toast?: (tipo: "ok" | "error", texto: string) => void;
}) {
  const [nombre, setNombre] = useState("");
  const [dup, setDup] = useState<{ candidatos: { nombre: string; marca: string; similitud: number }[]; chequeado: boolean }>({ candidatos: [], chequeado: false });
  const [ignorarDup, setIgnorarDup] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [hechoIA, setHechoIA] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Campos del perfume (autocompletados por la IA, editables)
  const [marca, setMarca] = useState("");
  const [ml, setMl] = useState<number>(100);
  const [categorias, setCategorias] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [nSalida, setNSalida] = useState("");
  const [nCorazon, setNCorazon] = useState("");
  const [nFondo, setNFondo] = useState("");

  // Tiendas (tabla semáforo) + selección por tienda
  const [tiendas, setTiendas] = useState<ResultadoTienda[]>([]);
  const [seleccion, setSeleccion] = useState<Record<string, number>>({}); // id → índice de candidato

  const bloqueado = dup.candidatos.length > 0 && !ignorarDup;
  const listoParaSync = nombre.trim().length >= 3 && !bloqueado && !cargando;

  // ── Chequeo de duplicados (onBlur) ──
  const chequearDuplicados = useCallback(async () => {
    const n = nombre.trim();
    if (n.length < 3) { setDup({ candidatos: [], chequeado: false }); return; }
    try {
      const res = await fetch("/api/asistente/duplicados", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nombre: n }),
      });
      const data = await res.json();
      setIgnorarDup(false);
      setDup({ candidatos: data.candidatos ?? [], chequeado: true });
    } catch {
      setDup({ candidatos: [], chequeado: true });
    }
  }, [nombre]);

  // ── Sincronizar: Gemini + tiendas en paralelo ──
  const sincronizar = async () => {
    if (!listoParaSync) return;
    setCargando(true);
    setHechoIA(false);
    try {
      const body = JSON.stringify({ nombre: nombre.trim() });
      const opt = { method: "POST", headers: { "Content-Type": "application/json" }, body };
      const [rP, rT] = await Promise.all([
        fetch("/api/asistente/perfume", opt),
        fetch("/api/asistente/tiendas", opt),
      ]);
      const dP = await rP.json();
      const dT = await rT.json();

      if (dP.ok) {
        const p: PerfumeIA = dP.perfume;
        setMarca(p.marca || "");
        setMl(p.volumen_ml || 100);
        setCategorias(lista(p.categoria));
        setDescripcion(p.descripcion || "");
        setNSalida(lista(p.notas_olfativas?.salida));
        setNCorazon(lista(p.notas_olfativas?.corazon));
        setNFondo(lista(p.notas_olfativas?.fondo));
      } else {
        toast?.("error", dP.error ?? "Gemini no respondió (¿falta la API key?).");
      }

      if (dT.ok) {
        const ts: ResultadoTienda[] = dT.tiendas ?? [];
        setTiendas(ts);
        const sel: Record<string, number> = {};
        ts.forEach((t) => { sel[t.id] = t.mejorIndice; });
        setSeleccion(sel);
      } else {
        toast?.("error", dT.error ?? "No se pudo buscar en las tiendas.");
      }
      setHechoIA(true);
      toast?.("ok", "Datos cargados. Revisá la tabla de tiendas y guardá.");
    } catch (e) {
      toast?.("error", e instanceof Error ? e.message : "Error en la sincronización.");
    } finally {
      setCargando(false);
    }
  };

  // ── Guardar producto + tiendas seleccionadas ──
  const guardar = async () => {
    setGuardando(true);
    const tiendasGuardar = tiendas
      .filter((t) => seleccion[t.id] >= 0 && t.candidatos[seleccion[t.id]])
      .map((t) => ({ tienda: t.tienda, url: t.candidatos[seleccion[t.id]].url, codigo: "" }));

    const input: PerfumeInput = {
      nombre: nombre.trim(), marca: marca.trim(),
      precio_regular: 0, precio_descuento: null, en_oferta: false,
      stock_disponible: 0, volumen_ml: Number(ml) || 100, activo: true,
      url_imagen: "", descripcion: descripcion.trim(),
      notas_olfativas: { salida: desdeLista(nSalida), corazon: desdeLista(nCorazon), fondo: desdeLista(nFondo) },
      categoria: desdeLista(categorias), sku: null, destacado: false, es_dropi: false,
      tiendas: tiendasGuardar,
    };
    try {
      const res = await guardarPerfumeAction(input);
      if (res.ok) {
        toast?.("ok", `Producto "${nombre}" guardado con ${tiendasGuardar.length} tienda(s).`);
        // Reset
        setNombre(""); setDup({ candidatos: [], chequeado: false }); setHechoIA(false);
        setMarca(""); setMl(100); setCategorias(""); setDescripcion(""); setNSalida(""); setNCorazon(""); setNFondo("");
        setTiendas([]); setSeleccion({});
      } else {
        toast?.("error", res.error ?? "Error al guardar.");
      }
    } catch (e) {
      toast?.("error", e instanceof Error ? e.message : "Error al guardar.");
    } finally {
      setGuardando(false);
    }
  };

  const colorSemaforo = (s: ResultadoTienda["semaforo"]) =>
    s === "verde" ? "var(--adm-green)" : s === "amarillo" ? "var(--adm-amber)" : "var(--adm-red)";
  const bgSemaforo = (s: ResultadoTienda["semaforo"]) =>
    s === "verde" ? "var(--adm-green-bg)" : s === "amarillo" ? "var(--adm-amber-bg)" : "var(--adm-red-bg)";

  return (
    <div className="space-y-5">
      {/* ── Cabecera + nombre + sincronizar ── */}
      <div className="adm-feature-card">
        <div className="mb-3 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ color: "var(--adm-gold)", background: "var(--adm-blue-bg)" }}>
            <Wand2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold" style={{ color: "var(--adm-text)" }}>🪄 Asistente de carga con IA</h3>
            <p className="mt-0.5 text-sm" style={{ color: "var(--adm-text-muted)" }}>
              Escribí el nombre del perfume; la IA completa los datos y busca el precio en todas las tiendas.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="adm-label">Nombre del producto</label>
            <input
              value={nombre}
              onChange={(e) => { setNombre(e.target.value); setDup({ candidatos: [], chequeado: false }); }}
              onBlur={chequearDuplicados}
              className="adm-input mt-1"
              placeholder="Ej: Lattafa Yara Eau de Parfum 100ml"
            />
          </div>
          <button
            onClick={sincronizar}
            disabled={!listoParaSync}
            className={`adm-btn adm-btn-gold shrink-0${listoParaSync ? " animate-pulse" : ""}`}
            title={bloqueado ? "Resolvé la alerta de duplicado primero" : undefined}
          >
            {cargando ? <><Loader2 className="h-4 w-4 animate-spin" /> Buscando…</> : <><Sparkles className="h-4 w-4" /> Sincronizar Producto</>}
          </button>
        </div>

        {/* Alerta de duplicado */}
        {bloqueado && (
          <div className="mt-3 rounded-lg border p-3 text-sm" style={{ borderColor: "var(--adm-red)", background: "var(--adm-red-bg)", color: "var(--adm-red)" }}>
            <div className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4" /> ¡Atención! Este producto ya existe o hay uno muy similar registrado.</div>
            <ul className="mt-1.5 ml-6 list-disc">
              {dup.candidatos.map((c, i) => <li key={i}>{c.nombre} <span style={{ opacity: 0.7 }}>({c.marca} · {Math.round(c.similitud * 100)}% similar)</span></li>)}
            </ul>
            <div className="mt-2 flex gap-2">
              <button onClick={() => setIgnorarDup(true)} className="adm-btn adm-btn-ghost adm-btn-sm">Ignorar y Continuar</button>
              <button onClick={() => { setNombre(""); setDup({ candidatos: [], chequeado: false }); }} className="adm-btn adm-btn-ghost adm-btn-sm">Cancelar</button>
            </div>
          </div>
        )}
        {dup.chequeado && dup.candidatos.length === 0 && nombre.trim().length >= 3 && (
          <p className="mt-2 flex items-center gap-1.5 text-xs" style={{ color: "var(--adm-green)" }}>
            <CheckCircle2 className="h-3.5 w-3.5" /> Sin duplicados. Listo para sincronizar.
          </p>
        )}
      </div>

      {/* ── Campos autocompletados ── */}
      {hechoIA && (
        <div className="adm-feature-card">
          <h4 className="mb-3 text-sm font-bold" style={{ color: "var(--adm-text)" }}>Datos del perfume (autocompletados — editá si hace falta)</h4>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div><label className="adm-label">Marca</label><input value={marca} onChange={(e) => setMarca(e.target.value)} className="adm-input mt-1" /></div>
            <div><label className="adm-label">Volumen (ml)</label><input type="number" value={ml} onChange={(e) => setMl(Number(e.target.value))} className="adm-input mt-1" /></div>
            <div className="md:col-span-2"><label className="adm-label">Categorías / familias (separadas por coma)</label><input value={categorias} onChange={(e) => setCategorias(e.target.value)} className="adm-input mt-1" /></div>
            <div className="md:col-span-2"><label className="adm-label">Descripción</label><textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="adm-input mt-1" rows={2} /></div>
            <div><label className="adm-label">Notas de salida</label><input value={nSalida} onChange={(e) => setNSalida(e.target.value)} className="adm-input mt-1" /></div>
            <div><label className="adm-label">Notas de corazón</label><input value={nCorazon} onChange={(e) => setNCorazon(e.target.value)} className="adm-input mt-1" /></div>
            <div><label className="adm-label">Notas de fondo</label><input value={nFondo} onChange={(e) => setNFondo(e.target.value)} className="adm-input mt-1" /></div>
          </div>
        </div>
      )}

      {/* ── Tabla semáforo de tiendas ── */}
      {hechoIA && tiendas.length > 0 && (
        <div className="adm-feature-card">
          <h4 className="mb-3 text-sm font-bold" style={{ color: "var(--adm-text)" }}>Tiendas ({tiendas.length}) — verde &gt;90% · amarillo revisar · rojo manual</h4>
          <div className="space-y-1.5">
            {tiendas.map((t) => (
              <div key={t.id} className="flex flex-wrap items-center gap-2 rounded-lg border p-2 text-sm" style={{ borderColor: colorSemaforo(t.semaforo), background: bgSemaforo(t.semaforo) }}>
                <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: colorSemaforo(t.semaforo) }} />
                <span className="w-40 shrink-0 font-semibold" style={{ color: "var(--adm-text)" }}>{t.tienda}</span>
                <a href={t.urlTienda} target="_blank" rel="noreferrer" className="shrink-0" title="Abrir tienda" style={{ color: "var(--adm-text-muted)" }}><ExternalLink className="h-4 w-4" /></a>
                {t.candidatos.length > 0 ? (
                  <select
                    value={seleccion[t.id] ?? -1}
                    onChange={(e) => setSeleccion((s) => ({ ...s, [t.id]: Number(e.target.value) }))}
                    className="adm-input flex-1" style={{ minWidth: 200 }}
                  >
                    <option value={-1}>— ninguno —</option>
                    {t.candidatos.map((c, i) => <option key={i} value={i}>{c.titulo} · {c.precio}</option>)}
                  </select>
                ) : (
                  <span className="flex-1 text-xs" style={{ color: "var(--adm-text-muted)" }}>{t.nota ?? "Sin resultados"}</span>
                )}
                <a href={t.urlTienda} target="_blank" rel="noreferrer" className="adm-btn adm-btn-ghost adm-btn-sm shrink-0">
                  <Search className="h-3.5 w-3.5" /> Búsqueda Manual
                </a>
                {t.candidatos.length > 0 && <span className="shrink-0 text-xs font-semibold" style={{ color: colorSemaforo(t.semaforo) }}>{t.confianza}%</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Guardar ── */}
      {hechoIA && (
        <div className="flex justify-end">
          <button onClick={guardar} disabled={guardando} className="adm-btn adm-btn-gold">
            {guardando ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando…</> : <><Save className="h-4 w-4" /> Confirmar y Guardar</>}
          </button>
        </div>
      )}
    </div>
  );
}

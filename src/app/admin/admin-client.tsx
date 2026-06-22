"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Lock, Eye, EyeOff, RefreshCw, Star, Power, AlertCircle, Check, LogOut } from "lucide-react";
import { Perfume } from "@/types/database";
import { formatGs, precioEfectivo } from "@/lib/format";
import { ADMIN_PASSWORD } from "@/data/site-config";

/**
 * Cliente del panel de administración.
 * - Acceso por contraseña (ADMIN_PASSWORD).
 * - Persiste la sesión en sessionStorage.
 * - Lista todos los perfumes y permite:
 *     · Activar / desactivar (mostrar/ocultar de la tienda).
 *     · Marcar / desmarcar como destacado.
 *     · Ocultar todos los de prueba (fallback) de una.
 * - Modo Supabase (service role) → cambios globales en la base.
 * - Modo local (sin service role) → cambios solo en este navegador
 *   (guardados en localStorage y aplicados al catálogo público).
 */

const SESSION_KEY = "sultan-admin-session";

// ---------- Helpers localStorage para modo local ----------
const OCULTOS_KEY = "sultan-admin-ocultos";
const DESTACADOS_KEY = "sultan-admin-destacados";

function leerSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(key);
    return new Set<string>(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}
function escribirSet(key: string, set: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch {
    /* ignore */
  }
}

export default function AdminClient() {
  const [autenticado, setAutenticado] = useState(false);
  const [password, setPassword] = useState("");
  const [mostrarPass, setMostrarPass] = useState(false);
  const [errorLogin, setErrorLogin] = useState("");

  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modo, setModo] = useState<"supabase" | "local">("local");
  const [guardando, setGuardando] = useState(false);
  const [feedback, setFeedback] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  const [ocultosLocal, setOcultosLocal] = useState<Set<string>>(new Set());
  const [destacadosLocal, setDestacadosLocal] = useState<Set<string>>(new Set());

  // Verificar sesión al montar
  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === "1") setAutenticado(true);
    setOcultosLocal(leerSet(OCULTOS_KEY));
    setDestacadosLocal(leerSet(DESTACADOS_KEY));
  }, []);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await fetch("/api/admin/perfumes", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { perfumes: Perfume[]; modo: "supabase" | "local" };
      setPerfumes(data.perfumes);
      setModo(data.modo);
    } catch {
      setFeedback({ tipo: "error", texto: "No se pudo cargar el catálogo." });
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (autenticado) cargar();
  }, [autenticado, cargar]);

  const login = () => {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setAutenticado(true);
      setErrorLogin("");
      setPassword("");
    } else {
      setErrorLogin("Contraseña incorrecta.");
    }
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setAutenticado(false);
  };

  const mostrarFeedback = (tipo: "ok" | "error", texto: string) => {
    setFeedback({ tipo, texto });
    setTimeout(() => setFeedback(null), 3500);
  };

  // Enviar cambios al server (modo supabase) o aplicar local
  const aplicarCambios = async (updates: { id: string; activo?: boolean; destacado?: boolean }[]) => {
    setGuardando(true);
    try {
      const res = await fetch("/api/admin/perfumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: ADMIN_PASSWORD, updates }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Notificar al catálogo público para que se refresque
      window.dispatchEvent(new CustomEvent("sultan:catalogo-cambio"));
      mostrarFeedback("ok", data.modo === "supabase"
        ? "Cambios guardados en la base de datos."
        : "Cambios aplicados en este navegador (configurá Supabase para que sean globales).");
    } catch {
      mostrarFeedback("error", "No se pudieron guardar los cambios.");
    } finally {
      setGuardando(false);
    }
  };

  // Toggle de "activo" (visible en tienda)
  const toggleActivo = (p: Perfume) => {
    const nuevoValor = p.activo !== false ? false : true;
    // En modo local, gestionamos con sets en localStorage y aplicamos al contexto
    if (modo === "local") {
      const next = new Set(ocultosLocal);
      if (nuevoValor) next.delete(p.id);
      else next.add(p.id);
      setOcultosLocal(next);
      escribirSet(OCULTOS_KEY, next);
      // Notificar al catálogo público
      window.dispatchEvent(new CustomEvent("sultan:catalogo-cambio"));
      mostrarFeedback("ok", nuevoValor ? "Perfume visible en la tienda." : "Perfume oculto de la tienda.");
    } else {
      aplicarCambios([{ id: p.id, activo: nuevoValor }]);
      setPerfumes((prev) => prev.map((x) => (x.id === p.id ? { ...x, activo: nuevoValor } : x)));
    }
  };

  // Toggle de "destacado"
  const toggleDestacado = (p: Perfume) => {
    const nuevoValor = !p.destacado;
    if (modo === "local") {
      const next = new Set(destacadosLocal);
      if (nuevoValor) next.add(p.id);
      else next.delete(p.id);
      setDestacadosLocal(next);
      escribirSet(DESTACADOS_KEY, next);
      window.dispatchEvent(new CustomEvent("sultan:catalogo-cambio"));
    } else {
      aplicarCambios([{ id: p.id, destacado: nuevoValor }]);
      setPerfumes((prev) => prev.map((x) => (x.id === p.id ? { ...x, destacado: nuevoValor } : x)));
    }
  };

  // Ocultar todos los perfumes de prueba (los 11 del fallback)
  const ocultarTodasLasPruebas = () => {
    if (!confirm("¿Ocultar TODOS los perfumes de prueba de la tienda? Los clientes ya no los verán."))
      return;
    if (modo === "local") {
      const ids = perfumes.map((p) => p.id);
      const next = new Set([...ocultosLocal, ...ids]);
      setOcultosLocal(next);
      escribirSet(OCULTOS_KEY, next);
      window.dispatchEvent(new CustomEvent("sultan:catalogo-cambio"));
      mostrarFeedback("ok", "Todos los perfumes de prueba quedaron ocultos.");
    } else {
      const updates = perfumes.map((p) => ({ id: p.id, activo: false }));
      aplicarCambios(updates);
      setPerfumes((prev) => prev.map((x) => ({ ...x, activo: false })));
    }
  };

  // Estado efectivo considerando modo local
  const efectivamenteOculto = (p: Perfume) =>
    modo === "local" ? ocultosLocal.has(p.id) : p.activo === false;
  const efectivamenteDestacado = (p: Perfume) =>
    modo === "local"
      ? p.destacado !== destacadosLocal.has(p.id)
      : p.destacado;

  // ─────────── Pantalla de login ───────────
  if (!autenticado) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="glass-luxe rounded-sm p-8">
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-gold/30 bg-gold/[0.04] text-gold-champagne">
                <Lock className="h-6 w-6" strokeWidth={1.25} />
              </div>
              <h1 className="font-display text-2xl text-ivory">Panel privado</h1>
              <p className="mt-1 text-[0.65rem] uppercase tracking-regal text-ivory/45">
                Sultan Oud Elixir
              </p>
            </div>

            <div className="relative">
              <input
                type={mostrarPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && login()}
                placeholder="Contraseña"
                className="field-luxe !pr-9"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setMostrarPass((v) => !v)}
                className="absolute right-1 top-1/2 -translate-y-1/2 text-ivory/40 hover:text-gold-champagne"
                aria-label={mostrarPass ? "Ocultar" : "Mostrar"}
              >
                {mostrarPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {errorLogin && (
              <p className="mt-2 text-xs text-red-400/80">{errorLogin}</p>
            )}

            <button
              onClick={login}
              className="btn-luxe mt-5 w-full"
            >
              Entrar
            </button>

            <a
              href="/"
              className="mt-4 block text-center text-[0.6rem] uppercase tracking-regal text-ivory/40 hover:text-gold-champagne"
            >
              ← Volver a la tienda
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ─────────── Panel principal ───────────
  return (
    <div className="min-h-screen px-4 py-10 md:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Cabecera */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow !justify-start text-[0.55rem]">Gestión del catálogo</p>
            <h1 className="mt-2 font-display text-3xl text-ivory md:text-4xl">
              Panel del Creador
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.6rem] uppercase tracking-regal ${
              modo === "supabase"
                ? "border-[#25D366]/40 text-[#25D366]"
                : "border-gold/30 text-gold/80"
            }`}>
              {modo === "supabase" ? <Check className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
              {modo === "supabase" ? "Base de datos" : "Modo local"}
            </span>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-full border border-gold/20 px-3 py-1.5 text-[0.6rem] uppercase tracking-regal text-ivory/60 transition-colors hover:border-gold/50 hover:text-gold-champagne"
            >
              <LogOut className="h-3 w-3" />
              Salir
            </button>
          </div>
        </div>

        {/* Banner informativo */}
        {modo === "local" && (
          <div className="mb-6 rounded-sm border border-gold/20 bg-gold/[0.04] p-4 text-xs leading-relaxed text-ivory/70">
            <strong className="text-gold-champagne">Modo local activo.</strong>{" "}
            Tus cambios se ven en este navegador. Para que sean globales
            (todos los clientes), configurá las variables{" "}
            <code className="rounded bg-obsidian/60 px-1.5 py-0.5 text-gold">SUPABASE_URL</code> y{" "}
            <code className="rounded bg-obsidian/60 px-1.5 py-0.5 text-gold">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
            en <code className="rounded bg-obsidian/60 px-1.5 py-0.5 text-gold">.env.local</code> y Vercel.
            Mirá <code className="text-gold">explicacion.md</code> para los pasos.
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div className={`mb-6 rounded-sm border p-3 text-xs ${
            feedback.tipo === "ok"
              ? "border-[#25D366]/30 bg-[#25D366]/10 text-[#25D366]"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}>
            {feedback.texto}
          </div>
        )}

        {/* Acciones masivas */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-regal text-ivory/50">
            {perfumes.length} perfumes en el catálogo
          </p>
          <div className="flex gap-2">
            <button
              onClick={cargar}
              disabled={cargando}
              className="inline-flex items-center gap-1.5 rounded-full border border-gold/20 px-4 py-2 text-[0.6rem] uppercase tracking-regal text-ivory/70 transition-colors hover:border-gold/50 hover:text-gold-champagne disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${cargando ? "animate-spin" : ""}`} />
              Actualizar
            </button>
            <button
              onClick={ocultarTodasLasPruebas}
              disabled={guardando}
              className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/[0.04] px-4 py-2 text-[0.6rem] uppercase tracking-regal text-gold-champagne transition-colors hover:border-gold/60 disabled:opacity-50"
            >
              <Power className="h-3 w-3" />
              Ocultar todos los de prueba
            </button>
          </div>
        </div>

        {/* Lista de perfumes */}
        {cargando ? (
          <div className="py-20 text-center text-sm text-ivory/40">Cargando catálogo…</div>
        ) : (
          <div className="space-y-3">
            {perfumes.map((p) => {
              const oculto = efectivamenteOculto(p);
              const destacado = efectivamenteDestacado(p);
              const precio = precioEfectivo(p);
              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-4 rounded-sm border p-3 transition-colors ${
                    oculto
                      ? "border-ivory/5 bg-obsidian/40 opacity-60"
                      : "border-gold/15 bg-ivory/[0.03]"
                  }`}
                >
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-sm bg-coal">
                    <Image
                      src={p.url_imagen}
                      alt={p.nombre}
                      fill
                      sizes="56px"
                      className="object-cover object-top"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-display text-base text-ivory">{p.nombre}</h3>
                    <p className="text-[0.6rem] uppercase tracking-regal text-gold/70">{p.marca}</p>
                    <p className="mt-0.5 text-xs text-ivory/50">
                      {formatGs(precio)} · {p.stock_disponible} en stock
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => toggleDestacado(p)}
                      title={destacado ? "Quitar destacado" : "Marcar destacado"}
                      className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                        destacado
                          ? "border-gold bg-gold/15 text-gold-champagne"
                          : "border-ivory/10 text-ivory/40 hover:border-gold/40 hover:text-gold/80"
                      }`}
                    >
                      <Star className="h-4 w-4" fill={destacado ? "currentColor" : "none"} />
                    </button>

                    <button
                      onClick={() => toggleActivo(p)}
                      disabled={guardando}
                      title={oculto ? "Mostrar en tienda" : "Ocultar de la tienda"}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-[0.6rem] uppercase tracking-regal transition-colors disabled:opacity-50 ${
                        oculto
                          ? "border-red-500/30 text-red-400 hover:border-red-500/60"
                          : "border-[#25D366]/30 text-[#25D366] hover:border-[#25D366]/60"
                      }`}
                    >
                      <Power className="h-3 w-3" />
                      {oculto ? "Oculto" : "Visible"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-10 text-center">
          <a
            href="/"
            className="text-[0.65rem] uppercase tracking-regal text-ivory/40 hover:text-gold-champagne"
          >
            ← Volver a la tienda
          </a>
        </div>
      </div>
    </div>
  );
}

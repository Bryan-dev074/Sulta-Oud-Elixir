"use client";

import { useEffect, useRef } from "react";
import { ArrowDown, ShieldCheck } from "lucide-react";

/**
 * Hero cinematográfico.
 * Apertura con la tesis de la marca: importación de Dubai + pago al recibir.
 */
export function Hero() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) return;

    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-hero]"));
    items.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(28px)";
      el.style.transition =
        "opacity 1s cubic-bezier(0.22,1,0.36,1), transform 1s cubic-bezier(0.22,1,0.36,1)";
    });

    // Pequeño retraso para que aparezca tras el loader
    const t = setTimeout(() => {
      items.forEach((el, i) => {
        el.style.transitionDelay = `${0.2 + i * 0.15}s`;
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      });
    }, 1800);

    return () => clearTimeout(t);
  }, []);

  return (
    <header
      ref={rootRef}
      className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center"
    >
      {/* Velo inferior para integrar con el fondo 3D */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-obsidian/40 via-transparent to-obsidian" />

      <div className="relative z-10 mt-16 max-w-4xl">
        <p
          data-hero
          className="eyebrow mb-8 justify-center"
        >
          La esencia de la realeza · Dubai → Paraguay
        </p>

        <h1
          data-hero
          className="font-display text-6xl leading-[0.95] text-ivory md:text-8xl"
        >
          Sultan Oud
          <br />
          <span className="text-elixir-shimmer font-display italic">
            Elixir
          </span>
        </h1>

        <p
          data-hero
          className="mx-auto mt-8 max-w-xl text-balance text-base font-light leading-relaxed text-ivory/55 md:text-lg"
        >
          Importadores directos de Dubai. La colección más exclusiva de
          fragancias árabes, ahora al alcance de tu mano en todo el
          territorio paraguayo.
        </p>

        {/* CTAs */}
        <div
          data-hero
          className="mt-12 flex flex-col items-center justify-center gap-5 md:flex-row"
        >
          <button
            onClick={() =>
              document
                .getElementById("catalogo")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="btn-luxe"
          >
            Descubrir la colección
          </button>

          {/* Sello de confianza */}
          <div
            className="flex items-center gap-3 rounded-full border border-gold/25 bg-obsidian/40 px-6 py-3.5 backdrop-blur-md"
            title="Pago al recibir en todo Paraguay"
          >
            <ShieldCheck
              className="h-4 w-4 text-gold-light"
              strokeWidth={1.5}
            />
            <span className="text-[0.62rem] uppercase tracking-regal text-ivory/75">
              Pago al recibir
            </span>
          </div>
        </div>

        {/* Indicador de scroll */}
        <div
          data-hero
          className="mt-20 flex flex-col items-center gap-2 text-ivory/30"
        >
          <span className="text-[0.55rem] uppercase tracking-imperial">
            Desplázate
          </span>
          <ArrowDown className="h-3.5 w-3.5 animate-bounce" strokeWidth={1} />
        </div>
      </div>
    </header>
  );
}

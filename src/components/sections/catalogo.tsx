"use client";

import { useEffect, useMemo, useState } from "react";
import { SearchX } from "lucide-react";
import { Perfume } from "@/types/database";
import { ProductCard } from "@/components/catalog/product-card";
import { useReveal } from "@/hooks/use-reveal";

interface CatalogoProps {
  perfumes: Perfume[];
  query: string;
  onQueryChange: (q: string) => void;
  onAbrirDetalle: (p: Perfume) => void;
}

/**
 * Catálogo principal con filtros por marca/categoría y búsqueda reactiva.
 * Escucha el evento global `sultan:search` que dispara el Navbar.
 */
export function Catalogo({ perfumes, query, onQueryChange, onAbrirDetalle }: CatalogoProps) {
  const [filtro, setFiltro] = useState<string>("todas");
  const ref = useReveal<HTMLDivElement>({ stagger: 0.04, y: 24 });

  // Escuchar búsqueda global del navbar
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail ?? "";
      onQueryChange(detail);
    };
    window.addEventListener("sultan:search", handler);
    return () => window.removeEventListener("sultan:search", handler);
  }, [onQueryChange]);

  // Filtros derivados de los datos reales (siempre relevantes)
  const filtros = useMemo(() => {
    const set = new Set<string>();
    perfumes.forEach((p) => {
      set.add(p.marca);
      p.categoria.forEach((c) => set.add(c));
    });
    return ["todas", ...Array.from(set).sort()];
  }, [perfumes]);

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    return perfumes.filter((p) => {
      const matchFiltro =
        filtro === "todas" ||
        p.marca === filtro ||
        p.categoria.includes(filtro);
      const matchQuery =
        !q ||
        p.nombre.toLowerCase().includes(q) ||
        p.marca.toLowerCase().includes(q) ||
        p.descripcion.toLowerCase().includes(q);
      return matchFiltro && matchQuery;
    });
  }, [perfumes, filtro, query]);

  return (
    <section
      id="catalogo"
      ref={ref}
      className="relative z-10 bg-ebony/70 px-6 py-24 backdrop-blur-md md:py-32"
    >
      <div className="mx-auto max-w-7xl">
        {/* Encabezado */}
        <div className="mb-12 text-center" data-reveal>
          <p className="eyebrow justify-center">Catálogo oficial</p>
          <h2 className="mt-5 font-display text-4xl text-ivory md:text-6xl">
            La cámara olfativa
          </h2>
          <div className="gold-rule mx-auto mt-6" />
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-ivory/55">
            Encuentra tu firma olfativa entre los elixires más exclusivos
            del mundo árabe. Cada botella llega desde Dubai con autenticidad garantizada.
          </p>
        </div>

        {/* Filtros */}
        <div className="mb-12 flex flex-wrap justify-center gap-2.5">
          {filtros.map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`filter-pill capitalize ${
                filtro === f ? "is-active" : ""
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtrados.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-ivory/40">
            <SearchX className="mb-4 h-10 w-10 opacity-40" strokeWidth={1} />
            <p className="text-sm">
              No encontramos fragancias con esos criterios.
            </p>
            <button
              onClick={() => {
                setFiltro("todas");
                onQueryChange("");
              }}
              className="mt-4 text-xs uppercase tracking-regal text-gold/70 underline-offset-4 hover:underline"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtrados.map((p) => (
              <ProductCard
                key={p.id}
                perfume={p}
                onAbrirDetalle={onAbrirDetalle}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

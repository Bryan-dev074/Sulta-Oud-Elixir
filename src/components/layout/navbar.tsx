"use client";

import { useEffect, useState } from "react";
import { Search, ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

/**
 * Navbar flotante de ultra-lujo.
 * Cambia su opacidad/fondo al hacer scroll, sin perder la lectura premium.
 * La búsqueda dispara un CustomEvent global que el catálogo escucha.
 */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menuMobile, setMenuMobile] = useState(false);
  const { cantidadTotal, setAbrirCart } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const irA = (id: string) => {
    setMenuMobile(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const enviarBusqueda = (q: string) => {
    setQuery(q);
    // Notifica al catálogo (y hace scroll si hay texto relevante)
    window.dispatchEvent(
      new CustomEvent("sultan:search", { detail: q })
    );
    if (q.trim().length > 1) {
      document
        .getElementById("catalogo")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? "bg-obsidian/80 backdrop-blur-xl border-b border-gold/10 py-3"
          : "bg-transparent py-6"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 md:px-10">
        {/* Marca */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="group flex flex-col items-start"
          aria-label="Inicio Sultan Oud Elixir"
        >
          <span className="font-lapidary text-base md:text-lg tracking-regal text-ivory group-hover:text-gold-champagne transition-colors">
            SULTAN OUD
          </span>
          <span className="text-elixir-shimmer font-display italic text-xs md:text-sm tracking-imperial">
            Elixir
          </span>
        </button>

        {/* Centro — navegación desktop */}
        <div className="hidden items-center gap-10 md:flex">
          {[
            { label: "Colección", id: "catalogo" },
            { label: "Importación", id: "importacion" },
            { label: "Favoritos", id: "favoritos" },
            { label: "Atelier", id: "atelier" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => irA(item.id)}
              className="group relative text-[0.7rem] uppercase tracking-regal text-ivory/70 transition-colors hover:text-gold-champagne"
            >
              {item.label}
              <span className="absolute -bottom-2 left-0 h-px w-0 bg-gold transition-all duration-500 group-hover:w-full" />
            </button>
          ))}
        </div>

        {/* Derecha — búsqueda, carrito, menú mobile */}
        <div className="flex items-center gap-3 md:gap-5">
          {/* Búsqueda expandible */}
          <div className="flex items-center">
            <input
              type="text"
              value={query}
              onChange={(e) => enviarBusqueda(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              placeholder="Buscar fragancia…"
              className={`bg-transparent text-sm text-ivory placeholder:text-ivory/30 transition-all duration-500 ease-out border-b border-gold/30 focus:outline-none focus:border-gold ${
                searchOpen
                  ? "w-40 md:w-64 px-2 py-1 opacity-100"
                  : "w-0 opacity-0 px-0"
              }`}
            />
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="text-ivory/70 transition-colors hover:text-gold-champagne"
              aria-label="Buscar"
            >
              <Search className="h-5 w-5" strokeWidth={1.25} />
            </button>
          </div>

          {/* Carrito */}
          <button
            onClick={() => setAbrirCart(true)}
            className="relative text-ivory/80 transition-colors hover:text-gold-champagne"
            aria-label="Abrir carrito"
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={1.25} />
            {cantidadTotal > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-dark px-1 text-[0.55rem] font-semibold text-obsidian animate-scale-in">
                {cantidadTotal}
              </span>
            )}
          </button>

          {/* Menú mobile */}
          <button
            onClick={() => setMenuMobile((v) => !v)}
            className="text-ivory/80 md:hidden"
            aria-label="Menú"
          >
            {menuMobile ? (
              <X className="h-5 w-5" strokeWidth={1.25} />
            ) : (
              <Menu className="h-5 w-5" strokeWidth={1.25} />
            )}
          </button>
        </div>
      </div>

      {/* Menú mobile desplegable */}
      {menuMobile && (
        <div className="absolute top-full left-0 w-full bg-obsidian/95 backdrop-blur-xl border-b border-gold/10 md:hidden">
          <div className="flex flex-col px-6 py-4">
            {[
              { label: "Colección", id: "catalogo" },
              { label: "Importación", id: "importacion" },
              { label: "Favoritos", id: "favoritos" },
              { label: "Atelier", id: "atelier" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => irA(item.id)}
                className="py-3 text-left text-sm uppercase tracking-regal text-ivory/80 border-b border-gold/5 last:border-0"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

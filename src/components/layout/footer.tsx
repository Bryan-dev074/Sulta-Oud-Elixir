"use client";

import { Instagram, Facebook, MessageCircle } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/595982064334";

/**
 * Footer premium con iconografía de élite.
 * Redes sociales con drop-shadow dinámico y glow atenuado en hover.
 */
export function Footer() {
  return (
    <footer
      id="atelier"
      className="relative z-10 border-t border-gold/10 bg-coal/80 backdrop-blur-md"
    >
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10">
        {/* Bloque superior — promesa de marca */}
        <div className="mb-14 grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <h2 className="font-lapidary text-2xl tracking-regal text-ivory">
              SULTAN OUD
            </h2>
            <p className="text-elixir-shimmer font-display italic text-sm tracking-imperial">
              Elixir · Paraguay
            </p>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-ivory/55">
              Traemos las fragancias más codiciadas del Medio Oriente
              directamente desde Dubai. Autenticidad garantizada, entrega
              discreta y el respaldo del pago al recibir en todo el país.
            </p>
          </div>

          <div>
            <h3 className="eyebrow mb-5">Navegación</h3>
            <ul className="space-y-3 text-sm text-ivory/55">
              {[
                { label: "Colección", id: "catalogo" },
                { label: "Importación de Dubai", id: "importacion" },
                { label: "Favoritos del Sultán", id: "favoritos" },
              ].map((l) => (
                <li key={l.id}>
                  <button
                    onClick={() =>
                      document
                        .getElementById(l.id)
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="transition-colors hover:text-gold-champagne"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="eyebrow mb-5">Atelier</h3>
            <ul className="space-y-3 text-sm text-ivory/55">
              <li>Importación directa · Dubai → Paraguay</li>
              <li>Pago al recibir · Todo el territorio</li>
              <li>Entrega discreta y coordinada</li>
            </ul>
          </div>
        </div>

        {/* Divisor dorado */}
        <div className="gold-rule mx-auto mb-10" />

        {/* Bloque inferior — marca + redes + legal */}
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="text-center md:text-left">
            <p className="text-[0.65rem] uppercase tracking-imperial text-ivory/40">
              Pago al recibir en todo Paraguay
            </p>
          </div>

          {/* Redes sociales premium */}
          <div className="flex items-center gap-4">
            <a
              href="#"
              aria-label="Instagram"
              className="social-luxe is-instagram"
            >
              <Instagram className="h-5 w-5" strokeWidth={1.25} />
            </a>
            <a
              href="#"
              aria-label="Facebook"
              className="social-luxe is-facebook"
            >
              <Facebook className="h-5 w-5" strokeWidth={1.25} />
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="social-luxe is-whatsapp"
            >
              <MessageCircle className="h-5 w-5" strokeWidth={1.25} />
            </a>
          </div>

          <div className="text-center md:text-right">
            <p className="text-[0.65rem] uppercase tracking-regal text-ivory/30">
              © {new Date().getFullYear()} Sultan Oud Elixir
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { formatGs, precioEfectivo } from "@/lib/format";
import { CheckoutModal } from "./checkout-modal";

/**
 * Drawer lateral del carrito.
 * Vive en el layout para estar siempre disponible.
 * Conserva el estado del carrito al cerrar.
 */
export function CartSidebar() {
  const {
    items,
    abrirCart,
    setAbrirCart,
    cambiarCantidad,
    quitar,
    subtotal,
    cantidadTotal,
  } = useCart();

  const [checkoutAbierto, setCheckoutAbierto] = useState(false);

  const cerrarDrawer = () => {
    setAbrirCart(false);
  };

  const abrirCheckout = () => {
    setAbrirCart(false);
    setCheckoutAbierto(true);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-obsidian/80 backdrop-blur-sm transition-opacity duration-500 ${
          abrirCart ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={cerrarDrawer}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col border-l border-gold/15 bg-coal/95 backdrop-blur-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          abrirCart ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Carrito de compras"
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-gold/10 bg-obsidian/60 px-7 py-5">
          <div>
            <p className="eyebrow !justify-start">Tu selección</p>
            <h2 className="mt-1 font-display text-2xl text-ivory">
              {cantidadTotal > 0
                ? `${cantidadTotal} ${cantidadTotal === 1 ? "pieza" : "piezas"}`
                : "Cámara vacía"}
            </h2>
          </div>
          <button
            onClick={cerrarDrawer}
            className="text-ivory/50 transition-colors hover:text-gold-champagne"
            aria-label="Cerrar carrito"
          >
            <X className="h-5 w-5" strokeWidth={1.25} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-7 py-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-ivory/40">
              <ShoppingBag className="mb-5 h-12 w-12 opacity-20" strokeWidth={1} />
              <p className="text-sm">Tu colección está vacía.</p>
              <button
                onClick={() => {
                  cerrarDrawer();
                  document
                    .getElementById("catalogo")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="mt-4 text-[0.65rem] uppercase tracking-regal text-gold/70 underline-offset-4 hover:underline"
              >
                Explorar el catálogo
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((it) => {
                const precio = precioEfectivo(it.perfume);
                return (
                  <li
                    key={it.perfume.id}
                    className="flex gap-4 rounded-sm border border-gold/10 bg-ivory/[0.02] p-3"
                  >
                    <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-coal">
                      <Image
                        src={it.perfume.url_imagen}
                        alt={it.perfume.nombre}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <h4 className="font-display text-base leading-tight text-ivory">
                          {it.perfume.nombre}
                        </h4>
                        <p className="text-[0.55rem] uppercase tracking-regal text-gold/60">
                          {it.perfume.marca}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Selector cantidad */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              cambiarCantidad(it.perfume.id, it.cantidad - 1)
                            }
                            className="flex h-6 w-6 items-center justify-center rounded-full text-ivory/50 transition-colors hover:bg-gold/10 hover:text-gold-champagne"
                            aria-label="Restar"
                          >
                            {it.cantidad === 1 ? (
                              <Trash2 className="h-3 w-3" />
                            ) : (
                              <Minus className="h-3 w-3" />
                            )}
                          </button>
                          <span className="w-6 text-center text-xs text-ivory">
                            {it.cantidad}
                          </span>
                          <button
                            onClick={() =>
                              cambiarCantidad(it.perfume.id, it.cantidad + 1)
                            }
                            className="flex h-6 w-6 items-center justify-center rounded-full text-ivory/50 transition-colors hover:bg-gold/10 hover:text-gold-champagne"
                            aria-label="Sumar"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="font-display text-base text-gold-gradient">
                            {formatGs(precio * it.cantidad)}
                          </p>
                          <button
                            onClick={() => quitar(it.perfume.id)}
                            className="text-[0.55rem] uppercase tracking-regal text-ivory/30 hover:text-ivory/60"
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gold/10 bg-obsidian/60 px-7 py-6">
            <div className="mb-4 flex items-baseline justify-between">
              <span className="text-[0.6rem] uppercase tracking-regal text-ivory/50">
                Subtotal
              </span>
              <span className="font-display text-2xl text-ivory">
                {formatGs(subtotal)}
              </span>
            </div>
            <p className="mb-4 text-center text-[0.55rem] uppercase tracking-regal text-ivory/35">
              Descuentos y cupones se aplican al finalizar
            </p>

            <button
              onClick={abrirCheckout}
              className="btn-luxe flex w-full items-center justify-center gap-2"
            >
              Finalizar pedido
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </button>

            <button
              onClick={cerrarDrawer}
              className="mt-3 w-full text-center text-[0.6rem] uppercase tracking-regal text-ivory/45 transition-colors hover:text-gold-champagne"
            >
              Continuar comprando
            </button>
          </div>
        )}
      </aside>

      {/* Checkout modal */}
      <CheckoutModal
        abierto={checkoutAbierto}
        onClose={() => setCheckoutAbierto(false)}
      />
    </>
  );
}

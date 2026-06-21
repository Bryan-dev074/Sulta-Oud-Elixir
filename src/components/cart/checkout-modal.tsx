"use client";

import { useState } from "react";
import { X, MessageCircle, ShoppingBag, Tag, Check } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { formatGs } from "@/lib/format";
import { buildWhatsAppCheckoutUrl } from "@/lib/format";
import {
  DeliveryProfile,
  DeliveryData,
} from "@/components/cart/delivery-profile";

const WHATSAPP_NUMBER = "595982064334";

interface CheckoutModalProps {
  abierto: boolean;
  onClose: () => void;
}

/**
 * Modal de checkout.
 * - Permite aplicar cupón.
 * - Permite completar (opcionalmente) datos de delivery.
 * - El botón principal abre WhatsApp con el pedido completo hacia 595982064334.
 * - "Continuar comprando" cierra el modal sin vaciar el carrito.
 */
export function CheckoutModal({ abierto, onClose }: CheckoutModalProps) {
  const { items, subtotal, descuento, total, aplicarCodigo, quitarCupon, cuponAplicado, estadoCupon, vaciar } =
    useCart();

  const [codigo, setCodigo] = useState("");
  const [delivery, setDelivery] = useState<DeliveryData>({
    whatsapp: "",
    nombre: "",
    ciudad: "",
    direccion: "",
    indicaciones: "",
  });
  const [confirmado, setConfirmado] = useState(false);

  if (!abierto) return null;

  const aplicar = () => {
    if (!codigo.trim()) return;
    aplicarCodigo(codigo);
  };

  const enviarWhatsApp = () => {
    const url = buildWhatsAppCheckoutUrl(items, WHATSAPP_NUMBER, {
      nombre: delivery.nombre,
      ciudad: delivery.ciudad,
      direccion: delivery.direccion,
    });
    window.open(url, "_blank", "noopener,noreferrer");
    setConfirmado(true);
  };

  const continuarComprando = () => {
    setConfirmado(false);
    onClose();
    // El carrito se conserva intencionalmente.
  };

  const finalizarYLimpiar = () => {
    vaciar();
    setConfirmado(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[85] flex items-center justify-center overflow-y-auto p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Finalizar pedido"
    >
      <div
        className="absolute inset-0 bg-obsidian/92 backdrop-blur-xl"
        onClick={continuarComprando}
      />

      <div className="relative z-10 my-8 w-full max-w-lg">
        <div className="glass-luxe overflow-hidden rounded-sm">
          {/* Cabecera */}
          <div className="flex items-center justify-between border-b border-gold/10 bg-obsidian/60 px-7 py-5">
            <div>
              <p className="eyebrow !justify-start">Finalizar pedido</p>
              <h3 className="mt-1 font-display text-2xl text-ivory">
                {confirmado ? "Pedido enviado" : "Tu elixir te espera"}
              </h3>
            </div>
            <button
              onClick={continuarComprando}
              className="text-ivory/50 transition-colors hover:text-gold-champagne"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" strokeWidth={1.25} />
            </button>
          </div>

          {confirmado ? (
            /* ---------- Pantalla de confirmación ---------- */
            <div className="px-7 py-10 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#25D366]/30 bg-[#25D366]/10 text-[#25D366]">
                <Check className="h-7 w-7" strokeWidth={1.5} />
              </div>
              <p className="mx-auto max-w-sm text-sm leading-relaxed text-ivory/60">
                Abrimos WhatsApp con tu pedido listo para enviar. Nuestro
                asesor coordinará la entrega y el pago al recibir.
              </p>

              <div className="mt-6 rounded-sm border border-gold/15 bg-gold/[0.03] p-4">
                <p className="text-[0.55rem] uppercase tracking-regal text-gold/70">
                  Total a pagar al recibir
                </p>
                <p className="mt-1 font-display text-3xl text-gold-gradient">
                  {formatGs(total)}
                </p>
              </div>

              <div className="mt-7 flex flex-col gap-3">
                <button
                  onClick={continuarComprando}
                  className="btn-luxe w-full"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
                    Continuar comprando
                  </span>
                </button>
                <button
                  onClick={finalizarYLimpiar}
                  className="text-[0.6rem] uppercase tracking-regal text-ivory/40 transition-colors hover:text-ivory/70"
                >
                  Vaciar carrito y cerrar
                </button>
              </div>
            </div>
          ) : (
            /* ---------- Pantalla de checkout ---------- */
            <div className="max-h-[70vh] overflow-y-auto px-7 py-6">
              {/* Resumen */}
              <div className="mb-6 space-y-2">
                {items.map((it) => (
                  <div
                    key={it.perfume.id}
                    className="flex items-center justify-between text-sm text-ivory/70"
                  >
                    <span className="flex-1">
                      {it.perfume.nombre}
                      <span className="ml-1 text-ivory/35">×{it.cantidad}</span>
                    </span>
                    <span>{formatGs(
                      (it.perfume.en_oferta && it.perfume.precio_descuento != null
                        ? it.perfume.precio_descuento
                        : it.perfume.precio_regular) * it.cantidad
                    )}</span>
                  </div>
                ))}
              </div>

              {/* Cupón */}
              <div className="mb-6 border-t border-gold/10 pt-5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gold/50" strokeWidth={1.25} />
                    <input
                      type="text"
                      value={codigo}
                      onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                      placeholder="Código de descuento"
                      className="field-luxe !pl-7 uppercase"
                    />
                  </div>
                  <button
                    onClick={aplicar}
                    className="btn-ghost-luxe !px-4 !text-[0.6rem]"
                  >
                    Aplicar
                  </button>
                </div>
                {estadoCupon && (
                  <p
                    className={`mt-2 text-[0.65rem] ${
                      cuponAplicado ? "text-[#25D366]" : "text-ivory/45"
                    }`}
                  >
                    {estadoCupon}
                  </p>
                )}
                {cuponAplicado && (
                  <button
                    onClick={() => {
                      quitarCupon();
                      setCodigo("");
                    }}
                    className="mt-1 text-[0.6rem] uppercase tracking-regal text-ivory/35 hover:text-ivory/60"
                  >
                    Quitar cupón
                  </button>
                )}
              </div>

              {/* Perfil delivery */}
              <div className="mb-6">
                <DeliveryProfile value={delivery} onChange={setDelivery} />
              </div>

              {/* Totales */}
              <div className="space-y-2 border-t border-gold/10 pt-5 text-sm">
                <div className="flex justify-between text-ivory/55">
                  <span>Subtotal</span>
                  <span>{formatGs(subtotal)}</span>
                </div>
                {descuento > 0 && (
                  <div className="flex justify-between text-[#25D366]">
                    <span>Descuento</span>
                    <span>− {formatGs(descuento)}</span>
                  </div>
                )}
                <div className="flex items-baseline justify-between pt-2">
                  <span className="text-[0.6rem] uppercase tracking-regal text-ivory/50">
                    Total · pago al recibir
                  </span>
                  <span className="font-display text-3xl text-gold-gradient">
                    {formatGs(total)}
                  </span>
                </div>
              </div>

              {/* CTA principal — WhatsApp */}
              <button
                onClick={enviarWhatsApp}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#1faa52] to-[#25D366] py-4 text-[0.7rem] font-semibold uppercase tracking-regal text-obsidian transition-all hover:shadow-[0_0_40px_-8px_rgba(37,211,102,0.8)]"
              >
                <MessageCircle className="h-4 w-4" strokeWidth={2} />
                Pedir y pagar al recibir
              </button>

              {/* Continuar comprando */}
              <button
                onClick={continuarComprando}
                className="mt-3 w-full text-center text-[0.6rem] uppercase tracking-regal text-ivory/45 transition-colors hover:text-gold-champagne"
              >
                Continuar comprando
              </button>

              <p className="mt-4 text-center text-[0.55rem] uppercase tracking-regal text-ivory/30">
                Envío coordinado a todo Paraguay · Pago al recibir
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Info, EyeOff } from "lucide-react";

export interface DeliveryData {
  whatsapp: string;
  nombre: string;
  ciudad: string;
  direccion: string;
  indicaciones: string;
}

interface DeliveryProfileProps {
  value: DeliveryData;
  onChange: (d: DeliveryData) => void;
}

/**
 * Perfil opcional de delivery.
 * Acelera el pedido en Paraguay sin ser obligatorio.
 * Incluye tooltip animado de lujo que explica la discreción del paquete.
 */
export function DeliveryProfile({ value, onChange }: DeliveryProfileProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const set = <K extends keyof DeliveryData>(k: K, v: DeliveryData[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <p className="eyebrow !justify-start">Datos de entrega (opcional)</p>
        <span className="text-[0.55rem] uppercase tracking-regal text-ivory/30">
          Acelera tu próximo pedido
        </span>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-[0.6rem] uppercase tracking-regal text-ivory/45">
            WhatsApp
          </span>
          <input
            type="tel"
            value={value.whatsapp}
            onChange={(e) => set("whatsapp", e.target.value)}
            placeholder="0982 064 334"
            className="field-luxe"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-[0.6rem] uppercase tracking-regal text-ivory/45">
            Nombre
          </span>
          <input
            type="text"
            value={value.nombre}
            onChange={(e) => set("nombre", e.target.value)}
            placeholder="Cómo te llamas"
            className="field-luxe"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-[0.6rem] uppercase tracking-regal text-ivory/45">
            Ciudad
          </span>
          <input
            type="text"
            value={value.ciudad}
            onChange={(e) => set("ciudad", e.target.value)}
            placeholder="Asunción, Encarnación…"
            className="field-luxe"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-[0.6rem] uppercase tracking-regal text-ivory/45">
            Dirección
          </span>
          <input
            type="text"
            value={value.direccion}
            onChange={(e) => set("direccion", e.target.value)}
            placeholder="Calle y número"
            className="field-luxe"
          />
        </label>
      </div>

      {/* Indicaciones de delivery con tooltip de lujo */}
      <label className="block">
        <span className="mb-1 flex items-center gap-2 text-[0.6rem] uppercase tracking-regal text-ivory/45">
          Indicaciones para el delivery
          {/* Tooltip animado */}
          <button
            type="button"
            className="group relative flex h-4 w-4 items-center justify-center rounded-full border border-gold/30 text-gold/70 transition-colors hover:border-gold hover:text-gold-champagne"
            onMouseEnter={() => setTooltipOpen(true)}
            onMouseLeave={() => setTooltipOpen(false)}
            onFocus={() => setTooltipOpen(true)}
            onBlur={() => setTooltipOpen(false)}
            onClick={() => setTooltipOpen((v) => !v)}
            aria-label="Más información sobre la discreción del envío"
          >
            <Info className="h-2.5 w-2.5" strokeWidth={1.5} />

            {/* Tooltip */}
            <span
              className={`pointer-events-none absolute bottom-full right-0 z-20 mb-3 w-64 origin-bottom-right rounded-sm border border-gold/20 bg-obsidian/95 p-4 text-left text-[0.7rem] leading-relaxed text-ivory/70 shadow-[0_0_30px_-8px_rgba(212,175,55,0.4)] backdrop-blur-xl transition-all duration-300 ${
                tooltipOpen
                  ? "scale-100 opacity-100"
                  : "pointer-events-none scale-95 opacity-0"
              }`}
            >
              <EyeOff className="mb-2 h-3.5 w-3.5 text-gold" strokeWidth={1.5} />
              Esta información ayuda a que nuestro asistente de entrega
              localice tu residencia de forma rápida y preserve la
              discreción del paquete.
            </span>
          </button>
        </span>
        <textarea
          value={value.indicaciones}
          onChange={(e) => set("indicaciones", e.target.value)}
          placeholder="Color de casa, referencia cercana, horario preferido…"
          rows={2}
          className="field-luxe resize-none"
        />
      </label>
    </div>
  );
}

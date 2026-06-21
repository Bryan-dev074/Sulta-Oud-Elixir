import { Perfume, CartItem, Cupon, CuponResult } from "@/types/database";

/**
 * Formatea un monto en Guaraníes paraguayos (Gs.) sin decimales.
 */
export function formatGs(valor: number): string {
  const entero = Math.round(valor || 0);
  return `Gs. ${new Intl.NumberFormat("es-PY").format(entero)}`;
}

/**
 * Precio efectivo de un perfume (descuento si aplica, si no el regular).
 */
export function precioEfectivo(p: Pick<Perfume, "en_oferta" | "precio_descuento" | "precio_regular">): number {
  if (p.en_oferta && p.precio_descuento != null) {
    return p.precio_descuento;
  }
  return p.precio_regular;
}

/**
 * Construye la URL de WhatsApp hacia el número del Sultan, con el mensaje
 * personalizado exigido por el brief:
 *   "Quiero hacer un pedido del perfume [Nombre del Perfume]"
 * Reemplaza dinámicamente el nombre exacto de la fragancia.
 */
export function buildWhatsAppUrl(nombrePerfume: string, numero: string): string {
  const mensaje = `Quiero hacer un pedido del perfume ${nombrePerfume}`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

/**
 * Construye el mensaje de WhatsApp para un carrito completo (checkout).
 */
export function buildWhatsAppCheckoutUrl(
  items: CartItem[],
  numero: string,
  extras?: { nombre?: string; ciudad?: string; direccion?: string }
): string {
  const lineas = items
    .map((it, i) => {
      const unit = precioEfectivo(it.perfume);
      return `${i + 1}. ${it.perfume.nombre} (${it.perfume.marca}) — ${it.cantidad}u × ${formatGs(
        unit
      )} = ${formatGs(unit * it.cantidad)}`;
    })
    .join("\n");

  const subtotal = subtotalCarrito(items);
  const total = totalCarrito(items, null);

  const cuerpo = [
    "Hola Sultan Oud Elixir, quiero hacer el siguiente pedido:",
    "",
    lineas,
    "",
    `Subtotal: ${formatGs(subtotal)}`,
    `Total: ${formatGs(total)}`,
    "",
    extras?.nombre ? `Nombre: ${extras.nombre}` : "",
    extras?.ciudad ? `Ciudad: ${extras.ciudad}` : "",
    extras?.direccion ? `Dirección: ${extras.direccion}` : "",
    "Pago al recibir — Coordino la entrega por aquí.",
  ]
    .filter(Boolean)
    .join("\n");

  return `https://wa.me/${numero}?text=${encodeURIComponent(cuerpo)}`;
}

/** Subtotal sin descuento de cupón. */
export function subtotalCarrito(items: CartItem[]): number {
  return items.reduce((acc, it) => acc + precioEfectivo(it.perfume) * it.cantidad, 0);
}

/** Total aplicando cupón (si válido). */
export function totalCarrito(items: CartItem[], cupon: Cupon | null): number {
  const subtotal = subtotalCarrito(items);
  if (!cupon) return subtotal;
  const descuento = Math.round((subtotal * cupon.porcentaje_descuento) / 100);
  return Math.max(0, subtotal - descuento);
}

/** Descuento absoluto en Gs. por aplicar un cupón. */
export function descuentoCarrito(items: CartItem[], cupon: Cupon | null): number {
  if (!cupon) return 0;
  return Math.round((subtotalCarrito(items) * cupon.porcentaje_descuento) / 100);
}

/**
 * Valida un cupón contra una lista local de cupones válidos.
 * (El schema los define en Supabase; aquí se valida client-side con
 *  la lista que el Server Component pasa al cliente.)
 */
export function validarCupon(
  codigoIngresado: string,
  cupones: Cupon[]
): CuponResult {
  const limpio = codigoIngresado.trim().toUpperCase();
  if (!limpio) {
    return { valido: false, cupon: null, mensaje: "Ingresa un código." };
  }

  const encontrado = cupones.find((c) => c.codigo.toUpperCase() === limpio);

  if (!encontrado) {
    return { valido: false, cupon: null, mensaje: "Este código no existe." };
  }
  if (!encontrado.activo) {
    return { valido: false, cupon: null, mensaje: "Este código está inactivo." };
  }
  if (encontrado.fecha_expiracion && new Date(encontrado.fecha_expiracion) < new Date()) {
    return { valido: false, cupon: null, mensaje: "Este código ha expirado." };
  }
  if (encontrado.usos_actuales >= encontrado.limite_usos) {
    return { valido: false, cupon: null, mensaje: "Este código agotó sus usos." };
  }

  return {
    valido: true,
    cupon: encontrado,
    mensaje: `Código aplicado: ${encontrado.porcentaje_descuento}% de descuento.`,
  };
}

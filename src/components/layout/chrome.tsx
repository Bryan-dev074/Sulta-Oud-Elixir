"use client";

import { Navbar } from "@/components/layout/navbar";
import { ProductModal } from "@/components/catalog/product-modal";
import { useCatalog } from "@/hooks/use-catalog";

/**
 * "Chrome" de la app: navbar + modal global de producto.
 * Vive en el layout y necesita acceso al contexto de catálogo
 * (la búsqueda del navbar abre el modal; el modal vive una sola vez).
 * Es Client porque usa el hook useCatalog.
 */
export function Chrome() {
  const { perfumes, detalle, abrirDetalle } = useCatalog();
  return (
    <>
      <Navbar perfumes={perfumes} onSeleccionarPerfume={abrirDetalle} />
      <ProductModal perfume={detalle} onClose={() => abrirDetalle(null)} />
    </>
  );
}

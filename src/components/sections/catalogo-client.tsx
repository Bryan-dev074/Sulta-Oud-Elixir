"use client";

import { useState } from "react";
import { Perfume } from "@/types/database";
import { Favoritos } from "@/components/sections/favoritos";
import { Catalogo } from "@/components/sections/catalogo";
import { ProductModal } from "@/components/catalog/product-modal";

interface CatalogoClientProps {
  perfumes: Perfume[];
}

/**
 * Orquestador cliente de Favoritos + Catálogo + Modal de detalle.
 * Mantiene un único modal de producto activo para toda la home,
 * y conecta la búsqueda del navbar con el catálogo.
 */
export function CatalogoClient({ perfumes }: CatalogoClientProps) {
  const [detalle, setDetalle] = useState<Perfume | null>(null);
  const [query, setQuery] = useState("");

  const destacados = perfumes.filter((p) => p.destacado).slice(0, 6);

  return (
    <>
      <Favoritos perfumes={destacados} onAbrirDetalle={setDetalle} />
      <Catalogo
        perfumes={perfumes}
        query={query}
        onQueryChange={setQuery}
        onAbrirDetalle={setDetalle}
      />
      <ProductModal perfume={detalle} onClose={() => setDetalle(null)} />
    </>
  );
}

import { fetchCatalogo } from "@/lib/catalog";
import { Hero } from "@/components/sections/hero";
import { Importacion } from "@/components/sections/importacion";
import { CatalogoClient } from "@/components/sections/catalogo-client";

/**
 * Página principal — Server Component.
 * Obtiene el catálogo desde Supabase (con fallback elegante al seed local)
 * y lo pasa al cliente que orquesta Favoritos + Catálogo + Modal de detalle.
 */
export default async function HomePage() {
  const perfumes = await fetchCatalogo();

  return (
    <>
      <Hero />
      <Importacion />
      <CatalogoClient perfumes={perfumes} />
    </>
  );
}

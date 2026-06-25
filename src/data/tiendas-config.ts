/**
 * Las 11 tiendas de perfumes de Ciudad del Este que se scrapean de forma
 * AUTOMÁTICA y GRATUITA (precio en HTML crudo, fetch directo — sin API paga,
 * sin navegador headless). Verificadas por fetch directo (jun 2026).
 * Ver `scraping.md` para el detalle de cada una.
 *
 * (Se descartaron las que requerían API de scraping o cargaban precios por JS:
 *  el panel funciona solo con lo que es 100% automático y rápido.)
 */

export type Moneda = "USD" | "BRL" | "Gs";

export interface TiendaConfig {
  /** slug único (id en el código y la base). */
  id: string;
  nombre: string;
  /** host base, sin protocolo. */
  dominio: string;
  /** página de inicio / catálogo árabe. */
  urlBase: string;
  plataforma?: string;
  monedas?: Moneda[];
  /** Plantilla de URL de búsqueda por nombre/código ({q} = término). */
  busqueda?: string;
  /** Patrón de URL de la página de producto (documentación). */
  productoURL?: string;
  /** Lista de precios descargable (TXT/CSV), si existe. */
  listaDescargable?: string;
  /** 1 = nodo prioritario de costo mayorista. */
  prioridad?: number;
  notas?: string;
}

export const TIENDAS: TiendaConfig[] = [
  {
    id: "charme", nombre: "Charme Perfumería", dominio: "charmeperfumeria.com.br",
    urlBase: "https://charmeperfumeria.com.br/", plataforma: "VTEX",
    monedas: ["USD", "Gs"], productoURL: "https://charmeperfumeria.com.br/det.php?id={q}",
    busqueda: "https://charmeperfumeria.com.br/det.php?id={q}",
    listaDescargable: "https://charmeperfumeria.com.br/precos",
    prioridad: 1, notas: "Lista TSV descargable (PRODUTO\\tDESCRICAO\\tPRECO en USD). Mayorista nº1.",
  },
  {
    id: "elegancia", nombre: "Elegancia Company", dominio: "eleganciacompany.com",
    urlBase: "https://www.eleganciacompany.com/productos?menu_id=arabes",
    plataforma: "custom", monedas: ["USD", "Gs", "BRL"],
    productoURL: "https://www.eleganciacompany.com/productos/{categoria}/{id}",
    prioridad: 5, notas: "Precio rotulado SIN IVA + código por SKU. Ideal precio 'real'.",
  },
  {
    id: "aroma", nombre: "Aroma Store", dominio: "aromastore.com.py",
    urlBase: "https://aromastore.com.py/categoria/arabes", plataforma: "custom",
    monedas: ["BRL", "Gs", "USD"], productoURL: "https://aromastore.com.py/product/{slug}",
    prioridad: 4, notas: "100% árabe, atacado. Triple precio. Slug = marca-nombre-ml.",
  },
  {
    id: "shoppingchina", nombre: "Shopping China", dominio: "shoppingchina.com.py",
    urlBase: "https://www.shoppingchina.com.py/perfumeria", plataforma: "custom",
    monedas: ["Gs"], productoURL: "https://www.shoppingchina.com.py/producto/{slug}",
    notas: "Benchmark de precio minorista (megatienda).",
  },
  {
    id: "pontocom", nombre: "Ponto Com", dominio: "pontocom.com",
    urlBase: "https://www.pontocom.com/categoria/perfumes-arabes", plataforma: "custom",
    monedas: ["USD", "BRL"], listaDescargable: "https://www.pontocom.com/lista-txt",
    prioridad: 2, notas: "Lista descargable (302 → seguir con -L). Retail + mayoreo.",
  },
  {
    id: "pionner", nombre: "Pionner Shop", dominio: "pionnershop.com",
    urlBase: "https://www.pionnershop.com/perfumes-arabes1", plataforma: "OpenCart",
    monedas: ["USD", "BRL", "Gs"],
    busqueda: "https://www.pionnershop.com/index.php?route=product/search&search={q}",
    productoURL: "https://www.pionnershop.com/{slug}",
    prioridad: 3, notas: "YA IMPLEMENTADO. Precio en div.price-product: U$ / R$ / G$. 749 SKUs árabes.",
  },
  {
    id: "cellshop", nombre: "Cellshop", dominio: "cellshop.com.py",
    urlBase: "https://cellshop.com.py/", plataforma: "Magento",
    monedas: ["Gs"], notas: "Electro + perfumería. Selectores Magento .price.",
  },
  {
    id: "matrix", nombre: "Matrix Importados", dominio: "matriximportados.com.py",
    urlBase: "https://matriximportados.com.py/departamento/perfumaria/",
    plataforma: "WooCommerce", monedas: ["Gs"],
    notas: "Selector .woocommerce-Price-amount.",
  },
  {
    id: "terranova", nombre: "Shopping Terra Nova", dominio: "shoppingterranova.com.py",
    urlBase: "https://www.shoppingterranova.com.py/", plataforma: "custom",
    monedas: ["BRL", "Gs"], productoURL: "https://www.shoppingterranova.com.py/ProductoId_{id}",
    notas: "Producto en /ProductoId_{id},{cat}/.../NOMBRE.html.",
  },
  {
    id: "mega", nombre: "Mega Electrónicos", dominio: "megaeletronicos.com",
    urlBase: "https://www.megaeletronicos.com/", plataforma: "custom",
    monedas: ["USD", "BRL", "Gs"], productoURL: "https://www.megaeletronicos.com/producto/{slug}",
    prioridad: 6, notas: "Importador masivo (precio de revendedor). Multi-moneda.",
  },
  {
    id: "laperfumeria", nombre: "La Perfumería", dominio: "laperfumeria.com.py",
    urlBase: "https://laperfumeria.com.py/", plataforma: "WooCommerce",
    monedas: ["Gs"], notas: "WooCommerce, precios en HTML. Usar categoría árabe correcta.",
  },
];

/** Todas las tiendas se scrapean automáticamente (HTML directo). */
export const TIENDAS_AUTOMATICAS = TIENDAS;

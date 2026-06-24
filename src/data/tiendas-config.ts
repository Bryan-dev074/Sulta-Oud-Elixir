/**
 * Configuración de TODAS las tiendas del PDF `perfumes-arabes-cde.pdf`,
 * verificada por fetch directo (jun 2026). Ver `scraping.md` para el detalle.
 *
 * metodo:
 *   · "html"   → precio en HTML crudo, fetch directo (UrlFetchApp / fetch).
 *   · "api"    → bloquea fetch (403/Cloudflare) o renderiza por JS → usar
 *                API de scraping (Crawlbase/ScrapingBee).
 *   · "manual" → sin precios online (vitrina) o solo Instagram → Búsqueda Manual.
 *
 * El asistente de carga muestra TODAS estas tiendas en la tabla semáforo.
 */

export type MetodoScraping = "html" | "api" | "manual";
export type Moneda = "USD" | "BRL" | "Gs";

export interface TiendaConfig {
  /** slug único (id en el código y la base). */
  id: string;
  nombre: string;
  /** host base, sin protocolo. */
  dominio: string;
  /** página de inicio / catálogo árabe. */
  urlBase: string;
  metodo: MetodoScraping;
  plataforma?: string;
  monedas?: Moneda[];
  /** Plantilla de URL de búsqueda por nombre/código ({q} = término). */
  busqueda?: string;
  /** Patrón de URL de la página de producto (documentación). */
  productoURL?: string;
  /** Lista de precios descargable (TXT/CSV), si existe. */
  listaDescargable?: string;
  /** Handle de Instagram (para las solo-IG). */
  instagram?: string;
  /** 1 = nodo prioritario de costo mayorista. */
  prioridad?: number;
  notas?: string;
}

export const TIENDAS: TiendaConfig[] = [
  // ── 🟢 HTML directo (11) ──────────────────────────────────────────────────
  {
    id: "charme", nombre: "Charme Perfumería", dominio: "charmeperfumeria.com.br",
    urlBase: "https://charmeperfumeria.com.br/", metodo: "html", plataforma: "VTEX",
    monedas: ["USD", "Gs"], productoURL: "https://charmeperfumeria.com.br/det.php?id={q}",
    busqueda: "https://charmeperfumeria.com.br/det.php?id={q}",
    listaDescargable: "https://charmeperfumeria.com.br/precos",
    prioridad: 1, notas: "Lista TSV descargable (PRODUTO\\tDESCRICAO\\tPRECO en USD). Mayorista nº1.",
  },
  {
    id: "elegancia", nombre: "Elegancia Company", dominio: "eleganciacompany.com",
    urlBase: "https://www.eleganciacompany.com/productos?menu_id=arabes", metodo: "html",
    plataforma: "custom", monedas: ["USD", "Gs", "BRL"],
    productoURL: "https://www.eleganciacompany.com/productos/{categoria}/{id}",
    prioridad: 5, notas: "Precio rotulado SIN IVA + código por SKU. Ideal precio 'real'.",
  },
  {
    id: "aroma", nombre: "Aroma Store", dominio: "aromastore.com.py",
    urlBase: "https://aromastore.com.py/categoria/arabes", metodo: "html", plataforma: "custom",
    monedas: ["BRL", "Gs", "USD"], productoURL: "https://aromastore.com.py/product/{slug}",
    prioridad: 4, notas: "100% árabe, atacado. Triple precio. Slug = marca-nombre-ml.",
  },
  {
    id: "shoppingchina", nombre: "Shopping China", dominio: "shoppingchina.com.py",
    urlBase: "https://www.shoppingchina.com.py/perfumeria", metodo: "html", plataforma: "custom",
    monedas: ["Gs"], productoURL: "https://www.shoppingchina.com.py/producto/{slug}",
    notas: "Benchmark de precio minorista (megatienda).",
  },
  {
    id: "pontocom", nombre: "Ponto Com", dominio: "pontocom.com",
    urlBase: "https://www.pontocom.com/categoria/perfumes-arabes", metodo: "html", plataforma: "custom",
    monedas: ["USD", "BRL"], listaDescargable: "https://www.pontocom.com/lista-txt",
    prioridad: 2, notas: "Lista descargable (302 → seguir con -L). Retail + mayoreo.",
  },
  {
    id: "pionner", nombre: "Pionner Shop", dominio: "pionnershop.com",
    urlBase: "https://www.pionnershop.com/perfumes-arabes1", metodo: "html", plataforma: "OpenCart",
    monedas: ["USD", "BRL", "Gs"],
    busqueda: "https://www.pionnershop.com/index.php?route=product/search&search={q}",
    productoURL: "https://www.pionnershop.com/{slug}",
    prioridad: 3, notas: "YA IMPLEMENTADO. Precio en div.price-product: U$ / R$ / G$. 749 SKUs árabes.",
  },
  {
    id: "cellshop", nombre: "Cellshop", dominio: "cellshop.com.py",
    urlBase: "https://cellshop.com.py/", metodo: "html", plataforma: "Magento",
    monedas: ["Gs"], notas: "Electro + perfumería. Selectores Magento .price.",
  },
  {
    id: "matrix", nombre: "Matrix Importados", dominio: "matriximportados.com.py",
    urlBase: "https://matriximportados.com.py/departamento/perfumaria/", metodo: "html",
    plataforma: "WooCommerce", monedas: ["Gs"],
    notas: "Selector .woocommerce-Price-amount.",
  },
  {
    id: "terranova", nombre: "Shopping Terra Nova", dominio: "shoppingterranova.com.py",
    urlBase: "https://www.shoppingterranova.com.py/", metodo: "html", plataforma: "custom",
    monedas: ["BRL", "Gs"], productoURL: "https://www.shoppingterranova.com.py/ProductoId_{id}",
    notas: "Producto en /ProductoId_{id},{cat}/.../NOMBRE.html.",
  },
  {
    id: "mega", nombre: "Mega Electrónicos", dominio: "megaeletronicos.com",
    urlBase: "https://www.megaeletronicos.com/", metodo: "html", plataforma: "custom",
    monedas: ["USD", "BRL", "Gs"], productoURL: "https://www.megaeletronicos.com/producto/{slug}",
    prioridad: 6, notas: "Importador masivo (precio de revendedor). Multi-moneda.",
  },
  {
    id: "laperfumeria", nombre: "La Perfumería", dominio: "laperfumeria.com.py",
    urlBase: "https://laperfumeria.com.py/", metodo: "html", plataforma: "WooCommerce",
    monedas: ["Gs"], notas: "PDF la marcaba JS pero el HTML SÍ trae precios. Usar categoría árabe correcta.",
  },

  // ── 🟡 API de scraping (5: 403 / JS) ──────────────────────────────────────
  {
    id: "puntotienda", nombre: "Punto Tienda", dominio: "puntotienda.com.py",
    urlBase: "https://puntotienda.com.py/perfumes-arabes-en-paraguay/", metodo: "api",
    plataforma: "WordPress", notas: "Da HTTP 403 (WAF). Requiere API de scraping.",
  },
  {
    id: "nissei", nombre: "Nissei", dominio: "nissei.com",
    urlBase: "https://nissei.com/py/belleza-salud-cosmeticos/perfumes-y-fragancias", metodo: "api",
    plataforma: "VTEX", monedas: ["Gs"], notas: "HTTP 403 + render JS. API con render_js.",
  },
  {
    id: "macedonia", nombre: "Macedonia", dominio: "compras.macedonia.com.py",
    urlBase: "https://compras.macedonia.com.py/categoria-produto/perfumes/", metodo: "api",
    plataforma: "custom", notas: "HTTP 403 (mismo WAF que Punto Tienda). API de scraping.",
  },
  {
    id: "monalisa", nombre: "Shopping Monalisa", dominio: "monalisa.com.py",
    urlBase: "https://www.monalisa.com.py/", metodo: "api", plataforma: "custom",
    notas: "No responde a curl + render JS (lujo/diseñador). API con render_js.",
  },
  {
    id: "lapetisquera", nombre: "La Petisquera", dominio: "lapetisquera.com.py",
    urlBase: "https://lapetisquera.com.py/", metodo: "api", plataforma: "custom",
    notas: "No responde a curl. Tratar con API de scraping.",
  },

  // ── 🔴 Manual: vitrina sin precios ────────────────────────────────────────
  {
    id: "francia", nombre: "Francia Perfumes", dominio: "franciaperfumes.com",
    urlBase: "https://www.franciaperfumes.com/", metodo: "manual", plataforma: "custom",
    notas: "Vitrina sin precios reales online. Búsqueda Manual.",
  },

  // ── 🔴 Manual: solo Instagram (9) ─────────────────────────────────────────
  { id: "imperio", nombre: "Imperio Perfumes", dominio: "instagram.com", urlBase: "https://instagram.com/imperioperfumes_py", metodo: "manual", instagram: "@imperioperfumes_py", notas: "Mayorista + minorista. Solo IG/WhatsApp." },
  { id: "alhambra", nombre: "Distribuidora Perfumes Alhambra", dominio: "instagram.com", urlBase: "https://instagram.com/perfumesalhambra", metodo: "manual", instagram: "@perfumesalhambra", notas: "Distribuidor/mayorista (51K). Solo IG." },
  { id: "bissoux", nombre: "Bissoux", dominio: "instagram.com", urlBase: "https://instagram.com/bissoux.py", metodo: "manual", instagram: "@bissoux.py", notas: "Proveedor/mayoreo. Solo IG." },
  { id: "genove", nombre: "Genove", dominio: "instagram.com", urlBase: "https://instagram.com/genovepy", metodo: "manual", instagram: "@genovepy", notas: "Retail (18K). Solo IG." },
  { id: "perfumhadas", nombre: "Perfumhadas", dominio: "instagram.com", urlBase: "https://instagram.com/perfumhadas_py", metodo: "manual", instagram: "@perfumhadas_py", notas: "Retail. Solo IG." },
  { id: "elite", nombre: "Elite Store", dominio: "instagram.com", urlBase: "https://instagram.com/elitestorepy", metodo: "manual", instagram: "@elitestorepy", notas: "Retail. Solo IG." },
  { id: "sax", nombre: "SAX Department Store", dominio: "instagram.com", urlBase: "https://instagram.com/saxstore", metodo: "manual", instagram: "@saxstore", notas: "Department store. Solo IG." },
  { id: "ambar", nombre: "Perfumería Ámbar", dominio: "instagram.com", urlBase: "https://instagram.com/", metodo: "manual", instagram: "(verificar handle)", notas: "Microcentro CDE. Solo IG/TikTok." },
  { id: "amadeus", nombre: "Amadeus Perfumería", dominio: "instagram.com", urlBase: "https://instagram.com/", metodo: "manual", instagram: "(verificar handle)", notas: "Retail CDE. Solo IG." },
];

/** Tiendas que el scraper intenta automáticamente (html + api). */
export const TIENDAS_AUTOMATICAS = TIENDAS.filter((t) => t.metodo !== "manual");

/** Tiendas que arrancan en modo Búsqueda Manual. */
export const TIENDAS_MANUALES = TIENDAS.filter((t) => t.metodo === "manual");

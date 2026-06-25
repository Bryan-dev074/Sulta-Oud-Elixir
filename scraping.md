# Estrategia de Scraping — Tiendas de Perfumes Árabes (Ciudad del Este)

> ⚠️ **ESTADO ACTUAL (decisión de producto):** el panel funciona **única y
> exclusivamente con las 11 tiendas HTML directo** (gratis, sin API de scraping):
> Charme, Elegancia, Aroma, Shopping China, Ponto Com, Pionner, Cellshop, Matrix,
> Terra Nova, Mega Electrónicos y La Perfumería. Las 5 tiendas que requerían API
> (Punto Tienda, Nissei, Macedonia, Monalisa, La Petisquera) y las solo-Instagram
> fueron **descartadas**. No se usa ningún proveedor de scraping pago. Lo de abajo
> queda como **referencia histórica** del análisis completo.

> Generado a partir del PDF `perfumes-arabes-cde.pdf` + **verificación por fetch directo real** (jun 2026).
> Foco árabe: Lattafa · Al Haramain · Maison Alhambra · Afnan · Rasasi · Orientica · Al Wataniah.
> Precios en USD que se mueven con el dólar → **scrapear el mismo día** y multiplicar por la cotización (pestaña `Cotizaciones!A2`).

## Resumen ejecutivo

- **26 tiendas** en total: **17 con sitio web** + **9 solo Instagram**.
- Clasificación por método de obtención de precio:
  - 🟢 **HTML directo (11):** el precio está en el HTML crudo, se scrapea con `fetch`/`UrlFetchApp` sin navegador.
  - 🟡 **API de scraping (5):** bloquean el fetch directo (403/Cloudflare) o renderizan por JS → requieren Crawlbase/ScrapingBee.
  - 🔴 **Manual (10):** 1 web sin precios online (Francia Perfumes) + las 9 de Instagram → botón **Búsqueda Manual** por defecto.
- ⭐ **2 listas de precios descargables** (Charme TSV y Ponto Com) que evitan el crawling: bajás todo el catálogo de una.

## Tabla resumen

| Tienda | Dominio | Plataforma | Scrapeable | Monedas | Método recomendado |
|---|---|---|---|---|---|
| Charme Perfumería | charmeperfumeria.com.br | VTEX | 🟢 html | USD, Gs | **Lista TSV `/precos`** (código+precio) |
| Elegancia Company | eleganciacompany.com | custom | 🟢 html | USD, Gs, BRL | HTML directo (precio SIN IVA + código) |
| Aroma Store | aromastore.com.py | custom | 🟢 html | BRL, Gs (₲), USD | HTML directo `/product/{slug}` |
| Shopping China | shoppingchina.com.py | custom | 🟢 html | Gs | HTML directo |
| Ponto Com | pontocom.com | custom | 🟢 html | USD, BRL | **Lista `/lista-txt`** (302→seguir) |
| Pionner Shop | pionnershop.com | OpenCart | 🟢 html | USD, BRL, Gs | HTML directo (ya implementado) |
| Cellshop | cellshop.com.py | Magento | 🟢 html | Gs | HTML directo |
| Matrix Importados | matriximportados.com.py | WooCommerce | 🟢 html | Gs | HTML directo |
| Shopping Terra Nova | shoppingterranova.com.py | custom | 🟢 html | BRL, Gs | HTML directo `/ProductoId_{id}` |
| Mega Electrónicos | megaeletronicos.com | custom | 🟢 html | USD, BRL, Gs | HTML directo `/producto/...` |
| La Perfumería | laperfumeria.com.py | WooCommerce | 🟢 html | Gs (₲) | HTML directo (PDF decía JS, es HTML) |
| Punto Tienda | puntotienda.com.py | WordPress | 🟡 api | — | API de scraping (da **403**) |
| Nissei | nissei.com/py | VTEX | 🟡 api | Gs | API de scraping (da **403**) |
| Macedonia | compras.macedonia.com.py | custom | 🟡 api | — | API de scraping (da **403**) |
| Shopping Monalisa | monalisa.com.py | custom | 🟡 api | — | API de scraping (no responde a curl / JS) |
| La Petisquera | lapetisquera.com.py | custom | 🟡 api | — | API de scraping (no responde a curl) |
| Francia Perfumes | franciaperfumes.com | custom | 🔴 vitrina | Gs? | **Búsqueda Manual** (vitrina, sin precios reales) |

## Detalle por tienda (🟢 HTML directo)

### Charme Perfumería — `charmeperfumeria.com.br` ⭐ NODO PRIORITARIO
- **Plataforma:** VTEX. Producto en `/det.php?id=XXXX`.
- **⭐ Lista descargable:** `https://charmeperfumeria.com.br/precos` → **TSV** (text/plain, ~147 KB) con columnas `PRODUTO`(código) · `DESCRICAO` · `PRECO` (USD). Ej: `738253\tABERCROMBIE AUTHENTIC MOMENT EDP FEM 100ML\t55.00`. **No requiere crawling**: bajás el TXT y matcheás por descripción/código.
- **Búsqueda por código:** el código de la lista coincide con `det.php?id={código}`.
- **Selector precio (HTML):** clases VTEX `.price`, marcadores `U$`. Monedas: USD + Gs.
- **Mayorista nº1**, catálogo árabe más completo. Precio en USD.

### Elegancia Company — `eleganciacompany.com`
- **Producto:** `/productos/{categoria}/{id}` (ej `/productos/diversos/22240`).
- **Selector precio:** texto `precio` + `US$`/`gs`/`R$`. **Precio rotulado SIN IVA + código de producto por SKU** → ideal para comparar precio "real".
- **Búsqueda:** por nombre vía buscador del sitio; el código (SKU) aparece en la ficha.
- Monedas: USD, Gs, BRL.

### Aroma Store — `aromastore.com.py`
- **Producto:** `/product/{slug}` (ej `/product/perfume-afnan-9pm-30ml`). El slug incluye marca+nombre+ml.
- **Selector precio:** marcadores `R$` y `₲` (Gs) — triple precio USD/BRL/Gs según el PDF. HTML plano.
- 100% enfocada en árabe, con atención **Atacado** (mayorista).

### Shopping China — `shoppingchina.com.py`
- **Producto:** `/producto/...`. Megatienda importadora.
- **Selector precio:** `Gs.` + clase `price`. Solo Gs. **Benchmark de precio minorista** (si le ganás a Shopping China sos competitivo).

### Ponto Com — `pontocom.com` ⭐ NODO PRIORITARIO
- **⭐ Lista descargable:** `https://www.pontocom.com/lista-txt` → responde **302** (redirige); seguir con `curl -L` para obtener el TXT completo del catálogo. Evita crawlear.
- **Selector precio (HTML):** `U$` (55 ocurrencias) + `R$`. Monedas USD, BRL.
- Retail + mayoreo.

### Pionner Shop — `pionnershop.com` ✅ YA IMPLEMENTADO
- **Plataforma:** OpenCart. Producto con slug propio.
- **Selector precio:** dentro del `<div class="price-product">`, en 3 monedas marcadas: `U$ 36,00` · `R$ 189,00` · `G$ 226.800`.
- **Búsqueda por código:** `https://www.pionnershop.com/index.php?route=product/search&search={CODIGO}` → devuelve resultados con links a `/{slug}`; se sigue el primer link y se parsea.
- 749 SKUs árabes. Parser ya escrito en `src/lib/sheets-pipeline.ts` y replicado en el Apps Script.

### Cellshop — `cellshop.com.py`
- **Plataforma:** Magento. Producto bajo `/todos-los-departamentos/...` y fichas propias.
- **Selector precio:** clases Magento `.price` + `Gs.`. Solo Gs.

### Matrix Importados — `matriximportados.com.py`
- **Plataforma:** WooCommerce. Producto bajo `/departamento/perfumaria/...`.
- **Selector precio:** `.woocommerce-Price-amount` / `.price`. Gs.

### Shopping Terra Nova — `shoppingterranova.com.py`
- **Producto:** `/ProductoId_{id},{cat}/.../NOMBRE.html`.
- **Selector precio:** `price` + `R$`/`Gs.`/`G$`. Monedas BRL, Gs.

### Mega Electrónicos — `megaeletronicos.com`
- **Producto:** `/producto/{slug}` (categorías en `/producto/categoria/...`).
- **Selector precio:** `price` + `U$`/`R$`/`gs` (multi-moneda USD/BRL/Gs). Importador masivo que abastece revendedores → **buena fuente de costo**.

### La Perfumería — `laperfumeria.com.py`
- **Plataforma:** WooCommerce. (El PDF la marcaba "requiere JS", pero el **fetch directo SÍ trae precios en HTML** — ej `73.413`, `44.701` Gs. La URL `/marcas/arabes/` da 404; usar la categoría correcta de árabes.)
- **Selector precio:** `.woocommerce-Price-amount` + `₲`/`gs`. Solo Gs.

## Tiendas que requieren API de scraping (🟡)

Bloquean el `fetch` directo (Cloudflare/WAF 403) o renderizan precios por JavaScript. Para estas, el panel usa **Crawlbase o ScrapingBee** (render headless + rotación de IP):

| Tienda | Motivo | Nota |
|---|---|---|
| Punto Tienda | HTTP **403** (WAF) | WordPress; con API de scraping debería andar |
| Nissei | HTTP **403** (5.8 KB block page) | VTEX grande; requiere API + JS |
| Macedonia | HTTP **403** (misma página de bloqueo que Punto Tienda) | WAF compartido |
| Shopping Monalisa | curl no responde (timeout/TLS) + PDF dice JS | Lujo/diseñador; render headless |
| La Petisquera | curl no responde | "por verificar" en PDF; tratar como API |

> En estas, el parser de precio se aplica **sobre el HTML que devuelve la API de scraping** (mismo selector que tendría la tienda). Crawlbase: `https://api.crawlbase.com/?token=TOKEN&url=URL`. ScrapingBee: `https://app.scrapingbee.com/api/v1/?api_key=KEY&url=URL&render_js=true`.

## Tiendas imposibles / Búsqueda Manual (🔴)

- **Francia Perfumes** (`franciaperfumes.com`): el PDF la marca como **vitrina sin precios**; el fetch mostró números sospechosos (4.444, 11.111 — placeholders/teléfonos), no precios reales fiables → **Búsqueda Manual**.
- **9 tiendas solo Instagram** (sin catálogo web con precios) → **siempre Búsqueda Manual**:
  Imperio Perfumes (@imperioperfumes_py), Distribuidora Perfumes Alhambra (@perfumesalhambra), Bissoux (@bissoux.py), Genove (@genovepy), Perfumhadas (@perfumhadas_py), Elite Store (@elitestorepy), SAX Department Store (@saxstore), Perfumería Ámbar, Amadeus Perfumería.

Para estas, el panel muestra el botón **"Búsqueda Manual"** (abre la web/IG en una pestaña) y un input para pegar el precio a mano.

## Integración con el script de Google Sheets

El flujo actual del Sheets (scrapear por URL del producto y, si falla, buscar por código) se mapea así por tienda:

1. **Tiendas 🟢 HTML:** `UrlFetchApp.fetch(url_directa)` → parsear con el `selectorPrecio` de la tienda. Si la URL falla/cambia → construir la **URL de búsqueda por código** (ver detalle por tienda) → seguir el primer resultado → parsear.
2. **Charme y Ponto Com:** en vez de crawlear, **descargar la lista** (`/precos`, `/lista-txt`) una vez al día y matchear por código/descripción. Mucho más rápido y estable.
3. **Tiendas 🟡 API:** el `UrlFetchApp.fetch` apunta a la URL de la **API de scraping** envolviendo la URL real; el resto del parseo es igual.
4. **Tiendas 🔴 Manual:** no se scrapean; el precio se carga a mano.

El parser por tienda vive en `extraerPrecios_(html, tienda)` (Sheets) y en `extraerPrecios()` de `src/lib/sheets-pipeline.ts` (panel) — se agrega un bloque `if (tienda === 'X')` por cada dominio, reusando los selectores de este documento.

## Nodos prioritarios (mejores fuentes de costo mayorista scrapeables)

1. **Charme Perfumería** — lista TSV descargable, mayorista nº1, catálogo árabe enorme. **Empezar acá.**
2. **Ponto Com** — lista descargable + mayoreo.
3. **Pionner Shop** — 749 SKUs árabes, ya implementado, multi-moneda.
4. **Aroma Store** — 100% árabe, atacado, triple moneda.
5. **Elegancia Company** — precio SIN IVA rotulado + código (precio "real" sin impuesto).
6. **Mega Electrónicos** — importador masivo (precio de revendedor).
- Techo minorista para comparar: **Shopping China**, **Nissei**, **Macedonia**.

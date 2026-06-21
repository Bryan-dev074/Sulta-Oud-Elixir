# Sultan Oud Elixir — Next.js

E-commerce de fragancias árabes de ultra-lujo para Paraguay.
Importación directa de Dubai · Pago al recibir · Pedidos por WhatsApp.

## Stack

- **Next.js 14** (App Router) + **TypeScript** estricto + **Tailwind CSS**
- **Three.js / React Three Fiber** — fondo 3D orgánico de partículas
- **GSAP** — micro-interacciones y fichas de producto cinemáticas
- **lucide-react** — iconografía
- **Supabase** — base de datos de perfumes, cupones, perfiles y pedidos

## Puesta en marcha

```bash
# 1. Instalar dependencias (incl. Three.js, GSAP, Lucide, Supabase)
bash skills.sh

# 2. Modo desarrollo
npm run dev

# 3. Verificación estricta de tipos + build
npm run verify
```

## Base de datos (Supabase)

1. Abre el SQL Editor en tu proyecto de Supabase.
2. Pega y ejecuta `schema.sql` (raíz del repo).
3. Esto crea las tablas `perfumes`, `cupones`, `perfiles_usuario`, `pedidos`
   e inserta los 11 perfumes base con notas olfativas en JSON.

Credenciales (públicas, ya en `.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=https://fpzmdezcmbyplbdngcke.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_bHgBBQYPKg3QgHkL5H24MQ_yjB0pQw4
```

## Flujo de pedido

El botón principal de compra abre WhatsApp nativo hacia `595982064334`
con el mensaje: **"Quiero hacer un pedido del perfume [Nombre]"**.

## Despliegue en Vercel

1. Conecta el repo a Vercel.
2. Añade las variables `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `NEXT_PUBLIC_WHATSAPP_NUMBER`.
3. Deploy automático en `main`.

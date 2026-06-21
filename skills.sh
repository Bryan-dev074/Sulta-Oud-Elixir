#!/usr/bin/env bash
# ============================================================================
#  SULTAN OUD ELIXIR · Script de entorno y verificación
#  Uso:  bash skills.sh
# ============================================================================
#  Tareas que orquesta:
#   1. Instala dependencias pesadas del stack de lujo (Three.js, GSAP, etc.)
#   2. Audita tipos estrictos en tiempo real con tsc --noEmit
#   3. Construye el proyecto de verificación (build de producción)
# ============================================================================

set -e

echo "──────────────────────────────────────────────────────────"
echo "  SULTAN OUD ELIXIR · Preparando entorno de ultra-lujo"
echo "──────────────────────────────────────────────────────────"

# 1) Instalación de dependencias base
if [ ! -d "node_modules" ]; then
  echo "▸ Instalando dependencias del stack premium…"
  npm install
else
  echo "▸ node_modules ya presente — omitiendo instalación."
fi

# 2) Instalación explícita de dependencias pesadas (idempotente)
echo "▸ Verificando dependencias premium (Three.js · GSAP · Lucide · Supabase)…"
npm install --save \
  three@^0.169.0 \
  @react-three/fiber@^8.17.10 \
  @react-three/drei@^9.114.0 \
  gsap@^3.12.5 \
  lucide-react@^0.451.0 \
  @supabase/supabase-js@^2.45.4

npm install --save-dev \
  @types/three@^0.169.0

# 3) Auditoría de tipos estrictos en tiempo real
echo "▸ Auditoría de tipos estrictos (tsc --noEmit)…"
npx tsc --noEmit

# 4) Build de verificación (opcional — comentar para saltarlo)
echo "▸ Build de verificación de producción…"
npm run build

echo "──────────────────────────────────────────────────────────"
echo "  ✓ Entorno listo. Ejecuta:  npm run dev"
echo "──────────────────────────────────────────────────────────"

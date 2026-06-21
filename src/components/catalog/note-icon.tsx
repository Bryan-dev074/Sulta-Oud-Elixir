/**
 * Iconografía minimalista 2D de ingredientes olfativos.
 * Trazos finos (stroke 1), estilo contorno premium.
 * Renderiza el icono adecuado según el nombre de la nota (heurística por palabra clave).
 */
import { ReactNode } from "react";

const sw = 1;

function OudIcon() {
  // Madera ahumada: tablones + filamento de humo
  return (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth={sw}>
      <path d="M10 8 L10 32 M16 6 L16 34 M24 6 L24 34 M30 8 L30 32" />
      <path d="M14 18 Q20 14 26 18 M14 22 Q20 18 26 22" opacity="0.5" />
    </svg>
  );
}

function FloralIcon() {
  // Rosa/flor de 5 pétalos
  return (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth={sw}>
      <circle cx="20" cy="20" r="3.5" />
      <path d="M20 16.5 Q22 12 20 8 Q18 12 20 16.5 Z" />
      <path d="M20 23.5 Q22 28 20 32 Q18 28 20 23.5 Z" />
      <path d="M16.5 20 Q12 22 8 20 Q12 18 16.5 20 Z" />
      <path d="M23.5 20 Q28 22 32 20 Q28 18 23.5 20 Z" />
      <path d="M17.5 17.5 Q13 16 12 12 Q16 13 17.5 17.5 Z" />
      <path d="M22.5 17.5 Q27 16 28 12 Q24 13 22.5 17.5 Z" />
      <path d="M17.5 22.5 Q13 24 12 28 Q16 27 17.5 22.5 Z" />
      <path d="M22.5 22.5 Q27 24 28 28 Q24 27 22.5 22.5 Z" />
    </svg>
  );
}

function CitrusIcon() {
  // Cítrico rebanado
  return (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth={sw}>
      <circle cx="20" cy="20" r="12" />
      <circle cx="20" cy="20" r="4" />
      <path d="M20 8 L20 12 M20 28 L20 32 M8 20 L12 20 M28 20 L32 20 M11.5 11.5 L14 14 M26 26 L28.5 28.5 M28.5 11.5 L26 14 M14 26 L11.5 28.5" />
    </svg>
  );
}

function VanillaIcon() {
  // Vaina de vainilla curva
  return (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth={sw}>
      <path d="M10 30 Q12 18 22 10 Q28 6 30 10 Q32 14 28 18 Q18 26 10 30 Z" />
      <path d="M14 26 Q18 20 24 14" opacity="0.5" />
    </svg>
  );
}

function AmberIcon() {
  // Gota de ámbar
  return (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth={sw}>
      <path d="M20 6 Q28 18 28 24 Q28 31 20 34 Q12 31 12 24 Q12 18 20 6 Z" />
      <ellipse cx="17" cy="22" rx="3" ry="4" opacity="0.4" />
    </svg>
  );
}

function SpiceIcon() {
  // Especia: estrella de anís
  return (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth={sw}>
      <path d="M20 8 L22 18 L32 20 L22 22 L20 32 L18 22 L8 20 L18 18 Z" />
      <circle cx="20" cy="20" r="2" />
    </svg>
  );
}

function MuskIcon() {
  // Almizcle: ondas concéntricas
  return (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth={sw}>
      <circle cx="20" cy="20" r="3" />
      <circle cx="20" cy="20" r="7" opacity="0.6" />
      <circle cx="20" cy="20" r="11" opacity="0.4" />
      <circle cx="20" cy="20" r="15" opacity="0.25" />
    </svg>
  );
}

function WoodIcon() {
  // Madera / sándalo
  return (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth={sw}>
      <ellipse cx="20" cy="20" rx="14" ry="8" />
      <ellipse cx="20" cy="20" rx="9" ry="5" opacity="0.6" />
      <ellipse cx="20" cy="20" r="3" />
    </svg>
  );
}

function FruitIcon() {
  // Fruta (manzana/ciruela)
  return (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth={sw}>
      <path d="M20 12 Q14 12 12 20 Q12 30 20 32 Q28 30 28 20 Q26 12 20 12 Z" />
      <path d="M20 12 Q20 8 22 6" />
      <path d="M20 12 Q23 11 25 9" opacity="0.5" />
    </svg>
  );
}

function DefaultIcon() {
  // Gotita de perfume
  return (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth={sw}>
      <path d="M20 8 Q26 18 26 24 Q26 30 20 32 Q14 30 14 24 Q14 18 20 8 Z" />
    </svg>
  );
}

function elegirIcono(nota: string): ReactNode {
  const n = nota.toLowerCase();
  if (/(oud|mader|sándalo|sandalo|vetiver|cedro|pachul|abedul|cuero|resina)/.test(n)) {
    return n.includes("oud") || n.includes("ahumad") ? <OudIcon /> : <WoodIcon />;
  }
  if (/(rosa|flor|orqu|jazm|loto|azahar|geranio|heliotropo|prunela|lirio)/.test(n)) {
    return <FloralIcon />;
  }
  if (/(lim|bergamot|cítric|citric|naranj|mandar|manzan|cassis|grosell|ciruel|pera|frut|dát|datil|whisky)/.test(n)) {
    if (/(manzan|ciruel|pera|frut|dát|datil|whisky)/.test(n)) return <FruitIcon />;
    return <CitrusIcon />;
  }
  if (/(vainill|caramel|chocolat|pralin|azúcar|azucar|tonka|gourmand)/.test(n)) {
    return <VanillaIcon />;
  }
  if (/(ámbar|ambar|amber)/.test(n)) {
    return <AmberIcon />;
  }
  if (/(pimient|canel|cardamom|azafr|an|jengibre|cilantro|especi|tabaco|artemisia|salvia)/.test(n)) {
    return <SpiceIcon />;
  }
  if (/(almiz|musgo|ambrox|dracena|marine|iso|birch|myrr|mirr)/.test(n)) {
    return <MuskIcon />;
  }
  return <DefaultIcon />;
}

export function NoteIcon({ nota, className }: { nota: string; className?: string }) {
  return <span className={className}>{elegirIcono(nota)}</span>;
}

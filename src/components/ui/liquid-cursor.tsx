"use client";

import { useEffect, useRef } from "react";

/**
 * Cursor premium con físicas líquidas.
 *
 * Dos elementos:
 *  - núcleo dorado sólido que sigue el puntero con un retardo mínimo.
 *  - halo líquido que persigue con interpolación (lerp), generando la
 *    sensación de "goma/elástico" propia de interfaces de lujo.
 *
 * Se agranda al pasar sobre elementos interactivos ([data-cursor="luxe"]
 * o a/button). Respeta reduced-motion y se desactiva en pantallas táctiles.
 */
export function LiquidCursor() {
  const coreRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // No activar en dispositivos sin puntero fino
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const core = coreRef.current;
    const halo = haloRef.current;
    if (!core || !halo) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let haloX = mouseX;
    let haloY = mouseY;
    let scale = 1;
    let targetScale = 1;
    let frame = 0;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // El núcleo sigue casi instantáneamente
      core.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;

      // Detectar elementos interactivos bajo el cursor para agrandar el halo
      const el = document.elementFromPoint(mouseX, mouseY);
      const interactive = el?.closest(
        'a, button, [data-cursor="luxe"], input, [role="button"]'
      );
      targetScale = interactive ? 2.1 : 1;
    };

    const onDown = () => {
      targetScale = 0.7;
    };
    const onUp = () => {
      targetScale = 1;
    };

    const loop = () => {
      frame = requestAnimationFrame(loop);
      // Física líquida del halo: lerp suave
      const lerp = reduceMotion ? 1 : 0.18;
      haloX += (mouseX - haloX) * lerp;
      haloY += (mouseY - haloY) * lerp;
      scale += (targetScale - scale) * 0.15;

      halo.style.transform = `translate(${haloX - 20}px, ${haloY - 20}px) scale(${scale})`;
    };
    loop();

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  return (
    <>
      <div ref={haloRef} className="cursor-halo" aria-hidden="true" />
      <div ref={coreRef} className="cursor-core" aria-hidden="true" />
    </>
  );
}

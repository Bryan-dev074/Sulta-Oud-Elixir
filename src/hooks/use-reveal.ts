"use client";

import { useEffect, useRef } from "react";

/**
 * Hook de reveal al hacer scroll con IntersectionObserver (sin GSAP).
 * Más liviano y sin dependencia de ScrollTrigger para revelados simples.
 * Aplica fade-up con stagger opcional.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options?: { stagger?: number; delay?: number; y?: number }
) {
  const ref = useRef<T>(null);
  const { stagger = 0.08, delay = 0, y = 28 } = options ?? {};

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const items = Array.from(
      root.querySelectorAll<HTMLElement>("[data-reveal]")
    );
    if (items.length === 0) {
      items.push(root);
    }

    // Estado inicial
    items.forEach((el, i) => {
      if (reduceMotion) {
        el.style.opacity = "1";
        return;
      }
      el.style.opacity = "0";
      el.style.transform = `translateY(${y}px)`;
      el.style.transition = `opacity 0.8s cubic-bezier(0.22,1,0.36,1) ${
        delay + i * stagger
      }s, transform 0.8s cubic-bezier(0.22,1,0.36,1) ${delay + i * stagger}s`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [stagger, delay, y]);

  return ref;
}

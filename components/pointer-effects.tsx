"use client";

import { useEffect } from "react";

const glowSelector = ".service-card, .outcome-card, .work-card, .solution-tiles a, .capability-card";

/**
 * One delegated listener drives every pointer-reactive effect through CSS variables:
 * card spotlights, depth parallax inside cards, and a soft page-wide glow on fine pointers.
 */
export function PointerEffects() {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0; let x = 0; let y = 0; let target: Element | null = null;
    const root = document.documentElement;
    const apply = () => {
      frame = 0;
      root.style.setProperty("--cx", `${x}px`); root.style.setProperty("--cy", `${y}px`);
      if (target instanceof HTMLElement) {
        const r = target.getBoundingClientRect();
        target.style.setProperty("--mx", `${x - r.left}px`); target.style.setProperty("--my", `${y - r.top}px`);
        target.style.setProperty("--px", ((x - r.left) / r.width - 0.5).toFixed(3)); target.style.setProperty("--py", ((y - r.top) / r.height - 0.5).toFixed(3));
      }
    };
    const move = (e: PointerEvent) => { x = e.clientX; y = e.clientY; target = (e.target as Element).closest?.(glowSelector) ?? null; if (!frame) frame = requestAnimationFrame(apply); };
    root.classList.add("has-pointer-glow");
    window.addEventListener("pointermove", move, { passive: true });
    return () => { window.removeEventListener("pointermove", move); if (frame) cancelAnimationFrame(frame); root.classList.remove("has-pointer-glow"); };
  }, []);
  return null;
}

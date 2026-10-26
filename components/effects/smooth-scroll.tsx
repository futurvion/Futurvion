"use client";

import Lenis from "lenis";
import { useEffect } from "react";

/** Inertia scrolling; skipped entirely when the user prefers reduced motion. */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.1, anchors: false });
    let frame = requestAnimationFrame(function raf(time) { lenis.raf(time); frame = requestAnimationFrame(raf); });
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as Element).closest?.("a");
      if (!anchor || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey) return;
      const url = new URL(anchor.href, location.href);
      if (!url.hash || url.pathname !== location.pathname || url.origin !== location.origin) return;
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;
      event.preventDefault(); event.stopPropagation();
      lenis.scrollTo(target, { offset: -76, duration: 1.2 });
      history.pushState(null, "", url.hash);
    };
    document.addEventListener("click", onClick, true);
    return () => { document.removeEventListener("click", onClick, true); cancelAnimationFrame(frame); lenis.destroy(); };
  }, []);
  return null;
}

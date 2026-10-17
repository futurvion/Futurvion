"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const Scene = dynamic(() => import("./cta-scene").then(m => m.CtaScene), { ssr: false });
const query = "(min-width: 900px) and (prefers-reduced-motion: no-preference)";
const subscribe = (cb: () => void) => { const m = window.matchMedia(query); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb); };

/** Mounts the 3D helix only while its section is on screen, so it never competes with the hero canvas. */
export function CtaVisual() {
  const allowed = useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el || !allowed) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, [allowed]);
  return <div ref={ref} className="cta-visual" aria-hidden="true">{allowed && inView && <Scene />}</div>;
}

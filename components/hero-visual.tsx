"use client";

import dynamic from "next/dynamic";

const Scene = dynamic(() => import("./hero-scene").then(mod => mod.HeroScene), { ssr: false, loading: () => <div className="orb-fallback" aria-hidden="true" /> });
export function HeroVisual({ compact = false }: { compact?: boolean }) { return <Scene compact={compact} />; }

"use client";

import dynamic from "next/dynamic";

const Scene = dynamic(() => import("./hero-scene").then(mod => mod.HeroScene), { ssr: false, loading: () => <div className="orb-fallback" role="img" aria-label="Abstract glowing orb"><div className="orb-fallback-core" /></div> });
export function HeroVisual({ compact = false }: { compact?: boolean }) { return <Scene compact={compact} />; }

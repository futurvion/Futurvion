"use client";

import dynamic from "next/dynamic";
import Image from "next/image";

const Scene = dynamic(() => import("./hero-scene").then(mod => mod.HeroScene), { ssr: false, loading: () => <div className="orb-fallback" aria-hidden="true"><Image src="/logo-mark.png" alt="" width={512} height={451}/></div> });
export function HeroVisual({ compact = false, contained = false }: { compact?: boolean; contained?: boolean }) { return <Scene compact={compact} contained={contained} />; }

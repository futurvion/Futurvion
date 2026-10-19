import type { ReactNode } from "react";
import { HeroVisual } from "@/components/hero-visual";

/** Shared hero for inner pages: mono eyebrow, big headline, and the same talking orb as the home page. */
export function PageHero({ eyebrow, title, children, orb = true }: { eyebrow: ReactNode; title: ReactNode; children?: ReactNode; orb?: boolean }) {
  return <section className="inner-hero">
    {orb && <div className="inner-hero-orb"><HeroVisual compact /></div>}
    <div className="container inner-hero-grid">
      <div className="inner-hero-copy"><span className="eyebrow eyebrow-line"><span className="pulse-dot" />{eyebrow}</span><h1>{title}</h1>{children}</div>
    </div>
  </section>;
}
